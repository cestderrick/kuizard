// =============================================
// Sentry — Configuration côté serveur (Node.js runtime)
// =============================================
// Chargé uniquement via instrumentation.ts si SENTRY_DSN est présent.
//
// Pour éviter que Turbopack/Webpack tente de bundler @sentry/nextjs au build
// time quand le package n'est pas installé, on utilise un require non
// analysable via eval. À runtime, si le module n'est pas là, on no-op.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  // eslint-disable-next-line no-eval
  const dynRequire = eval("require") as NodeRequire;
  Sentry = dynRequire("@sentry/nextjs");
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
