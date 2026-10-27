import { NextResponse } from "next/server";
import { restaurant } from "@/config/restaurant";
import { generateSlots, isBookable } from "@/lib/availability";
import { bookingStatus } from "@/lib/booking";
import { createReservation } from "@/lib/reservations";
import { clientIp, hit, memHit, sameOrigin } from "@/lib/security";
import { fieldErrors, reservationSchema } from "@/lib/validation";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const json = (b: object, status: number, headers: Record<string, string> = {}) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store", ...headers } });
const limited = (retryAfter: number) => json({ error: "Demasiados intentos. Inténtalo de nuevo más tarde o llama al restaurante.", code: "RATE_LIMITED", retryAfter }, 429, { "Retry-After": String(retryAfter) });

export async function POST(req: Request) {
  // 1) Origen, tamaño y límite general (antes de tocar nada más)
  if (!sameOrigin(req)) return json({ error: "Solicitud no permitida.", code: "FORBIDDEN" }, 403);
  const ip = clientIp(req);
  const g = memHit(`res-all:${ip}`, 30, 600); if (!g.ok) return limited(g.retryAfter);
  const text = await req.text(); if (text.length > 4000) return json({ error: "Solicitud demasiado grande.", code: "INVALID" }, 413);
  // 2) Estado del backend: sin credenciales u horarios, NUNCA se simula una reserva
  const st = bookingStatus(); if (!st.enabled) return json({ error: "Las reservas online todavía no están activadas. Contacta con el restaurante.", code: st.reason }, 503);
  // 3) Validación en servidor
  let raw: unknown; try { raw = JSON.parse(text); } catch { return json({ error: "Datos no válidos.", code: "INVALID" }, 400); }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return json({ error: "Datos no válidos.", code: "INVALID" }, 400);
  const { website, ...body } = raw as Record<string, unknown>;
  if (typeof website === "string" && website.length > 0) return json({ error: "Datos no válidos.", code: "INVALID" }, 400); // honeypot
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Revisa los campos marcados.", code: "INVALID", fieldErrors: fieldErrors(parsed.error) }, 400);
  const r = parsed.data;
  // 4) Límites por IP y por correo (solo intentos válidos; se guardan con hash)
  const a = await hit("res-ip", ip, 5, 600); if (!a.ok) return limited(a.retryAfter);
  const b = await hit("res-mail", r.email, 5, 3600); if (!b.ok) return limited(b.retryAfter);
  // 5) Horario real: hueco del servicio, día abierto, antelación mínima/máxima (Europe/Madrid)
  const { open, close } = restaurant.services[r.service];
  if (!generateSlots(open, close).includes(r.time) || !isBookable(r.date, r.time)) return json({ error: "Ese horario ya no está disponible. Elige otro.", code: "SLOT_UNAVAILABLE" }, 409);
  // 6) Transacción: solo se responde 201 cuando Firestore la ha confirmado
  try {
    const out = await createReservation(r);
    return json({ ok: true, id: out.id, duplicate: out.duplicate }, 201);
  } catch (e) {
    const m = (e as Error).message;
    if (m === "FULL") return json({ error: "Ese turno se acaba de completar. Elige otra hora.", code: "FULL" }, 409);
    if (m === "KEY_CONFLICT") return json({ error: "Este envío ya se usó con otros datos. Vuelve a confirmar.", code: "KEY_CONFLICT" }, 409);
    if (m === "NO_BACKEND") return json({ error: "Las reservas online todavía no están activadas. Contacta con el restaurante.", code: "NO_BACKEND" }, 503);
    console.error("reservation_failed", m); // sin datos personales
    return json({ error: "No se pudo completar la reserva. No se ha registrado nada; inténtalo de nuevo.", code: "UNAVAILABLE" }, 500);
  }
}
