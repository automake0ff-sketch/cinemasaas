"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Reel = dynamic(() => import("./Reel"), { ssr: false });
export default function HeroScene() {
  const [ok, setOk] = useState(false); const [still, setStill] = useState(false);
  useEffect(() => {
    try { setOk(!!document.createElement("canvas").getContext("webgl") && navigator.hardwareConcurrency > 2); } catch { setOk(false); }
    setStill(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return (
    <div aria-hidden className="h-72 w-72 md:h-[28rem] md:w-[28rem]">
      {ok ? <Reel still={still} /> : <div className="h-full w-full rounded-full border border-oro/40 bg-[radial-gradient(circle,#D7AE68_0,#641B25_60%,#090B10_100%)] opacity-70" />}
    </div>
  );
}
