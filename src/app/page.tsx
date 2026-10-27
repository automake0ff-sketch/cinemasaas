import Image from "next/image";
import { Clapper, Frame } from "@/components/Icons";
import MenuSection from "@/components/MenuSection";
import ReservationForm from "@/components/ReservationForm";
import Slot from "@/components/Slot";
import StickyReserve from "@/components/StickyReserve";
import Tour from "@/components/Tour";
import { restaurant, SITE } from "@/config/restaurant";

// Solo datos verificados: nombre, URL, localidad. Se amplía cuando haya dirección/teléfono/horarios reales.
const jsonLd = { "@context": "https://schema.org", "@type": "Restaurant", name: "Restaurante Cinema", url: SITE, image: `${SITE}/tour/sala.jpg`, address: { "@type": "PostalAddress", addressLocality: "Dos Hermanas", addressRegion: "Sevilla", addressCountry: "ES" }, sameAs: [restaurant.officialUrl] };
const nav = [["La sala", "experiencia"], ["Carta", "carta"], ["Reservas", "reservas"], ["Contacto", "contacto"]];
const eyebrow = "mut text-xs uppercase tracking-cine";
const h2 = "display text-4xl leading-[1.05] md:text-6xl";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-40 border-b border-oro/20 bg-carbon">
        <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10">
          <a href="#inicio" className="display text-2xl tracking-cine text-oro">CINEMA</a>
          <ul className="flex gap-5 text-[11px] uppercase tracking-[0.18em] md:gap-8 md:text-sm">
            {nav.slice(0, 2).map(([l, id]) => <li key={id}><a className="link inline-block py-3" href={`#${id}`}>{l}</a></li>)}
            {nav.slice(2).map(([l, id]) => <li key={id} className="hidden md:block"><a className="link inline-block py-3" href={`#${id}`}>{l}</a></li>)}
          </ul>
          <a href="#reservas" className="btn btn-ghost hidden !min-h-11 md:inline-flex"><Clapper />Reservar</a>
        </nav>
      </header>

      <main id="contenido">
        {/* I · HERO — oscuro */}
        <section id="inicio" className="tone-dark relative overflow-hidden">
          <div className="curtain curtain-l" aria-hidden /><div className="curtain curtain-r" aria-hidden />
          <div className="mx-auto grid min-h-[calc(100svh-3.75rem)] max-w-7xl md:grid-cols-12 md:items-stretch">
            <div className="absolute inset-0 md:relative md:order-2 md:col-span-5 md:my-10 md:mr-10 md:inset-auto">
              <Image src="/tour/sala.jpg" alt="Sala de Cinema: arco dorado con cortinas rojas bajo el letrero CINEMA, pared naranja y sillas de colores colgando del techo" fill priority sizes="(min-width:768px) 42vw, 100vw" className="object-cover object-[50%_35%]" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/75 to-carbon/10 md:hidden" />
              <div aria-hidden className="absolute -inset-3 hidden border border-oro/50 md:block" />
            </div>
            <div className="relative z-10 flex flex-col justify-end px-5 pb-24 pt-40 md:order-1 md:col-span-7 md:justify-center md:px-10 md:pb-10 md:pt-10">
              <p className={eyebrow}>Dos Hermanas · Sevilla</p>
              <h1 className="sign display mt-4 text-[clamp(3rem,16vw,6rem)] font-bold leading-[0.95] md:text-[clamp(4rem,9.5vw,9rem)]"><span className="sr-only">Restaurante </span>CINEMA</h1>
              <p className="display mt-5 max-w-md text-2xl italic leading-snug text-marfil md:text-3xl">Cine, surrealismo y mesa en una misma sala.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#reservas" className="btn btn-primary"><Clapper />Reservar mesa</a>
                <a href="#experiencia" className="btn btn-ghost"><Frame />Descubrir Cinema</a>
              </div>
            </div>
          </div>
          <div className="perf" aria-hidden />
        </section>

        {/* II · LA SALA — claro */}
        <section id="experiencia" className="tone-light">
          <div className="drape" aria-hidden />
          <div className="mx-auto max-w-7xl px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className={eyebrow}>Escena I</p>
                <h2 className={`${h2} mt-3`}>La sala</h2>
                <p className="mut mt-6 max-w-sm text-lg">Un arco dorado con cortinas rojas, un letrero de marquesina y sillas de colores suspendidas del techo. Aquí se come dentro de un decorado.</p>
              </div>
              <div className="grid grid-cols-6 items-start gap-4 md:col-span-7">
                <figure className="col-span-6">
                  <Image src="/tour/detalle-letrero.jpg" alt="Letrero CINEMA en letras rojas sobre un voladizo dorado" width={515} height={180} sizes="(min-width:768px) 55vw, 100vw" className="h-auto w-full" />
                  <figcaption className="mut mt-2 text-xs uppercase tracking-[0.2em]">Fotograma 1 · El letrero</figcaption>
                </figure>
                <figure className="col-span-3">
                  <Image src="/tour/detalle-arco.jpg" alt="Arco dorado con cortinas rojas abiertas a una sala de paredes rosas" width={280} height={465} sizes="(min-width:768px) 27vw, 50vw" className="h-auto w-full" />
                  <figcaption className="mut mt-2 text-xs uppercase tracking-[0.2em]">Fotograma 2 · El arco</figcaption>
                </figure>
                <figure className="col-span-3 mt-12">
                  <Image src="/tour/detalle-tigres.jpg" alt="Cuadro enmarcado de tigres sobre pared naranja, junto a un farol" width={265} height={285} sizes="(min-width:768px) 27vw, 50vw" className="h-auto w-full" />
                  <figcaption className="mut mt-2 text-xs uppercase tracking-[0.2em]">Fotograma 3 · La pared</figcaption>
                </figure>
              </div>
            </div>
            <div id="recorrido" className="mt-20 md:mt-28">
              <p className={eyebrow}>Recorrido 3D</p>
              <h3 className="display mb-8 mt-3 text-3xl md:text-4xl">Entra por el arco</h3>
              <Tour />
            </div>
          </div>
        </section>

        {/* III · CARTA — burdeos */}
        <section id="carta" className="tone-wine">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className={eyebrow}>Escena II</p>
                <h2 className={`${h2} mt-3`}>La mesa</h2>
                <p className="mut mt-6 max-w-sm text-lg">Platos, precios y alérgenos, solo cuando estén verificados por el restaurante.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-7 md:gap-5">
                <Slot label="Plato 1" className="aspect-[4/5]" />
                <Slot label="Plato 2" className="mt-8 aspect-[4/5]" />
                <Slot label="Plato 3" className="aspect-[4/5]" />
              </div>
            </div>
            <div className="mt-16 max-w-3xl md:ml-auto"><MenuSection /></div>
          </div>
        </section>

        {/* IV · RESERVAS — claro */}
        <section id="reservas" className="tone-light">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
            <div className="md:col-span-5">
              <p className={eyebrow}>Escena III</p>
              <h2 className={`${h2} mt-3`}>Reserva tu mesa</h2>
              <p className="mut mt-6 max-w-sm text-lg">Fecha, hora y datos de contacto. La reserva solo se confirma cuando el restaurante la registra.</p>
            </div>
            <div className="md:col-span-7"><ReservationForm /></div>
          </div>
        </section>
      </main>

      <footer id="contacto" className="tone-dark border-t border-oro/20 pb-24 md:pb-0">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-10">
          <div><p className="display text-4xl tracking-cine text-oro">CINEMA</p><p className="mut mt-2">{restaurant.city}, Sevilla</p></div>
          <address className="mut not-italic"><p className={eyebrow}>Contacto</p>
            <p className="mt-3">{restaurant.address ?? "[Dirección pendiente de verificar]"}</p>
            <p>{restaurant.phone ? <a className="link" href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>{restaurant.phone}</a> : "[Teléfono pendiente de verificar]"}</p>
            <p>[Horarios pendientes de verificar]</p></address>
          <nav aria-label="Pie" className="mut"><p className={eyebrow}>Enlaces</p>
            <ul className="mt-3">{nav.map(([l, id]) => <li key={id}><a className="link inline-block py-1.5" href={`#${id}`}>{l}</a></li>)}
              <li><a className="link inline-block py-1.5" href={restaurant.officialUrl} target="_blank" rel="noopener noreferrer">Web oficial</a></li></ul></nav>
        </div>
        <p className="mut mx-auto max-w-7xl px-5 pb-8 text-xs md:px-10">[Pendiente: política de privacidad, aviso legal y autorización de uso de las fotografías]</p>
      </footer>
      <StickyReserve />
    </>
  );
}
