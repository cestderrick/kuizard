import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

/**
 * Sitemap dynamique multilingue. Toutes les pages publiques sont déclarées
 * avec leurs versions linguistiques via alternates.languages pour le SEO
 * international (Google + Bing comprennent ce format).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Pages publiques principales — change la priority selon ton ordre de bataille
  const publicPages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/aide", priority: 0.6, changeFrequency: "monthly" },
    { path: "/suggestion", priority: 0.4, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.7, changeFrequency: "monthly" },
    { path: "/mentions-legales", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cgu", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cgv", priority: 0.2, changeFrequency: "monthly" },
    { path: "/confidentialite", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cookies", priority: 0.2, changeFrequency: "monthly" },
  ];

  return publicPages.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    // hreflang : on signale chaque langue supportée comme une variante
    // (toutes pointent vers la même URL puisque la langue est dans le cookie)
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((loc) => [loc.value, `${BASE_URL}${p.path}`])
      ),
    },
  }));
}
