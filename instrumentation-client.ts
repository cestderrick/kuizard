// =============================================
// Sentry — Configuration côté navigateur
// =============================================
// Si @sentry/nextjs n'est pas installé ou si NEXT_PUBLIC_SENTRY_DSN n'est pas
// défini, on no-op silencieusement.
//
// Astuce Turbopack/Webpack : on passe par une variable + new Function pour
// que le bundler ne tente PAS de résoudre @sentry/nextjs au build time. Cela
// permet de garder ce fichier dans le repo même si le package n'est pas
// installé — il sera juste no-op à runtime.

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  const pkgName = "@sentry/nextjs";
  // Function constructor crée un import non analysable par les bundlers
  const dynImport = new Function("p", "return import(p)") as (
    p: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any>;

  dynImport(pkgName)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((Sentry: any) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        enabled: process.env.NODE_ENV === "production",
        sendDefaultPii: false,
        initialScope: {
          tags: { app: "kuizard", runtime: "browser" },
        },
        ignoreErrors: [
          "Non-Error promise rejection captured",
          "ResizeObserver loop limit exceeded",
          "ResizeObserver loop completed with undelivered notifications",
          "AbortError",
        ],
      });
    })
    .catch((err: Error) => {
      console.warn(
        "[sentry] @sentry/nextjs not installed — browser tracing skipped:",
        err?.message ?? err
      );
    });
}
