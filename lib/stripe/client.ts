// =============================================
// Singleton Stripe SDK (côté serveur uniquement)
// =============================================
// JAMAIS importé depuis du code client ! Si tu vois ça importé dans un
// "use client", c'est un bug — la clé secrète fuiterait dans le bundle nav.

import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  console.warn(
    "[Stripe] STRIPE_SECRET_KEY manquante — les paiements ne fonctionneront pas."
  );
}

// On laisse Stripe utiliser la version d'API associée au compte par défaut.
// On pourra l'épingler plus tard quand on aura validé une cible précise
// (ex: après bump du SDK Stripe).
export const stripe = new Stripe(apiKey ?? "sk_test_placeholder", {
  typescript: true,
  appInfo: {
    name: "Kuizard",
    version: "1.0.0",
    url: "https://kuizard.fr",
  },
});

export function formatStripeAmount(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
