import { restaurant } from "@/config/restaurant";
import { generateSlots } from "./availability";
export type Service = "comida" | "cena";
export const serviceHasHours = (s: Service, cfg: typeof restaurant = restaurant) => generateSlots(cfg.services[s].open, cfg.services[s].close).length > 0;
export type BookingReason = "NO_BACKEND" | "NO_HOURS";
// "enabled" solo si hay backend (credenciales) Y al menos un servicio con horario verificado.
export function bookingStatus(cfg: typeof restaurant = restaurant, env: NodeJS.ProcessEnv = process.env): { enabled: boolean; reason?: BookingReason } {
  if (!env.FIREBASE_SERVICE_ACCOUNT) return { enabled: false, reason: "NO_BACKEND" };
  if (!serviceHasHours("comida", cfg) && !serviceHasHours("cena", cfg)) return { enabled: false, reason: "NO_HOURS" };
  return { enabled: true };
}
