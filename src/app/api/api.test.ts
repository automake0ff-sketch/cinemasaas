import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const h = vi.hoisted(() => ({ create: vi.fn(), booked: vi.fn() }));
vi.mock("@/lib/reservations", () => ({ createReservation: h.create, bookedBySlot: h.booked }));
vi.mock("@/lib/firebase-admin", () => ({ db: () => null, adminAuth: () => null }));
import { restaurant } from "@/config/restaurant";
import { resetLimiter } from "@/lib/security";
import { GET as availability } from "./availability/route";
import { GET as status } from "./booking-status/route";
import { POST } from "./reservations/route";

const body = { date: "2026-10-28", service: "comida", party: 2, time: "14:00", name: "Ana Pérez", phone: "600112233", email: "ana@mail.es", idempotencyKey: "3f1c1d3e-8c2a-4a58-9b1e-2f0f6f8f0a11" };
const post = (b: unknown, headers: Record<string, string> = {}) => POST(new Request("https://x.test/api/reservations", { method: "POST", headers: { origin: "https://x.test", host: "x.test", "x-forwarded-for": "9.9.9.9", "content-type": "application/json", ...headers }, body: typeof b === "string" ? b : JSON.stringify(b) }));
const avail = (qs: string) => availability(new Request(`https://x.test/api/availability?${qs}`, { headers: { "x-forwarded-for": "8.8.8.8" } }));
const saved = structuredClone(restaurant.services);
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-26T10:00:00Z")); resetLimiter(); h.create.mockReset(); h.booked.mockReset(); process.env.FIREBASE_SERVICE_ACCOUNT = "{}"; restaurant.services.comida = { open: "13:00", close: "16:00" }; restaurant.services.cena = { open: null, close: null }; });
afterEach(() => { vi.useRealTimers(); delete process.env.FIREBASE_SERVICE_ACCOUNT; Object.assign(restaurant.services, saved); });

