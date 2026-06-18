// =============================================
// Helper Billing Context
// =============================================
// Source de vérité unique pour savoir si un user a :
// - un abonnement actif (et lequel + expiration)
// - des paiements one-shot
// - ou rien (free)
//
// Utilisé par les CTAs pour adapter leur ton :
// - free → on pousse fort
// - one-shot mais pas d'abo → on remercie + propose juste l'upsell abo
// - abo actif → on reste très discret, juste lien "gérer mon abo"

import { prisma } from "@/lib/db";

export type BillingContext = {
  hasActiveSubscription: boolean;
  subscription: {
    planSlug: string;
    planName: string | null;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  oneShotCount: number; // nombre de paiements one-shot succeeded
  // Calculé : "free" | "oneshot" | "subscriber"
  tier: "free" | "oneshot" | "subscriber";
};

export async function getBillingContext(
  userId: string | null | undefined
): Promise<BillingContext> {
  if (!userId) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      oneShotCount: 0,
      tier: "free",
    };
  }

  const [activeSub, oneShotCount] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["active", "trialing", "past_due"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        planSlug: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    }),
    prisma.payment.count({
      where: { userId, status: "succeeded" },
    }),
  ]);

  let planName: string | null = null;
  if (activeSub) {
    const plan = await prisma.planConfig.findUnique({
      where: { slug: activeSub.planSlug },
      select: { name: true },
    });
    planName = plan?.name ?? null;
  }

  const hasActiveSubscription = !!activeSub;
  const tier: BillingContext["tier"] = hasActiveSubscription
    ? "subscriber"
    : oneShotCount > 0
    ? "oneshot"
    : "free";

  return {
    hasActiveSubscription,
    subscription: activeSub
      ? {
          planSlug: activeSub.planSlug,
          planName,
          status: activeSub.status,
          currentPeriodEnd: activeSub.currentPeriodEnd,
          cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
        }
      : null,
    oneShotCount,
    tier,
  };
}
