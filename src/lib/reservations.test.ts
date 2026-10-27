import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeFirestore } from "@/test/fakeFirestore";
const h = vi.hoisted(() => ({ fake: null as unknown }));
vi.mock("./firebase-admin", () => ({ db: () => h.fake, adminAuth: () => null }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => "TS" }, Timestamp: { fromMillis: (n: number) => n } }));
import { bookedBySlot, cancelReservation, createReservation } from "./reservations";
const base = { date: "2026-11-03", service: "cena" as const, party: 4, time: "21:00", name: "Ana", phone: "600112233", email: "a@b.es", idempotencyKey: "3f1c1d3e-8c2a-4a58-9b1e-2f0f6f8f0a11" };
let fake: ReturnType<typeof fakeFirestore>;
beforeEach(() => { fake = fakeFirestore(); h.fake = fake; });
describe("createReservation (transacción)", () => {
  it("crea la reserva y suma el aforo del turno", async () => { const r = await createReservation(base); expect(r).toEqual({ id: base.idempotencyKey, duplicate: false }); expect(fake.store.get("slots/2026-11-03_cena_2100")!.booked).toBe(4); expect(fake.store.get(`reservations/${base.idempotencyKey}`)!.status).toBe("confirmed"); });
  it("el reenvío idéntico no duplica ni suma aforo", async () => { await createReservation(base); const r = await createReservation(base); expect(r.duplicate).toBe(true); expect(fake.store.get("slots/2026-11-03_cena_2100")!.booked).toBe(4); });
  it("la misma clave con otros datos NO se da por buena", async () => { await createReservation(base); await expect(createReservation({ ...base, party: 2 })).rejects.toThrow("KEY_CONFLICT"); expect(fake.store.get("slots/2026-11-03_cena_2100")!.booked).toBe(4); });
  it("rechaza cuando se supera el aforo del turno", async () => { await createReservation({ ...base, party: 10 }); await createReservation({ ...base, party: 10, idempotencyKey: "00000000-0000-4000-8000-000000000001" }); await expect(createReservation({ ...base, party: 1, idempotencyKey: "00000000-0000-4000-8000-000000000002" })).rejects.toThrow("FULL"); });
  it("sin backend lanza NO_BACKEND", async () => { h.fake = null; await expect(createReservation(base)).rejects.toThrow("NO_BACKEND"); });
  it("cancelar libera el aforo", async () => { await createReservation(base); await cancelReservation(base.idempotencyKey, "admin1"); expect(fake.store.get("slots/2026-11-03_cena_2100")!.booked).toBe(0); expect(fake.store.get(`reservations/${base.idempotencyKey}`)!.status).toBe("cancelled"); });
  it("bookedBySlot devuelve el aforo por hora", async () => { await createReservation(base); expect(await bookedBySlot("2026-11-03", "cena")).toEqual({ "21:00": 4 }); });
});
