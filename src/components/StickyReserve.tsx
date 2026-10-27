"use client";
import { useEffect, useState } from "react";
// Barra fija en móvil: la reserva siempre a un toque; se oculta cuando el formulario ya está en pantalla.
export default function StickyReserve() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const el = document.getElementById("reservas"); if (!el) return;
    const io = new IntersectionObserver(([e]) => setHide(e.isIntersecting), { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  if (hide) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-oro/30 bg-carbon p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <a href="#reservas" className="btn btn-primary w-full">Reservar mesa</a>
    </div>
  );
}
