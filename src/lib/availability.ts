import { restaurant } from "@/config/restaurant";
export function generateSlots(open: string | null, close: string | null, step = restaurant.slotMinutes): string[] {
  if (!open || !close) return []; // horarios sin verificar: no hay huecos
  const [oh, om] = open.split(":").map(Number), [ch, cm] = close.split(":").map(Number);
  const out: string[] = [];
  for (let m = oh * 60 + om; m <= ch * 60 + cm - step; m += step)
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
}
export const hasRoom = (booked: number, party: number, cap = restaurant.capacityPerSlot) => booked + party <= cap;
