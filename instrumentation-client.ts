// =============================================
// Sentry — Configuration côté navigateur
// =============================================
// Next.js charge automatiquement ce fichier dans le bundle client si présent.
// Si @sentry/nextjs n'est pas installé ou si NEXT_PUBLIC_SENTRY_DSN n'est pas
// défini, on no-op silencieusement.

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  // Import dynamique : Webpack inclura @sentry/nextjs UNIQUEMENT si l'env est
  // configurée au build. Si le package n'est pas installé, le catch silencie.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import("@sentry/nextjs" as any)
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
    .catch((err) => {
      console.warn(
        "[sentry] @sentry/nextjs not installed — browser tracing skipped:",
        err?.message ?? err
      );
    });
}
