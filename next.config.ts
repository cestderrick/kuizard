import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Limite par défaut = 1 Mo. On monte à 10 Mo pour permettre les uploads
      // d'images depuis un téléphone (souvent 3-6 Mo bruts).
      bodySizeLimit: "10mb",
    },
  },
  // Compression Next (nginx fait aussi le sien)
  compress: true,
  // Optimisation images via le composant next/image
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },
  // Headers de sécurité par défaut (Cloudflare en ajoute aussi, ceinture+bretelles)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

// Wrap Sentry — uniquement si l'env contient SENTRY_DSN, sinon on retourne
// la config Next telle quelle (utile en dev local sans monitoring).
const finalConfig =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, {
        // Org + project Sentry (à configurer dans .env)
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        // Authentification pour l'upload de sourcemaps
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Silence le logging au build (sauf erreurs)
        silent: !process.env.CI,
        // Désactive les widgets (on n'utilise pas)
        widenClientFileUpload: true,
        // Tunneling : route /monitoring pour bypasser les bloqueurs de pub
        tunnelRoute: "/monitoring",
        // Hide source maps des bundles client (on les upload juste à Sentry)
        sourcemaps: {
          disable: false,
        },
      })
    : nextConfig;

export default finalConfig;
