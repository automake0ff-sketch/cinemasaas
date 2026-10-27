"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { stops } from "./tourStops";
const TourScene = dynamic(() => import("./TourScene"), { ssr: false });

export default function Tour() {
  const [i, setI] = useState(0);
  const [gl, setGl] = useState(false);
  const [still, setStill] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    try { setGl(!!document.createElement("canvas").getContext("webgl")); } catch { setGl(false); }
    setStill(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI(n => (n + 1) % stops.length), 4500);
    return () => clearInterval(t);
  }, [auto]);
  const s = stops[i];
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="relative aspect-[3/4] max-h-[78vh] w-full overflow-hidden rounded-xl border border-oro/30 bg-carbon">
        {gl
          ? <TourScene index={i} still={still} />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src="/tour/sala.jpg" alt="Sala de Restaurante Cinema con arco de cortinas rojas, letrero CINEMA y pared naranja" className="h-full w-full object-cover" />}
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-carbon/70 px-3 py-1 text-xs text-humo">{gl ? "Mueve el cursor o el dedo para mirar" : "Vista estática"}</p>
      </div>
      <aside>
        <p className="text-xs uppercase tracking-[0.3em] text-humo">Parada {i + 1} / {stops.length}</p>
        <h3 aria-live="polite" className="mt-2 font-serif text-3xl text-oro">{s.title}</h3>
        <p className="mt-2 text-humo">{s.text}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {stops.map((p, n) => (
            <button key={p.id} onClick={() => { setAuto(false); setI(n); }} aria-pressed={n === i}
              className={`rounded-full border px-3 py-1 text-sm ${n === i ? "border-oro bg-oro text-carbon" : "border-oro/40 text-marfil"}`}>{p.title}</button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => { setAuto(false); setI((i + stops.length - 1) % stops.length); }} className="rounded-full border border-oro/40 px-4 py-2">←</button>
          <button onClick={() => setAuto(a => !a)} className="rounded-full border border-oro px-4 py-2 text-oro">{auto ? "Pausar recorrido" : "Iniciar recorrido"}</button>
          <button onClick={() => { setAuto(false); setI((i + 1) % stops.length); }} className="rounded-full border border-oro/40 px-4 py-2">→</button>
        </div>
      </aside>
    </div>
  );
}
