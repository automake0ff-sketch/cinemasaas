import { restaurant } from "@/config/restaurant";
export default function MenuSection() {
  const items = restaurant.menu;
  if (!items.length) return (
    <div className="border border-dashed border-humo/40 p-8">
      <p className="font-serif text-2xl">La carta se está preparando para la web.</p>
      <p className="mt-2 max-w-prose text-humo">Mostraremos aquí platos, precios y alérgenos cuando estén verificados por el restaurante. Mientras tanto, consúltala en la <a className="underline" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">web oficial</a>.</p>
    </div>
  );
  return (
    <ul className="divide-y divide-humo/20">{items.map(i => (
      <li key={i.name} className="flex justify-between gap-6 py-5"><div><h3 className="font-serif text-xl">{i.name}</h3><p className="text-humo">{i.description}</p>{i.allergens?.length ? <p className="mt-1 text-xs uppercase tracking-widest text-humo">Alérgenos: {i.allergens.join(", ")}</p> : null}</div><span className="text-oro">{i.price.toFixed(2)} €</span></li>
    ))}</ul>
  );
}
