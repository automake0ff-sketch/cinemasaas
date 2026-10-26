import HeroScene from "@/components/HeroScene";
import ReservationForm from "@/components/ReservationForm";
import { restaurant } from "@/config/restaurant";
const steps = [["1","Elige fecha y hora","Consulta la disponibilidad."],["2","Selecciona comensales","Indica cuántos sois."],["3","Confirma tu reserva","Solo se confirma cuando el servidor lo valida."]];
export default function Home() {
  return (
    <main>
      <nav className="flex items-center justify-between border-b border-oro/20 px-6 py-4">
        <span className="font-serif text-2xl tracking-[0.3em] text-oro">CINEMA</span>
        <div className="hidden gap-6 text-sm md:flex">{["Inicio","Experiencia","Carta","Reservas","Contacto"].map(l => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}</div>
        <a href="#reservas" className="rounded-full border border-oro px-4 py-2 text-oro">Reservar mesa</a>
      </nav>
      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-16 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-humo">Restaurante Cinema</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">Donde la buena comida se ve en grande</h1>
          <p className="mt-6 max-w-md text-humo">Una experiencia gastronómica inspirada en el cine, el surrealismo y la fotografía editorial.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><a href="#reservas" className="rounded-full bg-oro px-6 py-3 font-semibold text-carbon">Haz tu reserva</a><a href="#experiencia" className="underline">Ver experiencia</a></div>
          <div className="mt-8 flex justify-center md:justify-start"><HeroScene /></div>
        </div>
        <aside className="rounded-xl border border-oro/30 bg-noche/80 p-6"><h2 className="font-serif text-2xl">Reserva tu mesa</h2><p className="mb-4 text-sm text-humo">Fecha, servicio y comensales en un minuto.</p><a href="#reservas" className="block rounded-full bg-oro px-4 py-3 text-center font-semibold text-carbon">Buscar disponibilidad</a></aside>
      </section>
      <section id="experiencia" className="mx-auto max-w-6xl px-6 py-16"><h2 className="font-serif text-3xl">Un viaje por el séptimo arte</h2><p className="mt-2 text-humo">[Pendiente: fotografías y texto verificados del restaurante]</p></section>
      <section id="carta" className="mx-auto max-w-6xl px-6 py-16"><h2 className="font-serif text-3xl">Nuestra carta</h2><p className="mt-2 text-humo">{restaurant.menu.length ? "" : "[Pendiente: platos, precios y alérgenos verificados — sin datos de demostración inventados]"}</p></section>
      <section className="mx-auto max-w-6xl px-6 py-16"><h2 className="font-serif text-3xl">Reserva en 3 pasos</h2><ol className="mt-6 grid gap-6 md:grid-cols-3">{steps.map(([n,t,d]) => <li key={n} className="rounded-xl border border-oro/20 p-6"><span className="font-serif text-4xl text-oro">{n}</span><h3 className="mt-2">{t}</h3><p className="text-sm text-humo">{d}</p></li>)}</ol></section>
      <section id="reservas" className="mx-auto max-w-6xl px-6 py-16"><h2 className="mb-6 font-serif text-3xl">Reservar mesa</h2><ReservationForm /></section>
      <footer id="contacto" className="border-t border-oro/20 px-6 py-10 text-humo">Cinema · {restaurant.city} · {restaurant.phone ?? "[teléfono pendiente]"} · <a href={restaurant.officialUrl}>Web oficial</a></footer>
    </main>
  );
}
