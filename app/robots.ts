import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

/**
 * robots.txt dynamique — sert /robots.txt
 *
 * On bloque les pages techniques (API, dashboard, admin, paiement, monitoring)
 * et on autorise tout le reste (home, tarifs, blog, pages cas d'usage, légales).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/payment/",
          "/_next/",
          "/accept-terms",
          "/monitoring",
          "/og-image", // route Next.js qui génère le PNG — pas une vraie page
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
