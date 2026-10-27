import { restaurant } from "@/config/restaurant";
export default function MenuSection() {
  const items = restaurant.menu;
  if (!items.length) return (
    <div className="border border-dashed border-[color:var(--line)] p-8">
      <p className="font-serif text-2xl">La carta se está preparando para la web.</p>
      <p className="mt-2 max-w-prose mut">Mostraremos aquí platos, precios y alérgenos cuando estén verificados por el restaurante. Mientras tanto, consúltala en la <a className="underline" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">web oficial</a>.</p>
    </div>
  );
  return (
    <ul className="divide-y divide-[color:var(--line)]">{items.map(i => (
      <li key={i.name} className="flex justify-between gap-6 py-5"><div><h3 className="font-serif text-xl">{i.name}</h3><p className="mut">{i.description}</p>{i.allergens?.length ? <p className="mt-1 text-xs uppercase tracking-widest mut">Alérgenos: {i.allergens.join(", ")}</p> : null}</div><span className="acc">{i.price.toFixed(2)} €</span></li>
    ))}</ul>
  );
}
