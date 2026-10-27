import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { carta, cartaMeta, formatPrice, validateCarta } from "./carta";
import { menuJsonLd } from "@/lib/menuJsonLd";
import { fixture, fixtureMeta } from "@/test/cartaFixture";

describe("carta real (src/config/carta.ts)", () => {
  it("es coherente y está verificada: sin errores de validación", () => expect(validateCarta(carta, cartaMeta)).toEqual([]));
  it("las fotos referenciadas existen en /public", () => { for (const c of carta) for (const d of c.dishes) if (d.photo) expect(existsSync(path.join("public", d.photo.src)), d.id).toBe(true); });
  it("estado actual: sin platos inventados (pendiente de carta oficial)", () => { expect(carta).toEqual([]); expect(cartaMeta).toBeNull(); });
});
describe("validateCarta", () => {
  it("acepta el fixture", () => expect(validateCarta(fixture, fixtureMeta)).toEqual([]));
  it("exige fuente y fecha cuando hay platos", () => { expect(validateCarta(fixture, null)).toContain("Falta cartaMeta (fuente y fecha de verificación)."); expect(validateCarta(fixture, { source: "x", verifiedOn: "15/01/2026" }).length).toBe(1); });
  it("detecta ids repetidos, precios no válidos, alérgenos desconocidos y fotos sin alt", () => {
    const bad = structuredClone(fixture); const d = bad[0].dishes;
    d[1].id = "p1"; d[2].price = -3; d[3].allergens = ["marcianos" as never]; d[0].photo!.alt = " "; bad[1].dishes = [];
    const e = validateCarta(bad, fixtureMeta).join("|");
    for (const k of ["repetido: p1", "precio no válido", "alérgeno desconocido", "foto sin src", "sin platos"]) expect(e).toContain(k);
  });
});
describe("formatPrice y JSON-LD", () => {
  it("formato es-ES con euro", () => { expect(formatPrice(12.5).replace(/\s/g, " ")).toBe("12,50 €"); });
  it("sin carta no hay datos estructurados; con carta solo lo existente", () => {
    expect(menuJsonLd([])).toBeUndefined();
    const m = menuJsonLd(fixture)!; const items = m.hasMenuSection[0].hasMenuItem;
    expect(items[0].offers).toEqual({ "@type": "Offer", price: "12.50", priceCurrency: "EUR" });
    expect(items[1]).not.toHaveProperty("offers"); // precio por formatos: no se inventa uno único
    expect(items[2]).not.toHaveProperty("description");
  });
});
