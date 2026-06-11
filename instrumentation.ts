// =============================================
// Next.js instrumentation — Sentry
// =============================================
// Ce fichier est appelé par Next.js au boot du process (côté Node + Edge).
// On y initialise Sentry pour catcher toutes les erreurs serveur en prod.
//
// Côté client, voir `instrumentation-client.ts`.
// Voir https://docs.sentry.io/platforms/javascript/guides/nextjs/

export async function register() {
  if (!process.env.SENTRY_DSN) {
    // Pas de DSN configuré → on skip Sentry (utile en dev local)
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  err: unknown,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string }
) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
}
