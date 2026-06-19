import type { NextConfig } from "next";

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
          // V38 — CSP de base. unsafe-inline sur style et script est nécessaire
          // pour Next.js hydration scripts + styles inline JSX, mais on serre
          // sur les autres directives.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "connect-src 'self' https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// =============================================
// Wrap Sentry (optionnel)
// =============================================
// On require Sentry seulement si :
//   1. Le package est installé
//   2. Un DSN est configuré dans l'env
// Sinon on retourne la config Next telle quelle (utile en dev local).
//
// Le require sync (au lieu d'import) évite que le build casse si @sentry/nextjs
// n'est pas installé. Et il est wrappé dans un try pour la même raison.
function wrapWithSentryIfAvailable(config: NextConfig): NextConfig {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return config;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withSentryConfig } = require("@sentry/nextjs");
    return withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      sourcemaps: { disable: false },
    });
  } catch (err) {
    console.warn(
      "[sentry] @sentry/nextjs not installed — Sentry wrapping skipped:",
      (err as Error).message
    );
    return config;
  }
}

export default wrapWithSentryIfAvailable(nextConfig);
