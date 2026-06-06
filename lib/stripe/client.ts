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

export const stripe = new Stripe(apiKey ?? "sk_test_placeholder", {
  // Épingle la version d'API pour éviter les surprises lors d'updates SDK
  apiVersion: "2025-09-30.clover",
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