describe("POST /api/reservations", () => {
  it("201 solo cuando createReservation confirma", async () => { h.create.mockResolvedValue({ id: body.idempotencyKey, duplicate: false }); const r = await post(body); expect(r.status).toBe(201); expect((await r.json()).id).toBe(body.idempotencyKey); expect(h.create).toHaveBeenCalledOnce(); });
  it("rechaza orígenes ajenos (403) y sin tocar el backend", async () => { const r = await post(body, { origin: "https://evil.test" }); expect(r.status).toBe(403); expect(h.create).not.toHaveBeenCalled(); });
  it("sin credenciales: 503 y nunca confirma", async () => { delete process.env.FIREBASE_SERVICE_ACCOUNT; const r = await post(body); expect(r.status).toBe(503); expect((await r.json()).code).toBe("NO_BACKEND"); expect(h.create).not.toHaveBeenCalled(); });
  it("sin horarios verificados: 503 NO_HOURS", async () => { restaurant.services.comida = { open: null, close: null }; const r = await post(body); expect(r.status).toBe(503); expect((await r.json()).code).toBe("NO_HOURS"); });
  it("datos inválidos: 400 con errores por campo", async () => { const r = await post({ ...body, email: "x", party: 99 }); expect(r.status).toBe(400); const j = await r.json(); expect(Object.keys(j.fieldErrors).sort()).toEqual(["email", "party"]); expect(h.create).not.toHaveBeenCalled(); });
  it("JSON roto, array y cuerpo enorme", async () => { expect((await post("{no json")).status).toBe(400); expect((await post("[]")).status).toBe(400); expect((await post("x".repeat(5000))).status).toBe(413); });
  it("honeypot relleno: 400", async () => { expect((await post({ ...body, website: "http://spam" })).status).toBe(400); expect(h.create).not.toHaveBeenCalled(); });
  it("hora fuera de los huecos del servicio: 409", async () => { const r = await post({ ...body, time: "22:00" }); expect(r.status).toBe(409); expect((await r.json()).code).toBe("SLOT_UNAVAILABLE"); });
  it("hora ya pasada o con menos de 2 h de antelación: 409", async () => { vi.setSystemTime(new Date("2026-10-26T10:30:00Z")); /* 11:30 Madrid: 13:00 queda a 1,5 h */ expect((await post({ ...body, date: "2026-10-26", time: "13:00" })).status).toBe(409); vi.setSystemTime(new Date("2026-10-26T10:00:00Z")); h.create.mockResolvedValue({ id: "x", duplicate: false }); expect((await post({ ...body, date: "2026-10-26", time: "13:00" })).status).toBe(201); /* justo 2 h: permitido */ expect((await post({ ...body, date: "2026-10-20" })).status).toBe(409); });
  it("día cerrado: 409", async () => { restaurant.closedDates.push("2026-10-28"); try { expect((await post(body)).status).toBe(409); } finally { restaurant.closedDates.pop(); } });
  it("turno completo: 409 FULL y mensaje claro", async () => { h.create.mockRejectedValue(new Error("FULL")); const r = await post(body); expect(r.status).toBe(409); expect((await r.json()).code).toBe("FULL"); });
  it("clave reutilizada con otros datos: 409 KEY_CONFLICT", async () => { h.create.mockRejectedValue(new Error("KEY_CONFLICT")); expect((await (await post(body)).json()).code).toBe("KEY_CONFLICT"); });
  it("error inesperado: 500 sin filtrar detalles ni confirmar", async () => { h.create.mockRejectedValue(new Error("boom con datos")); const r = await post(body); expect(r.status).toBe(500); expect(JSON.stringify(await r.json())).not.toContain("boom"); });
  it("límite por IP: la 6.ª solicitud válida recibe 429", async () => { h.create.mockResolvedValue({ id: "x", duplicate: false }); for (let i = 0; i < 5; i++) expect((await post({ ...body, email: `u${i}@m.es` })).status).toBe(201); const r = await post({ ...body, email: "u9@m.es" }); expect(r.status).toBe(429); expect(r.headers.get("retry-after")).toBeTruthy(); });
  it("respuestas no cacheables", async () => { h.create.mockResolvedValue({ id: "x", duplicate: false }); expect((await post(body)).headers.get("cache-control")).toBe("no-store"); });
});
describe("GET /api/availability", () => {
  const q = "date=2026-10-28&service=comida&party=2";
  it("devuelve solo huecos con aforo y respeta el servicio", async () => { h.booked.mockResolvedValue({ "13:00": 20, "13:30": 19 }); const j = await (await avail(q)).json(); expect(j.slots).not.toContain("13:00"); expect(j.slots).not.toContain("13:30"); expect(j.slots).toContain("14:00"); });
  it("todo completo: NO_SLOTS", async () => { h.booked.mockResolvedValue(Object.fromEntries(["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"].map(t => [t, 20]))); const j = await (await avail(q)).json(); expect(j).toEqual({ slots: [], code: "NO_SLOTS" }); });
  it("parámetros inválidos: 400", async () => { expect((await avail("date=2026-02-31&service=comida&party=2")).status).toBe(400); expect((await avail("date=2026-10-28&service=comida&party=abc")).status).toBe(400); });
  it("pasado y cerrado no consultan la base de datos", async () => { expect((await (await avail("date=2026-10-20&service=comida&party=2")).json()).code).toBe("PAST"); expect(h.booked).not.toHaveBeenCalled(); });
  it("servicio sin horario: 503 NO_HOURS; sin backend: 503", async () => { expect((await avail("date=2026-10-28&service=cena&party=2")).status).toBe(503); delete process.env.FIREBASE_SERVICE_ACCOUNT; expect((await (await avail(q)).json()).code).toBe("NO_BACKEND"); });
  it("fallo de Firestore: 502 sin inventar huecos", async () => { h.booked.mockRejectedValue(new Error("down")); const r = await avail(q); expect(r.status).toBe(502); expect((await r.json()).slots).toBeUndefined(); });
});
describe("GET /api/booking-status", () => {
  it("refleja el estado real y no expone secretos", async () => { const j = await (await status()).json(); expect(j.enabled).toBe(true); expect(j.today).toBe("2026-10-26"); expect(j.services).toEqual({ comida: true, cena: false }); expect(JSON.stringify(j)).not.toContain("FIREBASE"); delete process.env.FIREBASE_SERVICE_ACCOUNT; expect((await (await status()).json()).enabled).toBe(false); });
});
