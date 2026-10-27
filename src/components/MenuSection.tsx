import { restaurant } from "@/config/restaurant";
import { carta, cartaMeta } from "@/config/carta";
import CartaExplorer from "./CartaExplorer";
export default function MenuSection() {
  if (!carta.length) return (
    <div className="border border-dashed border-[color:var(--line)] p-8">
      <p className="display text-2xl">La carta se está preparando para la web.</p>
      <p className="mut mt-2 max-w-prose">Mostraremos aquí platos, precios y alérgenos cuando estén verificados por el restaurante. Mientras tanto, consúltala en la <a className="link underline" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">web oficial</a>.</p>
    </div>
  );
  return <CartaExplorer categories={carta} meta={cartaMeta} />;
}
