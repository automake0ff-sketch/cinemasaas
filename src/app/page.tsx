import Image from "next/image";
import HeroScene from "@/components/HeroScene";
import MenuSection from "@/components/MenuSection";
import ReservationForm from "@/components/ReservationForm";
import Tour from "@/components/Tour";
import { restaurant, SITE } from "@/config/restaurant";

// Solo datos verificados: nombre, URL, localidad. Se amplía cuando haya dirección/teléfono/horarios reales.
const jsonLd = { "@context": "https://schema.org", "@type": "Restaurant", name: "Restaurante Cinema", url: SITE, image: `${SITE}/tour/sala.jpg`, address: { "@type": "PostalAddress", addressLocality: "Dos Hermanas", addressRegion: "Sevilla", addressCountry: "ES" }, sameAs: [restaurant.officialUrl] };
const nav = [["Experiencia", "experiencia"], ["Carta", "carta"], ["Reservas", "reservas"], ["Contacto", "contacto"]];
const h2 = "font-serif text-4xl leading-tight md:text-5xl";
const eyebrow = "text-xs uppercase tracking-cine text-humo";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-40 border-b border-oro/20 bg-carbon/95">
        <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10">
          <a href="#inicio" className="font-serif text-2xl tracking-cine text-oro">CINEMA</a>
          <ul className="hidden gap-8 text-sm uppercase tracking-[0.18em] md:flex">{nav.map(([l, id]) => <li key={id}><a className="py-2 hover:text-oro" href={`#${id}`}>{l}</a></li>)}</ul>
          <a href="#reservas" className="btn btn-ghost !min-h-11">Reservar</a>
        </nav>
      </header>
      <main id="contenido">
        <section id="inicio" className="relative">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:px-10 md:pb-28 md:pt-20">
            <div className="md:col-span-7 md:pt-12">
              <p className={eyebrow}>Dos Hermanas · Sevilla</p>
              <h1 className="mt-5 font-serif text-5xl leading-[1.02] md:text-8xl">Cena en<br />la <em className="text-oro">gran pantalla</em></h1>
              <p className="mt-6 max-w-md text-lg text-humo">Cine, surrealismo y mesa en una misma sala.</p>
              <div className="mt-9 flex flex-wrap gap-4"><a href="#reservas" className="btn btn-primary">Reservar mesa</a><a href="#experiencia" className="btn btn-ghost">Descubrir Cinema</a></div>
              <div className="mt-10 hidden md:block"><HeroScene /></div>
            </div>
            <div className="relative md:col-span-5 md:mt-16">
              <div className="border border-oro/40 p-2"><Image src="/tour/sala.jpg" alt="Sala de Cinema: arco dorado con cortinas rojas bajo el letrero CINEMA, pared naranja y sillas de colores colgando del techo" width={765} height={1020} priority sizes="(min-width:768px) 40vw, 100vw" className="h-auto w-full" /></div>
              <p className="mt-2 text-xs text-humo">[Pendiente: confirmar autorización de uso de la fotografía]</p>
            </div>
          </div>
          <div className="perf" aria-hidden />
        </section>

        <section id="experiencia" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <div className="mb-10 max-w-2xl"><p className={eyebrow}>La sala</p><h2 className={`${h2} mt-3`}>Un recorrido por Cinema</h2><p className="mt-4 text-humo">Entra por el arco, mira hacia arriba y detente en los detalles.</p></div>
          <Tour />
        </section>

        <section id="carta" className="border-t border-oro/20 bg-noche">
          <div className="mx-auto max-w-4xl px-5 py-20 md:px-10 md:py-28"><p className={eyebrow}>La mesa</p><h2 className={`${h2} mb-10 mt-3`}>Carta</h2><MenuSection /></div>
        </section>

        <section id="reservas" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5"><p className={eyebrow}>Reservas</p><h2 className={`${h2} mt-3`}>Reserva tu mesa</h2><p className="mt-4 max-w-sm text-humo">Fecha, hora y datos de contacto. La reserva solo se confirma cuando el restaurante la registra.</p></div>
          <div className="md:col-span-7"><ReservationForm /></div>
        </section>
      </main>
      <footer id="contacto" className="border-t border-oro/20 bg-noche">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-10">
          <div><p className="font-serif text-3xl tracking-cine text-oro">CINEMA</p><p className="mt-2 text-humo">{restaurant.city}, Sevilla</p></div>
          <address className="not-italic text-humo"><p className={eyebrow}>Contacto</p><p className="mt-3">{restaurant.address ?? "[Dirección pendiente de verificar]"}</p><p>{restaurant.phone ? <a className="underline" href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>{restaurant.phone}</a> : "[Teléfono pendiente de verificar]"}</p><p>[Horarios pendientes de verificar]</p></address>
          <nav aria-label="Pie" className="text-humo"><p className={eyebrow}>Enlaces</p><ul className="mt-3 space-y-1">{nav.map(([l, id]) => <li key={id}><a className="py-1 hover:text-oro" href={`#${id}`}>{l}</a></li>)}<li><a className="py-1 underline" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">Web oficial</a></li></ul></nav>
        </div>
      </footer>
    </>
  );
}
