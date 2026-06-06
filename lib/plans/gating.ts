// =============================================
// Gating — quel plan s'applique à un quizz ?
// =============================================
//
// Règles métier :
// 1. Si le user a un abonnement actif (Bar Essentiel / Bar Pro), le plan
//    le plus "haut" (priceCents max) s'applique à TOUS ses quizz.
// 2. Sinon, si le quizz est marqué isPaid avec un Payment succeeded,
//    le plan acheté s'applique à ce quizz uniquement.
// 3. Sinon : plan "free" (limites strictes).

import { prisma } from "@/lib/db";
import type { PlanConfigDTO, PlanLimits } from "@/lib/plans/config";

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

function toLimits(json: unknown): PlanLimits {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return json as PlanLimits;
  }
  return {};
}

function toDTO(p: {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  type: string;
  interval: string | null;
  priceCents: number;
  stripePriceId: string | null;
  limits: unknown;
  displayOrder: number;
  isActive: boolean;
  isHighlighted: boolean;
}): PlanConfigDTO {
  return {
    ...p,
    limits: toLimits(p.limits),
  };
}

/**
 * Renvoie le plan effectif pour un quizz donné.
 * Lit la BDD à chaque appel — pas de cache, on veut la fraîcheur (les admins
 * peuvent changer les limites en temps réel).
 */
export async function getEffectivePlan(
  quizId: string
): Promise<PlanConfigDTO> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { userId: true, isPaid: true },
  });
  if (!quiz) return makeFreeFallback();

  // 1. Y a-t-il un abonnement actif ?
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: quiz.userId,
      status: { in: ["active", "trialing"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (activeSub) {
    const plan = await prisma.planConfig.findUnique({
      where: { slug: activeSub.planSlug },
    });
    if (plan) return toDTO(plan);
  }

  // 2. Quizz payé via Payment ?
  if (quiz.isPaid) {
    const payment = await prisma.payment.findFirst({
      where: { quizId, status: "succeeded" },
      orderBy: { createdAt: "desc" },
      select: { planSlug: true },
    });
    if (payment?.planSlug) {
      const plan = await prisma.planConfig.findUnique({
        where: { slug: payment.planSlug },
      });
      if (plan) return toDTO(plan);
    }
  }

  // 3. Fallback : plan free depuis la BDD ou hardcoded si pas seedé
  const freePlan = await prisma.planConfig.findUnique({
    where: { slug: "free" },
  });
  if (freePlan) return toDTO(freePlan);

  return makeFreeFallback();
}

function makeFreeFallback(): PlanConfigDTO {
  return {
    id: "fallback-free",
    slug: "free",
    name: "Découverte",
    tagline: null,
    description: null,
    type: "one_shot",
    interval: null,
    priceCents: 0,
    stripePriceId: null,
    limits: FREE_FALLBACK,
    displayOrder: 0,
    isActive: true,
    isHighlighted: false,
  };
}

// =============================================
// Erreur métier : limite atteinte
// =============================================

export type LimitError = {
  ok: false;
  message: string;
  limit?: string;
  current?: number;
  max?: number;
  upgradeUrl?: string;
};

export function limitReached(
  limit: keyof PlanLimits,
  current: number,
  max: number,
  upgradeUrl?: string
): LimitError {
  const labelMap: Partial<Record<keyof PlanLimits, string>> = {
    maxQuestions: "Nombre de questions",
    maxParticipants: "Nombre de participants",
  };
  const label = labelMap[limit] ?? String(limit);
  return {
    ok: false,
    message: `${label} : tu as atteint la limite de ton plan (${current}/${max}). Passe à un plan supérieur pour continuer.`,
    limit: String(limit),
    current,
    max,
    upgradeUrl,
  };
}

export function featureLocked(
  feature: keyof PlanLimits,
  upgradeUrl?: string
): LimitError {
  const labelMap: Partial<Record<keyof PlanLimits, string>> = {
    customColors: "Personnalisation des couleurs",
    customPrizes: "Lots personnalisés",
    finalMessage: "Message de fin",
    coverImage: "Photo de couverture",
    questionImages: "Photos sur les questions",
    scheduledMode: "Mode créneau horaire",
    liveMode: "Mode pilotage live",
    tvDisplay: "Affichage TV",
  };
  const label = labelMap[feature] ?? String(feature);
  return {
    ok: false,
    message: `${label} : option non incluse dans ton plan. Passe à un plan supérieur pour l'activer.`,
    limit: String(feature),
    upgradeUrl,
  };
}
