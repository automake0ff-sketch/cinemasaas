import { z } from "zod";
import { restaurant } from "@/config/restaurant";
import { isRealDate } from "./availability";
const noCtl = (s: string) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
export const reservationSchema = z.object({
  date: z.string().refine(isRealDate, "Fecha no válida."),
  service: z.enum(["comida", "cena"], { message: "Elige comida o cena." }),
  party: z.number({ message: "Indica el número de comensales." }).int("Número no válido.").min(restaurant.minParty, `Mínimo ${restaurant.minParty}.`).max(restaurant.maxParty, `Máximo ${restaurant.maxParty}. Para grupos mayores, contacta con el restaurante.`),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida."),
  name: z.string().transform(noCtl).pipe(z.string().min(2, "Indica tu nombre.").max(80, "Nombre demasiado largo.")),
  phone: z.string().transform(s => s.replace(/[\s().-]/g, "")).pipe(z.string().regex(/^\+?\d{9,15}$/, "Teléfono no válido (9 a 15 dígitos).")),
  email: z.string().trim().toLowerCase().max(120, "Correo demasiado largo.").pipe(z.string().email("Correo no válido.")),
  notes: z.string().transform(noCtl).pipe(z.string().max(500, "Máximo 500 caracteres.")).optional().transform(v => v || undefined),
  idempotencyKey: z.string().uuid("Identificador de envío no válido."),
}).strict();
export type Reservation = z.infer<typeof reservationSchema>;
export const availabilityQuery = z.object({
  date: z.string().refine(isRealDate, "Fecha no válida."),
  service: z.enum(["comida", "cena"]),
  party: z.coerce.number().int().min(restaurant.minParty).max(restaurant.maxParty),
});
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) { const k = String(i.path[0] ?? "form"); out[k] ??= i.message; }
  return out;
}
