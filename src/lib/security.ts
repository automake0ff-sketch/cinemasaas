import { createHash } from "node:crypto";
import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
// Solo acepta POST del propio sitio (los navegadores siempre envían Origin en POST).
export function sameOrigin(req: Request) {
  const o = req.headers.get("origin"); if (!o) return false;
  try { return new URL(o).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host")); } catch { return false; }
}
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
// Nunca se guarda la IP ni el correo en claro en el limitador: solo un hash con sal.
export const hashId = (v: string) => createHash("sha256").update(v + (process.env.RATE_LIMIT_SALT ?? "")).digest("hex").slice(0, 32);
export type Hit = { ok: boolean; retryAfter: number };
const mem = new Map<string, { n: number; reset: number }>();
export const resetLimiter = () => mem.clear();
export function memHit(key: string, max: number, windowSec: number, now = Date.now()): Hit {
  if (mem.size > 5000) for (const [k, v] of mem) if (v.reset <= now) mem.delete(k);
  const e = mem.get(key);
  if (!e || e.reset <= now) { mem.set(key, { n: 1, reset: now + windowSec * 1000 }); return { ok: true, retryAfter: 0 }; }
  e.n++; return e.n > max ? { ok: false, retryAfter: Math.ceil((e.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}
// Limitador compartido entre instancias (Firestore); si falla, cae al limitador en memoria de la instancia.
export async function hit(bucket: string, id: string, max: number, windowSec: number, now = Date.now()): Promise<Hit> {
  const h = hashId(id), d = db();
  if (!d) return memHit(`${bucket}:${h}`, max, windowSec, now);
  try {
    const w = Math.floor(now / (windowSec * 1000)); const ref = d.collection("ratelimit").doc(`${bucket}_${h}_${w}`);
    return await d.runTransaction(async tx => {
      const s = await tx.get(ref); const n = (s.exists ? (s.data()!.n as number) : 0) + 1;
      tx.set(ref, { n, expireAt: Timestamp.fromMillis((w + 2) * windowSec * 1000) }); // activar TTL sobre expireAt en Firestore
      return n > max ? { ok: false, retryAfter: Math.ceil(((w + 1) * windowSec * 1000 - now) / 1000) } : { ok: true, retryAfter: 0 };
    });
  } catch { return memHit(`${bucket}:${h}`, max, windowSec, now); }
}
