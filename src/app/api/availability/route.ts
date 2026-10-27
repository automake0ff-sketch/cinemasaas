import { NextResponse } from "next/server";
import { restaurant } from "@/config/restaurant";
import { dayStatus, generateSlots, hasRoom, isBookable } from "@/lib/availability";
import { bookingStatus, serviceHasHours } from "@/lib/booking";
import { bookedBySlot } from "@/lib/reservations";
import { clientIp, memHit } from "@/lib/security";
import { availabilityQuery } from "@/lib/validation";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const json = (b: object, status = 200, headers: Record<string, string> = {}) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store", ...headers } });
export async function GET(req: Request) {
  const rl = memHit(`avail:${clientIp(req)}`, 60, 60);
  if (!rl.ok) return json({ error: "Demasiadas consultas. Espera un momento.", code: "RATE_LIMITED", retryAfter: rl.retryAfter }, 429, { "Retry-After": String(rl.retryAfter) });
  const p = new URL(req.url).searchParams;
  const q = availabilityQuery.safeParse({ date: p.get("date"), service: p.get("service"), party: p.get("party") });
  if (!q.success) return json({ error: "Consulta no válida.", code: "INVALID" }, 400);
  const { date, service, party } = q.data;
  const st = bookingStatus();
  if (!st.enabled) return json({ error: "Las reservas online todavía no están activadas.", code: st.reason }, 503);
  if (!serviceHasHours(service)) return json({ error: `El servicio de ${service} todavía no admite reservas online.`, code: "NO_HOURS" }, 503);
  const day = dayStatus(date); if (day !== "OK") return json({ slots: [], code: day });
  let booked: Record<string, number> | null;
  try { booked = await bookedBySlot(date, service); } catch { return json({ error: "No se pudo consultar la disponibilidad. Inténtalo de nuevo.", code: "UNAVAILABLE" }, 502); }
  if (!booked) return json({ error: "Las reservas online todavía no están activadas.", code: "NO_BACKEND" }, 503);
  const { open, close } = restaurant.services[service];
  const slots = generateSlots(open, close).filter(t => isBookable(date, t) && hasRoom(booked![t] ?? 0, party));
  return json(slots.length ? { slots } : { slots, code: "NO_SLOTS" });
}
