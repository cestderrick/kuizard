// =============================================
// Sentry — Edge runtime (no-op)
// =============================================
// Le projet Kuizard n'utilise pas l'Edge runtime (pas de middleware Edge,
// Auth.js v5 tourne en Node). On garde ce fichier vide pour respecter la
// convention Next.js, sans déclencher d'init Sentry — ce qui éviterait de
// toute façon les contraintes Edge (pas d'eval, pas de new Function).
//
// Si tu ajoutes un jour un middleware Edge et que tu veux y tracer les
// erreurs, recopie le pattern de sentry.server.config.ts en utilisant
// l'import statique de @sentry/nextjs (le package devra alors être
// installé pour que le build passe en mode Edge).

export {};
