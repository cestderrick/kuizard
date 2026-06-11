// =============================================
// Next.js instrumentation — Sentry (optionnel)
// =============================================
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
    // Import non analysable par les bundlers : eval() pour bypasser
    // l'analyse statique de Turbopack/Webpack.
    const pkgName = "@sentry/nextjs";
    const dynImport = new Function("p", "return import(p)") as (
      p: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<any>;
    const Sentry = await dynImport(pkgName);
    Sentry.captureRequestError(err, request, context);
  } catch {
    // @sentry/nextjs pas installé — on ne fait rien
  }
}
