// =============================================
// Sentry — Configuration côté serveur (Node.js runtime)
// =============================================
// Ce fichier n'est chargé que si SENTRY_DSN est présent (via instrumentation.ts).
// Le require dynamique évite que le build casse si @sentry/nextjs n'est pas
// installé.

// On évite `typeof import("@sentry/nextjs")` qui forcerait TS à résoudre
// le package au typecheck. Le `any` est volontaire pour ce wrapper optionnel.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require("@sentry/nextjs");
} catch {
  console.warn("[sentry] @sentry/nextjs not installed — server tracing skipped");
}

if (Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    sendDefaultPii: false,
    initialScope: {
      tags: { app: "kuizard", runtime: "server" },
    },
    ignoreErrors: [
      "AbortError",
      "TypeError: fetch failed",
      "ECONNRESET",
      "ECONNREFUSED",
    ],
  });
}
