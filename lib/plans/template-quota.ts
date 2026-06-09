// =============================================
// Quota mensuel d'utilisation de la banque de templates
// =============================================
//
// Règles :
// - Seuls les utilisateurs avec un abonnement actif sont soumis au quota
//   (les comptes free / one-shot n'ont pas de notion de "mois", chaque quizz
//    est payé à l'unité).
// - Le mois est calendaire UTC : du 1er à 00:00 au dernier à 23:59:59.
// - On compte les quizz créés depuis un template ce mois-ci.
// - Si le plan a `maxTemplatesPerMonth` indéfini → illimité.

import { prisma } from "@/lib/db";

export type TemplateQuotaInfo = {
  /** true si l'user est limité par un quota (= il a un abo) */
  isQuota: boolean;
  /** nombre de quizz créés depuis un template ce mois-ci */
  used: number;
  /** quota max du plan, ou null si illimité */
  max: number | null;
  /** plan actif de l'user (slug), null si pas d'abo */
  planSlug: string | null;
};

function firstDayOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getTemplateQuota(
  userId: string
): Promise<TemplateQuotaInfo> {
  // Cherche un abo actif
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) {
    return { isQuota: false, used: 0, max: null, planSlug: null };
  }

  const plan = await prisma.planConfig.findUnique({
    where: { slug: sub.planSlug },
    select: { limits: true },
  });

  const limits = (plan?.limits as { maxTemplatesPerMonth?: number }) ?? {};
  const max = limits.maxTemplatesPerMonth;

  // max undefined ou null → illimité
  if (max === undefined || max === null) {
    return { isQuota: false, used: 0, max: null, planSlug: sub.planSlug };
  }

  // Compteur ce mois-ci
  const used = await prisma.quiz.count({
    where: {
      userId,
      fromTemplateSlug: { not: null },
      createdAt: { gte: firstDayOfCurrentMonth() },
    },
  });

  return { isQuota: true, used, max, planSlug: sub.planSlug };
}

/**
 * Vérifie si l'user peut créer un nouveau quizz depuis un template
 * (= le quota du mois n'est pas atteint).
 */
export async function canUseTemplateNow(userId: string): Promise<{
  ok: boolean;
  message?: string;
  quota: TemplateQuotaInfo;
}> {
  const quota = await getTemplateQuota(userId);
  if (!quota.isQuota) return { ok: true, quota };
  if (quota.max === null) return { ok: true, quota };
  if (quota.used >= quota.max) {
    return {
      ok: false,
      message: `Quota de templates atteint : ${quota.used}/${quota.max} ce mois-ci sur ton plan "${quota.planSlug}". Reviens le mois prochain ou passe à un plan supérieur.`,
      quota,
    };
  }
  return { ok: true, quota };
}
