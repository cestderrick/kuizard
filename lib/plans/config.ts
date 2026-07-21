// =============================================
// Helper pour lire la config des plans + vérifier les limites
// =============================================
//
// On lit la BDD plutôt que l'enum Prisma `Plan` car l'admin peut modifier
// tarifs et limites à la volée. Les plans existants gardent leur slug stable.

import { prisma } from "@/lib/db";

export type PlanLimits = {
  maxQuestions?: number;
  maxParticipants?: number;
  customColors?: boolean;
  customPrizes?: boolean;
  finalMessage?: boolean;
  coverImage?: boolean;
  questionImages?: boolean;
  scheduledMode?: boolean;
  liveMode?: boolean;
  ranking?: boolean;
  tvDisplay?: boolean;
  // Pour les abos : nombre max d'utilisations de la banque de templates par mois
  // calendaire (du 1er au dernier jour du mois). 0 = aucun accès, undefined =
  // illimité (rétrocompat). Non-abonnés : illimité (pas de quota mensuel).
  maxTemplatesPerMonth?: number;
  // Nombre max de quizz actifs simultanément (abos)
  maxActiveQuizzes?: number;
  // V60.3 — Escape games digitaux
  // Nombre max d'escapes qu'un user peut avoir (undefined = illimité, 0 = pas
  // le droit). Le plan free vaut 0 (payant/abo requis).
  maxEscapes?: number;
  // Nombre max d'etapes (steps) par escape
  maxEscapeSteps?: number;
  // Nombre max d'equipes par escape
  maxTeamsPerEscape?: number;
  // Features escape-specifiques debloquables selon plan
  escapeChrono?: boolean;      // active le chrono global
  escapeHints?: boolean;       // active les indices deblocables
  escapeCustomTheme?: boolean; // personnalisation couleurs escape
};

export type PlanConfigDTO = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  type: string;
  interval: string | null;
  priceCents: number;
  stripePriceId: string | null;
  limits: PlanLimits;
  displayOrder: number;
  isActive: boolean;
  isHighlighted: boolean;
};

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
    limits: (p.limits as PlanLimits) ?? {},
  };
}

export async function getActivePlans(
  type?: "one_shot" | "subscription"
): Promise<PlanConfigDTO[]> {
  const plans = await prisma.planConfig.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { priceCents: "asc" }],
  });
  return plans.map(toDTO);
}

export async function getPlanBySlug(
  slug: string
): Promise<PlanConfigDTO | null> {
  const p = await prisma.planConfig.findUnique({ where: { slug } });
  return p ? toDTO(p) : null;
}

/**
 * Récupère le plan "FREE" (gratuit) — celui qui s'applique à tout quizz
 * dont l'utilisateur n'a pas payé.
 */
export async function getFreePlan(): Promise<PlanConfigDTO | null> {
  return getPlanBySlug("free");
}
