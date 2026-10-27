// Hueco para fotografía real pendiente. Nunca muestra una imagen inventada: dice claramente que falta.
export default function Slot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <figure className={`relative grid place-items-center border border-dashed border-[color:var(--line)] p-4 text-center ${className}`} role="img" aria-label={`${label} (pendiente)`}>
      <div aria-hidden className="absolute inset-2 border border-[color:var(--line)] opacity-50" />
      <figcaption className="mut relative text-xs uppercase tracking-[0.2em]">{label}<br /><span className="normal-case tracking-normal opacity-80">Fotografía real pendiente</span></figcaption>
    </figure>
  );
}
