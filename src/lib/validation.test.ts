import { describe, it, expect } from "vitest";
import { availabilityQuery, fieldErrors, reservationSchema } from "./validation";
const ok = { date: "2026-11-03", service: "cena", party: 4, time: "21:00", name: "Ana Pérez", phone: "+34 600 11 22 33", email: " ANA@Mail.com ", idempotencyKey: "3f1c1d3e-8c2a-4a58-9b1e-2f0f6f8f0a11" };
describe("reservationSchema (servidor)", () => {
  it("acepta datos válidos y normaliza teléfono y correo", () => { const r = reservationSchema.parse(ok); expect(r.phone).toBe("+34600112233"); expect(r.email).toBe("ana@mail.com"); });
  it("rechaza fechas inexistentes", () => expect(reservationSchema.safeParse({ ...ok, date: "2026-02-31" }).success).toBe(false));
  it("rechaza comensales fuera de rango y no enteros", () => { for (const party of [0, 11, 2.5, -1]) expect(reservationSchema.safeParse({ ...ok, party }).success).toBe(false); });
  it("rechaza hora mal formada", () => { for (const time of ["25:00", "9:00", "21:75", "abc"]) expect(reservationSchema.safeParse({ ...ok, time }).success).toBe(false); });
  it("rechaza teléfono y correo inválidos", () => { expect(reservationSchema.safeParse({ ...ok, phone: "12345" }).success).toBe(false); expect(reservationSchema.safeParse({ ...ok, email: "a@b" }).success).toBe(false); });
  it("exige clave de idempotencia UUID", () => expect(reservationSchema.safeParse({ ...ok, idempotencyKey: "corta" }).success).toBe(false));
  it("rechaza campos desconocidos", () => expect(reservationSchema.safeParse({ ...ok, admin: true }).success).toBe(false));
  it("limpia caracteres de control y limita las notas", () => { expect(reservationSchema.parse({ ...ok, notes: "sin\u0000 gluten" }).notes).toBe("sin gluten"); expect(reservationSchema.safeParse({ ...ok, notes: "x".repeat(501) }).success).toBe(false); });
  it("devuelve errores por campo", () => { const r = reservationSchema.safeParse({ ...ok, name: "A", email: "x" }); expect(r.success).toBe(false); if (!r.success) expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(["email", "name"]); });
});
describe("availabilityQuery", () => {
  it("convierte party a número y valida", () => { expect(availabilityQuery.parse({ date: "2026-11-03", service: "comida", party: "3" }).party).toBe(3); expect(availabilityQuery.safeParse({ date: "2026-13-01", service: "comida", party: "3" }).success).toBe(false); expect(availabilityQuery.safeParse({ date: "2026-11-03", service: "brunch", party: "3" }).success).toBe(false); });
});
