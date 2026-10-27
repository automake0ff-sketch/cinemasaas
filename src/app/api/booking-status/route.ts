import { NextResponse } from "next/server";
import { restaurant } from "@/config/restaurant";
import { addDays, madridToday } from "@/lib/availability";
import { bookingStatus, serviceHasHours } from "@/lib/booking";
export const runtime = "nodejs";
// Estado público de las reservas online: nada sensible (sin credenciales ni datos de reservas).
export async function GET() {
  const today = madridToday();
  return NextResponse.json({
    ...bookingStatus(), today, maxDate: addDays(today, restaurant.maxAdvanceDays),
    minParty: restaurant.minParty, maxParty: restaurant.maxParty,
    services: { comida: serviceHasHours("comida"), cena: serviceHasHours("cena") },
    phone: restaurant.phone, officialUrl: restaurant.officialUrl,
  }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
}
