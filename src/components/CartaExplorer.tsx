"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { DIETARY_LABEL, formatPrice, type CartaMeta, type Category, type Dietary, type Dish, type Price } from "@/config/carta";

function PriceView({ price, big = false }: { price?: Price; big?: boolean }) {
  if (price === undefined) return <span className="mut text-xs uppercase tracking-[0.15em]">Precio por confirmar</span>;
  if (typeof price === "number") return <span className={`acc font-medium tabular-nums ${big ? "display text-3xl" : "text-base"}`}>{formatPrice(price)}</span>;
  return <span className="flex flex-wrap gap-x-4 gap-y-1">{price.map(p => <span key={p.label} className="tabular-nums"><span className="mut text-xs uppercase tracking-[0.15em]">{p.label} </span><span className="acc font-medium">{formatPrice(p.amount)}</span></span>)}</span>;
}
function Facts({ dish }: { dish: Dish }) {
  const hasAll = dish.allergens !== undefined, hasDiet = !!dish.dietary?.length;
  if (!hasAll && !hasDiet) return null;
  return (
    <p className="mut mt-3 text-xs uppercase tracking-[0.14em]">
      {hasDiet && dish.dietary!.map(d => DIETARY_LABEL[d]).join(" · ")}
      {hasDiet && hasAll && " — "}
      {hasAll && (dish.allergens!.length ? `Alérgenos: ${dish.allergens!.join(", ")}` : "Ningún alérgeno declarado")}
    </p>
  );
}
function Featured({ dish, flip }: { dish: Dish; flip: boolean }) {
  const p = dish.photo;
  return (
    <article className="grid items-center gap-6 md:grid-cols-12 md:gap-12">
      {p && (
        <div className={`group relative aspect-[4/3] overflow-hidden md:col-span-7 ${flip ? "md:order-2" : ""}`}>
          <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width:768px) 58vw, 100vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className={p ? "md:col-span-5" : "border-l-2 border-[color:var(--acc)] pl-6 md:col-span-9 md:pl-10"}>
        <h4 className={`display leading-[1.05] ${p ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"}`}>{dish.name}</h4>
        {dish.description && <p className="mut mt-4 max-w-md text-lg">{dish.description}</p>}
        <div className="mt-5"><PriceView price={dish.price} big /></div>
        <Facts dish={dish} />
      </div>
    </article>
  );
}
function Row({ dish }: { dish: Dish }) {
  return (
    <li className="py-4">
      <div className="flex items-baseline gap-3">
        <h4 className="display text-xl">{dish.name}</h4>
        <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-[color:var(--line)]" />
        <PriceView price={dish.price} />
      </div>
      {dish.description && <p className="mut mt-1 max-w-prose">{dish.description}</p>}
      <Facts dish={dish} />
    </li>
  );
}

export default function CartaExplorer({ categories, meta }: { categories: Category[]; meta: CartaMeta | null }) {
  const diets = useMemo(() => (["vegetariano", "vegano", "sin-gluten"] as Dietary[]).filter(t => categories.some(c => c.dishes.some(d => d.dietary?.includes(t)))), [categories]);
  const [active, setActive] = useState<Dietary[]>([]);
  const [current, setCurrent] = useState(categories[0]?.id);
  const view = useMemo(() => categories.map(c => ({ ...c, dishes: c.dishes.filter(d => active.every(t => d.dietary?.includes(t))) })).filter(c => c.dishes.length), [categories, active]);
  const total = view.reduce((n, c) => n + c.dishes.length, 0);
  const allergenGap = categories.some(c => c.dishes.some(d => d.allergens === undefined));

  useEffect(() => { // resalta en la navegación la categoría visible
    const els = view.map(c => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(es => { const v = es.find(e => e.isIntersecting); if (v) setCurrent(v.target.id.replace("cat-", "")); }, { rootMargin: "-30% 0px -60% 0px" });
    els.forEach(e => io.observe(e)); return () => io.disconnect();
  }, [view]);
  const toggle = (t: Dietary) => setActive(a => a.includes(t) ? a.filter(x => x !== t) : [...a, t]);

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 border-b border-[color:var(--line)] bg-[#3A0F17] px-5 md:-mx-10 md:px-10">
        <nav aria-label="Categorías de la carta" className="flex gap-2 overflow-x-auto py-3">
          {view.map(c => <a key={c.id} href={`#cat-${c.id}`} aria-current={current === c.id ? "true" : undefined} className="chip btn !min-h-11 shrink-0 !px-4">{c.title}</a>)}
        </nav>
      </div>
      {diets.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por opción dietética">
          <span className="mut mr-2 text-xs uppercase tracking-[0.2em]">Filtrar</span>
          {diets.map(t => <button key={t} type="button" aria-pressed={active.includes(t)} onClick={() => toggle(t)} className="chip min-h-11 px-4 text-sm">{DIETARY_LABEL[t]}</button>)}
          {active.length > 0 && <button type="button" onClick={() => setActive([])} className="link mut ml-2 text-sm underline">Quitar filtros</button>}
        </div>
      )}
      {active.length > 0 && <p className="mut mt-3 text-sm">Solo se muestran los platos con esta información confirmada por el restaurante. Que un plato no aparezca no significa que no sea apto: consúltalo con el personal.</p>}
      <p role="status" className="sr-only">{total} {total === 1 ? "plato" : "platos"} mostrados</p>

      {view.length === 0 ? (
        <div className="mt-10 border border-dashed border-[color:var(--line)] p-8"><p className="display text-2xl">Ningún plato cumple esos filtros.</p><button type="button" onClick={() => setActive([])} className="btn btn-ghost mt-5">Quitar filtros</button></div>
      ) : view.map((c, i) => {
        const featured = c.dishes.filter(d => d.featured), rest = c.dishes.filter(d => !d.featured);
        return (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`h-${c.id}`} className="scroll-mt-32 pt-16 md:pt-24">
            <header className="mb-10 flex items-baseline gap-5">
              <span aria-hidden className="display acc text-5xl opacity-50 md:text-7xl">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 id={`h-${c.id}`} className="display text-4xl md:text-5xl">{c.title}</h3>{c.intro && <p className="mut mt-2 max-w-xl">{c.intro}</p>}</div>
            </header>
            {featured.length > 0 && <div className="space-y-14 md:space-y-20">{featured.map((d, n) => <Featured key={d.id} dish={d} flip={n % 2 === 1} />)}</div>}
            {rest.length > 0 && <ul className={`grid gap-x-14 md:grid-cols-2 ${featured.length ? "mt-14" : ""}`}>{rest.map(d => <Row key={d.id} dish={d} />)}</ul>}
          </section>
        );
      })}

      <footer className="mut mt-16 space-y-1 border-t border-[color:var(--line)] pt-6 text-sm">
        {meta && <p>Carta verificada el {new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${meta.verifiedOn}T12:00:00Z`))}. Fuente: {meta.source}.</p>}
        {meta?.priceNote && <p>{meta.priceNote}</p>}
        {allergenGap && <p>La información de alérgenos no está confirmada para todos los platos: consúltala siempre con el personal antes de pedir.</p>}
      </footer>
    </div>
  );
}
