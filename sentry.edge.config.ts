// =============================================
// Sentry — Configuration Edge runtime (middleware, route edge)
// =============================================
// Chargé uniquement via instrumentation.ts si SENTRY_DSN est présent.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require("@sentry/nextjs");
} catch {
  console.warn("[sentry] @sentry/nextjs not installed — edge tracing skipped");
}

if (Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    sendDefaultPii: false,
    initialScope: {
      tags: { app: "kuizard", runtime: "edge" },
    },
  });
}
