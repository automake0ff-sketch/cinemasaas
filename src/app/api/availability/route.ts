import { NextResponse } from "next/server";
import { restaurant } from "@/config/restaurant";
import { generateSlots, hasRoom } from "@/lib/availability";
import { bookedBySlot } from "@/lib/reservations";
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const service = p.get("service") === "cena" ? "cena" : "comida";
  const date = p.get("date") ?? ""; const party = Number(p.get("party") ?? 1);
  const booked = /^\d{4}-\d{2}-\d{2}$/.test(date) ? await bookedBySlot(date, service) : null;
  if (!booked) return NextResponse.json({ error: "Reservas online no activadas todavía." }, { status: 503 });
  const { open, close } = restaurant.services[service];
  return NextResponse.json({ slots: generateSlots(open, close).filter(t => hasRoom(booked[t] ?? 0, party)) });
}
