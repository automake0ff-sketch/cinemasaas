// FIXTURE SOLO PARA PRUEBAS: datos ficticios y obvios. NUNCA importar desde código de producción.
import type { CartaMeta, Category } from "@/config/carta";
export const fixtureMeta: CartaMeta = { source: "FIXTURE de pruebas", verifiedOn: "2026-01-15", priceNote: "NOTA DE PRECIOS DE PRUEBA" };
export const fixture: Category[] = [
  { id: "cat-uno", title: "Categoría de prueba uno", intro: "Introducción de prueba", dishes: [
    { id: "p1", name: "Plato de prueba 1", description: "Descripción de prueba 1", price: 12.5, featured: true, photo: { src: "/tour/sala.jpg", alt: "Foto de prueba", width: 765, height: 1020 }, dietary: ["vegetariano"], allergens: ["gluten", "huevos"] },
    { id: "p2", name: "Plato de prueba 2 sin foto", description: "Descripción 2", price: [{ label: "Media", amount: 8 }, { label: "Ración", amount: 14.5 }], featured: true },
    { id: "p3", name: "Plato de prueba 3", price: 6 },
    { id: "p4", name: "Plato de prueba 4 sin precio", allergens: [] },
  ] },
  { id: "cat-dos", title: "Categoría de prueba dos", dishes: [{ id: "p5", name: "Plato de prueba 5", price: 9, dietary: ["vegano", "vegetariano"] }] },
];
