import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { carbon: "#0B0908", noche: "#15100E", borgona: "#6E1E27", terracota: "#B5573A", oro: "#C9A45E", marfil: "#F2E9DA", humo: "#B8AE9F" },
    fontFamily: { serif: ["Didot", "Bodoni MT", "Playfair Display", "Georgia", "serif"], sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"] },
    letterSpacing: { cine: "0.32em" },
  } },
} satisfies Config;
