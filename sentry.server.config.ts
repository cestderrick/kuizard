// =============================================
// Sentry — Configuration côté serveur (Node.js runtime)
// =============================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environnement (prod, staging, dev local désactivé via DSN absent)
  environment: process.env.NODE_ENV,

  // % des transactions tracées pour le perf monitoring
  // (0.1 = 10% des requêtes, on garde bas pour ne pas exploser la quota)
  tracesSampleRate: 0.1,

  // Capture les erreurs non-handle uniquement, pas les warnings React
  enabled: process.env.NODE_ENV === "production",

  // PII : on ne veut pas envoyer l'email ou l'IP des users
  sendDefaultPii: false,

  // Tags par défaut pour faciliter le filtrage dans Sentry
  initialScope: {
    tags: {
      app: "kuizard",
      runtime: "server",
    },
  },

  // Filtrage : on ignore les erreurs réseau utilisateur (pas de notre faute)
  ignoreErrors: [
    "AbortError",
    "TypeError: fetch failed",
    "ECONNRESET",
    "ECONNREFUSED",
  ],
});
