import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";
import { getAllPosts } from "@/lib/blog/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

/**
 * Sitemap dynamique multilingue. Toutes les pages publiques sont déclarées
 * avec leurs versions linguistiques via alternates.languages pour le SEO
 * international (Google + Bing comprennent ce format).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Pages publiques principales — priority indique l'importance relative
  const publicPages: {
    path: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly";
    lastModified?: Date;
  }[] = [
    // Pages de conversion
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/tarifs", priority: 0.95, changeFrequency: "weekly" },
    { path: "/signup", priority: 0.85, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },

    // Pages cas d'usage (SEO long-tail)
    { path: "/quizz-mariage", priority: 0.9, changeFrequency: "monthly" },
    { path: "/quizz-bar", priority: 0.9, changeFrequency: "monthly" },
    { path: "/quizz-evjf", priority: 0.85, changeFrequency: "monthly" },
    { path: "/quizz-anniversaire", priority: 0.85, changeFrequency: "monthly" },
    { path: "/quizz-seminaire", priority: 0.8, changeFrequency: "monthly" },

    // Blog
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },

    // Support
    { path: "/aide", priority: 0.6, changeFrequency: "monthly" },
    { path: "/suggestion", priority: 0.4, changeFrequency: "monthly" },

    // Légales
    { path: "/mentions-legales", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cgu", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cgv", priority: 0.2, changeFrequency: "monthly" },
    { path: "/confidentialite", priority: 0.2, changeFrequency: "monthly" },
    { path: "/cookies", priority: 0.2, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = publicPages.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: p.lastModified ?? now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((loc) => [loc.value, `${BASE_URL}${p.path}`])
      ),
    },
  }));

  // Articles de blog — date de modif réelle pour aider Google à crawler
  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((loc) => [
          loc.value,
          `${BASE_URL}/blog/${post.slug}`,
        ])
      ),
    },
  }));

  return [...staticEntries, ...blogEntries];
}
