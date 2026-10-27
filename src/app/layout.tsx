import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SITE } from "@/config/restaurant";
const description = "Restaurante Cinema en Dos Hermanas: una experiencia gastronómica entre el cine y el surrealismo. Recorre la sala y reserva tu mesa.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Restaurante Cinema · Dos Hermanas (Sevilla)", template: "%s · Restaurante Cinema" },
  description,
  alternates: { canonical: "/" },
  openGraph: { title: "Restaurante Cinema · Dos Hermanas", description, locale: "es_ES", type: "website", url: "/", images: [{ url: "/tour/sala.jpg", width: 765, height: 1020, alt: "Sala de Restaurante Cinema con arco de cortinas rojas y letrero CINEMA" }] },
};
export const viewport: Viewport = { themeColor: "#0B0908" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es"><body className="font-sans antialiased">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-oro focus:px-4 focus:py-2 focus:text-carbon">Saltar al contenido</a>
      {children}
    </body></html>
  );
}
