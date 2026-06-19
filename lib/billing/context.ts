// =============================================
// Helper Billing Context
// =============================================
// Source de vérité unique pour savoir si un user a :
// - un abonnement actif (payé via Stripe OU offert par un admin via GrantedPlan)
// - des paiements one-shot OU des crédits one-shot offerts (GrantedPlan)
// - ou rien (free)
//
// V37 : corrige le bug où les GrantedPlan (cadeaux admin) n'étaient pas
// pris en compte ici. Du coup les gates Quizthèque/lock/CTAs traitaient les
// users gratifiés comme "free" même s'ils avaient l'équivalent d'un abo.

import { prisma } from "@/lib/db";

export type BillingContext = {
  hasActiveSubscription: boolean;
  subscription: {
    planSlug: string;
    planName: string | null;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    /** V37 : true si l'abo vient d'un GrantedPlan admin (pas de Stripe) */
    isGifted: boolean;
  } | null;
  /** Paiements one-shot succeeded + cadeaux GrantedPlan one_shot non révoqués */
  oneShotCount: number;
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

  const now = new Date();

  const [activeSub, giftedSub, oneShotPaymentCount, giftedOneShotCount] =
    await Promise.all([
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
      // V37 : Abo offert par un admin (GrantedPlan type=subscription actif)
      prisma.grantedPlan.findFirst({
        where: {
          userId,
          type: "subscription",
          revokedAt: null,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        orderBy: { createdAt: "desc" },
        select: {
          planSlug: true,
          startsAt: true,
          endsAt: true,
        },
      }),
      prisma.payment.count({
        where: { userId, status: "succeeded" },
      }),
      // V37 : Crédits one-shot offerts par admin (non révoqués)
      prisma.grantedPlan.count({
        where: {
          userId,
          type: "one_shot",
          revokedAt: null,
        },
      }),
    ]);

  // Stripe-payé prioritaire sur cadeau (rare qu'on ait les deux, mais au cas où)
  const effectiveSubSlug = activeSub?.planSlug ?? giftedSub?.planSlug ?? null;
  const isGifted = !activeSub && !!giftedSub;

  let planName: string | null = null;
  if (effectiveSubSlug) {
    const plan = await prisma.planConfig.findUnique({
      where: { slug: effectiveSubSlug },
      select: { name: true },
    });
    planName = plan?.name ?? null;
  }

  const hasActiveSubscription = !!activeSub || !!giftedSub;
  const oneShotCount = oneShotPaymentCount + giftedOneShotCount;
  const tier: BillingContext["tier"] = hasActiveSubscription
    ? "subscriber"
    : oneShotCount > 0
    ? "oneshot"
    : "free";

  let subscription: BillingContext["subscription"] = null;
  if (activeSub) {
    subscription = {
      planSlug: activeSub.planSlug,
      planName,
      status: activeSub.status,
      currentPeriodEnd: activeSub.currentPeriodEnd,
      cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
      isGifted: false,
    };
  } else if (giftedSub) {
    subscription = {
      planSlug: giftedSub.planSlug,
      planName,
      status: "active",
      currentPeriodEnd: giftedSub.endsAt,
      cancelAtPeriodEnd: false,
      isGifted: true,
    };
  }

  return {
    hasActiveSubscription,
    subscription,
    oneShotCount,
    tier,
  };
}
