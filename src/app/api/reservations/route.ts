import { NextResponse } from "next/server";
import { restaurant } from "@/config/restaurant";
import { generateSlots } from "@/lib/availability";
import { createReservation } from "@/lib/reservations";
import { reservationSchema } from "@/lib/validation";
export async function POST(req: Request) {
  const parsed = reservationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  const r = parsed.data; const { open, close } = restaurant.services[r.service];
  if (!generateSlots(open, close).includes(r.time)) return NextResponse.json({ error: "Hora no disponible." }, { status: 409 });
  try {
    const out = await createReservation(r); // solo responde 201 tras confirmar la transacción
    return NextResponse.json({ ok: true, id: out.id }, { status: 201 });
  } catch (e) {
    const m = (e as Error).message;
    if (m === "FULL") return NextResponse.json({ error: "Ese turno está completo. Elige otra hora." }, { status: 409 });
    if (m === "NO_BACKEND") return NextResponse.json({ error: "Reservas online no activadas. Llama al restaurante." }, { status: 503 });
    return NextResponse.json({ error: "No se pudo completar la reserva." }, { status: 500 });
  }
}
