// =============================================
// Next.js instrumentation — Sentry (optionnel)
// =============================================
// Si @sentry/nextjs n'est pas installé ou si SENTRY_DSN n'est pas configuré,
// tout est no-op silencieusement.
//
// Note : on ne wire pas l'Edge runtime car le projet Kuizard n'a pas de
// middleware Edge. L'init Edge nécessiterait un import statique de
// @sentry/nextjs (eval interdit en Edge runtime), donc on évite.

export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    await import("./sentry.server.config");
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
    // Import non analysable par les bundlers : new Function pour bypasser
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
