import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/image", () => ({ default: (p: { src: string; alt: string }) => createElement("img", { src: p.src, alt: p.alt }) }));
import CartaExplorer from "./CartaExplorer";
import { fixture, fixtureMeta } from "@/test/cartaFixture";
const html = (cats = fixture, meta: typeof fixtureMeta | null = fixtureMeta) => renderToStaticMarkup(createElement(CartaExplorer, { categories: cats, meta }));

describe("CartaExplorer (render)", () => {
  const h = html();
  it("navegación por categorías con anclas", () => { expect(h).toContain('aria-label="Categorías de la carta"'); expect(h).toContain('href="#cat-cat-uno"'); expect(h).toContain('href="#cat-cat-dos"'); });
  it("precios claros en formato es-ES, también por formatos", () => { expect(h.replace(/\u00a0/g, " ")).toContain("12,50 €"); expect(h).toContain("Media"); expect(h.replace(/\u00a0/g, " ")).toContain("14,50 €"); });
  it("plato sin precio: 'Precio por confirmar', nunca un número inventado", () => { expect(h).toContain("Precio por confirmar"); });
  it("plato destacado con foto usa imagen con alt; sin foto no inserta placeholder falso", () => { expect(h).toContain('alt="Foto de prueba"'); expect((h.match(/<img/g) ?? []).length).toBe(1); });
  it("destacados en artículos y resto en lista", () => { expect((h.match(/<article/g) ?? []).length).toBe(2); expect(h).toContain("Plato de prueba 3"); });
  it("filtros dietéticos solo para las etiquetas con datos (sin 'Sin gluten')", () => { expect(h).toContain("Vegetariano"); expect(h).toContain("Vegano"); expect(h).not.toContain(">Sin gluten<"); });
  it("alérgenos solo donde están confirmados + aviso global por los que faltan", () => { expect(h).toContain("Alérgenos: gluten, huevos"); expect(h).toContain("Ningún alérgeno declarado"); expect(h).toContain("no está confirmada para todos los platos"); });
  it("pie con fuente, fecha y nota de precios", () => { expect(h).toContain("Fuente: FIXTURE de pruebas"); expect(h).toContain("15 de enero de 2026"); expect(h).toContain("NOTA DE PRECIOS DE PRUEBA"); });
  it("sin datos dietéticos no aparece el bloque de filtros", () => { const plain = fixture.map(c => ({ ...c, dishes: c.dishes.map(({ dietary, ...d }) => d) })); expect(html(plain)).not.toContain("Filtrar por opción dietética"); });
  it("sin metadatos no muestra 'verificada'", () => { expect(html(fixture, null)).not.toContain("Carta verificada"); });
  it("accesibilidad: encabezados por categoría y contador de platos para lectores", () => { expect(h).toContain('aria-labelledby="h-cat-uno"'); expect(h).toContain("5 platos mostrados"); });
});
