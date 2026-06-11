// =============================================
// Sentry — Configuration côté navigateur
// =============================================
// Next.js charge automatiquement ce fichier dans le bundle client si présent.

import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring (faible % pour ne pas exploser quota)
    tracesSampleRate: 0.1,

    // Session replay (super utile pour reproduire un bug visuel) — désactivé
    // par défaut, à activer si tu veux la quota Replay de Sentry
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    enabled: process.env.NODE_ENV === "production",
    sendDefaultPii: false,

    initialScope: {
      tags: {
        app: "kuizard",
        runtime: "browser",
      },
    },

    // On filtre les bruits classiques côté browser
    ignoreErrors: [
      // Erreurs de bot crawler
      "Non-Error promise rejection captured",
      // Erreurs d'extension navigateur
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Cancellations user (back button, refresh)
      "AbortError",
    ],
  });
}
