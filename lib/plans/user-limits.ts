// =============================================
// V47.4 — Helper : limites du plan d'un user (hors quiz)
// =============================================
// Utilisé à la création/duplication d'un nouveau quiz pour savoir combien
// de questions on autorise. Si le user a un abonnement actif (Stripe ou
// GrantedPlan), on prend les limits de ce plan. Sinon → plan free.

import { prisma } from "@/lib/db";
import type { PlanLimits } from "@/lib/plans/config";
import { getBillingContext } from "@/lib/billing/context";

const FREE_FALLBACK: PlanLimits = {
  maxQuestions: 5,
  maxParticipants: 20,
  customColors: false,
  customPrizes: false,
  finalMessage: false,
  coverImage: false,
  questionImages: false,
  scheduledMode: false,
  liveMode: false,
  ranking: true,
  tvDisplay: false,
};

export async function getPlanLimitsForUser(
  userId: string
): Promise<PlanLimits> {
  const billing = await getBillingContext(userId);

  // Si abonné (Stripe ou cadeau admin), on retourne les limits du plan abo
  if (billing.subscription?.planSlug) {
    const plan = await prisma.planConfig.findUnique({
      where: { slug: billing.subscription.planSlug },
      select: { limits: true },
    });
    if (plan?.limits && typeof plan.limits === "object") {
      return plan.limits as PlanLimits;
    }
  }

  // Sinon : plan free depuis BDD ou fallback hardcoded
  const freePlan = await prisma.planConfig.findUnique({
    where: { slug: "free" },
    select: { limits: true },
  });
  if (freePlan?.limits && typeof freePlan.limits === "object") {
    return freePlan.limits as PlanLimits;
  }
  return FREE_FALLBACK;
}
