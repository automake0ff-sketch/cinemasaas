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
