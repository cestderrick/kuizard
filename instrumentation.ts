// =============================================
// Next.js instrumentation — Sentry (optionnel)
// =============================================
// Ce fichier est appelé par Next.js au boot du process.
// Si @sentry/nextjs n'est pas installé ou si SENTRY_DSN n'est pas configuré,
// tout est no-op silencieusement.

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    } else if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  } catch (err) {
    console.warn(
      "[sentry] register failed:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function onRequestError(
  err: unknown,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string }
) {
  if (!process.env.SENTRY_DSN) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Sentry = await import("@sentry/nextjs" as any);
    Sentry.captureRequestError(err, request, context);
  } catch {
    // @sentry/nextjs pas installé — on ne fait rien
  }
}
