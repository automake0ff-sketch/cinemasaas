// CARTA OFICIAL — única fuente de datos de la carta.
// Regla: solo se añade lo que el restaurante ha confirmado (carta oficial, PDF o fotografía de la carta).
//  · Sin `price` → se muestra "Precio por confirmar". Sin `allergens`/`dietary` → no se muestra nada de eso.
//  · `cartaMeta` es obligatorio en cuanto haya platos (fuente y fecha de verificación).
// `npm test` valida esta estructura (ids únicos, precios, alérgenos, fotos existentes).
export const ALLERGENS = ["gluten", "crustáceos", "huevos", "pescado", "cacahuetes", "soja", "lácteos", "frutos de cáscara", "apio", "mostaza", "sésamo", "sulfitos", "altramuces", "moluscos"] as const;
export type Allergen = (typeof ALLERGENS)[number];
export type Dietary = "vegetariano" | "vegano" | "sin-gluten";
export const DIETARY_LABEL: Record<Dietary, string> = { vegetariano: "Vegetariano", vegano: "Vegano", "sin-gluten": "Sin gluten" };
export type Price = number | { label: string; amount: number }[]; // número = precio único; lista = formatos (p. ej. media ración / ración)
export type Photo = { src: string; alt: string; width: number; height: number }; // src bajo /public, foto REAL del plato
export type Dish = { id: string; name: string; description?: string; price?: Price; photo?: Photo; featured?: boolean; allergens?: Allergen[]; dietary?: Dietary[] };
export type Category = { id: string; title: string; intro?: string; dishes: Dish[] };
export type CartaMeta = { source: string; verifiedOn: string; priceNote?: string };

export const carta: Category[] = []; // PENDIENTE: carta oficial sin verificar
export const cartaMeta: CartaMeta | null = null;

export const formatPrice = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

// Devuelve la lista de problemas; vacía = datos coherentes.
export function validateCarta(cats: Category[], meta: CartaMeta | null): string[] {
  const e: string[] = []; const ids = new Set<string>(); const cids = new Set<string>();
  if (cats.length && !meta) e.push("Falta cartaMeta (fuente y fecha de verificación).");
  if (meta && !/^\d{4}-\d{2}-\d{2}$/.test(meta.verifiedOn)) e.push("cartaMeta.verifiedOn debe ser YYYY-MM-DD.");
  if (meta && !meta.source.trim()) e.push("cartaMeta.source vacío.");
  for (const c of cats) {
    if (!/^[a-z0-9-]+$/.test(c.id) || cids.has(c.id)) e.push(`Categoría con id inválido o repetido: ${c.id}`); cids.add(c.id);
    if (!c.title.trim()) e.push(`Categoría ${c.id} sin título.`);
    if (!c.dishes.length) e.push(`Categoría ${c.id} sin platos.`);
    for (const d of c.dishes) {
      if (!/^[a-z0-9-]+$/.test(d.id) || ids.has(d.id)) e.push(`Plato con id inválido o repetido: ${d.id}`); ids.add(d.id);
      if (!d.name.trim()) e.push(`Plato ${d.id} sin nombre.`);
      const amounts = typeof d.price === "number" ? [d.price] : (d.price ?? []).map(p => p.amount);
      if (Array.isArray(d.price) && !d.price.length) e.push(`Plato ${d.id}: lista de precios vacía.`);
      if (Array.isArray(d.price) && d.price.some(p => !p.label.trim())) e.push(`Plato ${d.id}: formato de precio sin etiqueta.`);
      if (amounts.some(a => !(a > 0) || !Number.isFinite(a))) e.push(`Plato ${d.id}: precio no válido.`);
      for (const a of d.allergens ?? []) if (!ALLERGENS.includes(a)) e.push(`Plato ${d.id}: alérgeno desconocido "${a}".`);
      if (d.photo && (!d.photo.src.startsWith("/") || !d.photo.alt.trim() || d.photo.width < 1 || d.photo.height < 1)) e.push(`Plato ${d.id}: foto sin src, alt o dimensiones.`);
    }
  }
  return e;
}
