"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
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
  const go = (n: number) => { setAuto(false); setI((n + stops.length) % stops.length); };
  const s = stops[i];
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
      <div role="region" aria-roledescription="recorrido" aria-label="Recorrido 3D de la sala. Usa las flechas izquierda y derecha para cambiar de parada." tabIndex={0}
        onKeyDown={e => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}
        className="relative aspect-[3/4] max-h-[78vh] w-full overflow-hidden border border-[color:var(--line)] bg-carbon">
        {gl
          ? <TourScene index={i} still={still} />
          : <Image src="/tour/sala.jpg" alt="Sala de Restaurante Cinema con arco de cortinas rojas, letrero CINEMA y pared naranja" fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover" />}
        <p className="pointer-events-none absolute bottom-3 left-3 bg-carbon/80 px-3 py-1 text-xs text-marfil">{gl ? "Mueve el cursor o el dedo para mirar" : "Vista estática"}</p>
      </div>
      <aside>
        <p className="mut text-xs uppercase tracking-[0.3em]">Parada {i + 1} / {stops.length}</p>
        <h3 aria-live="polite" className="display acc mt-2 text-3xl">{s.title}</h3>
        <p className="mut mt-2">{s.text}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {stops.map((p, n) => <button key={p.id} onClick={() => go(n)} aria-pressed={n === i} className="chip min-h-11 px-3 py-1 text-sm">{p.title}</button>)}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button aria-label="Parada anterior" onClick={() => go(i - 1)} className="btn btn-ghost">←</button>
          <button onClick={() => setAuto(a => !a)} className="btn btn-primary">{auto ? "Pausar recorrido" : "Iniciar recorrido"}</button>
          <button aria-label="Parada siguiente" onClick={() => go(i + 1)} className="btn btn-ghost">→</button>
        </div>
      </aside>
    </div>
  );
}
