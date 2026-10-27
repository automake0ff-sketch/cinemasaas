import { type Category } from "@/config/carta";
// Datos estructurados de la carta: solo con lo que existe en carta.ts (nada por defecto).
export function menuJsonLd(cats: Category[]) {
  if (!cats.length) return undefined;
  return { "@type": "Menu", hasMenuSection: cats.map(c => ({ "@type": "MenuSection", name: c.title, hasMenuItem: c.dishes.map(d => ({ "@type": "MenuItem", name: d.name, ...(d.description && { description: d.description }), ...(typeof d.price === "number" && { offers: { "@type": "Offer", price: d.price.toFixed(2), priceCurrency: "EUR" } }) })) })) };
}
