import type { MetadataRoute } from "next";
import { SITE } from "@/config/restaurant";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: SITE, changeFrequency: "monthly", priority: 1 }]; }
