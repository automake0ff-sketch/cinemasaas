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
// Fecha YYYY-MM-DD que exista de verdad en el calendario (rechaza 2026-02-31).
export function isRealDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
// Hora de pared en Europe/Madrid como minutos (comparable entre sí; no es epoch real).
const wall = (date: string, time = "00:00") => {
  const [y, m, d] = date.split("-").map(Number); const [h, mi] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h, mi) / 60000;
};
export function madridWall(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: restaurant.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) / 60000;
}
export const madridToday = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: restaurant.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
export function addDays(date: string, n: number) { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); }
export type DayStatus = "OK" | "PAST" | "TOO_FAR" | "CLOSED";
export function dayStatus(date: string, now = new Date(), cfg: typeof restaurant = restaurant): DayStatus {
  const today = madridToday(now);
  if (date < today) return "PAST";
  if (date > addDays(today, cfg.maxAdvanceDays)) return "TOO_FAR";
  const dow = new Date(wall(date) * 60000).getUTCDay();
  if (cfg.closedDates.includes(date) || cfg.closedWeekdays.includes(dow)) return "CLOSED";
  return "OK";
}
export function isBookable(date: string, time: string, now = new Date(), cfg: typeof restaurant = restaurant) {
  if (!isRealDate(date)) return false;
  const [y, m, d] = date.split("-").map(Number); const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (cfg.closedDates.includes(date) || cfg.closedWeekdays.includes(dow)) return false;
  const diff = wall(date, time) - madridWall(now);
  return diff >= cfg.minAdvanceHours * 60 && diff <= cfg.maxAdvanceDays * 1440;
}
