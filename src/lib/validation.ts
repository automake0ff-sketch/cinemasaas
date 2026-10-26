import { z } from "zod";
export const reservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), service: z.enum(["comida", "cena"]),
  party: z.number().int().min(1).max(10), time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(2).max(80), phone: z.string().trim().min(9).max(20),
  email: z.string().trim().email(), notes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(8),
});
export type Reservation = z.infer<typeof reservationSchema>;
