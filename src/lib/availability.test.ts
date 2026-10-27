import { describe, it, expect } from "vitest";
import { generateSlots } from "./availability";
describe("generateSlots", () => {
  it("devuelve vacío sin horarios verificados", () => expect(generateSlots(null, null)).toEqual([]));
  it("genera huecos de 30 min", () => expect(generateSlots("13:00", "15:00")).toEqual(["13:00", "13:30", "14:00", "14:30"]));
});
import { hasRoom } from "./availability";
describe("hasRoom", () => {
  it("permite hasta la capacidad", () => expect(hasRoom(18, 2, 20)).toBe(true));
  it("rechaza si excede", () => expect(hasRoom(19, 2, 20)).toBe(false));
});
import { isBookable } from "./availability";
import { restaurant } from "@/config/restaurant";
describe("isBookable (Europe/Madrid)", () => {
  const now = new Date("2026-10-26T10:00:00Z"); // 11:00 en Madrid
  it("rechaza con menos de 2 h de antelación", () => expect(isBookable("2026-10-26", "12:00", now)).toBe(false));
  it("acepta con antelación suficiente", () => expect(isBookable("2026-10-26", "14:00", now)).toBe(true));
  it("rechaza más allá de la antelación máxima", () => expect(isBookable("2027-03-01", "14:00", now)).toBe(false));
  it("rechaza días de cierre", () => expect(isBookable("2026-10-28", "14:00", now, { ...restaurant, closedDates: ["2026-10-28"] })).toBe(false));
  it("rechaza días de la semana cerrados", () => expect(isBookable("2026-10-27", "14:00", now, { ...restaurant, closedWeekdays: [2] })).toBe(false));
});

import { addDays, dayStatus, isRealDate, madridToday } from "./availability";
describe("fechas y zona horaria Europe/Madrid", () => {
  it("rechaza fechas que no existen", () => { expect(isRealDate("2026-02-31")).toBe(false); expect(isRealDate("2028-02-29")).toBe(true); expect(isRealDate("2027-02-29")).toBe(false); expect(isBookable("2026-02-31", "14:00", new Date("2026-01-01T10:00:00Z"))).toBe(false); });
  it("el 'hoy' es el de Madrid, no el de UTC", () => expect(madridToday(new Date("2026-06-30T22:30:00Z"))).toBe("2026-07-01"));
  it("antelación mínima en verano: 09:00 Madrid → 11:00 no, 11:30 sí", () => { const now = new Date("2026-07-01T07:00:00Z"); expect(isBookable("2026-07-01", "10:30", now)).toBe(false); expect(isBookable("2026-07-01", "11:30", now)).toBe(true); });
  it("dayStatus: pasado, lejano, cerrado y abierto", () => {
    const now = new Date("2026-10-26T10:00:00Z");
    expect(dayStatus("2026-10-25", now)).toBe("PAST"); expect(dayStatus("2026-10-26", now)).toBe("OK");
    expect(dayStatus(addDays("2026-10-26", 61), now)).toBe("TOO_FAR");
    expect(dayStatus("2026-10-28", now, { ...restaurant, closedDates: ["2026-10-28"] })).toBe("CLOSED");
    expect(dayStatus("2026-10-27", now, { ...restaurant, closedWeekdays: [2] })).toBe("CLOSED");
  });
});
