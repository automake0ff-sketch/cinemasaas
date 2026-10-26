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
