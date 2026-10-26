import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Restaurante Cinema · Dos Hermanas", description: "Experiencia gastronómica inspirada en el cine. Reserva tu mesa.", openGraph: { title: "Restaurante Cinema", locale: "es_ES" } };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body className="font-sans">{children}</body></html>;
}
