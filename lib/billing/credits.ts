// =============================================
// V33 — Helpers crédits one-shot
// =============================================
// Un crédit = un Payment avec quizId=null et status="succeeded".
// L'utilisateur achète des crédits sans choisir de quiz à l'avance, puis les
// applique plus tard à un quiz précis via applyCreditToQuizAction.

import { prisma } from "@/lib/db";

export type UnusedCredit = {
  id: string;
  planSlug: string | null;
  planName: string | null;
  amountCents: number;
  createdAt: Date;
};

/**
 * Retourne la liste des crédits one-shot non utilisés du user (Payments
 * succeeded sans quizId associé). Trié du plus ancien au plus récent (FIFO).
 */
export async function getUnusedCredits(
  userId: string | null | undefined
): Promise<UnusedCredit[]> {
  if (!userId) return [];

  const payments = await prisma.payment.findMany({
    where: {
      userId,
      status: "succeeded",
      quizId: null,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      planSlug: true,
      amountCents: true,
      createdAt: true,
    },
  });

  // Enrichir avec le nom du plan
  const slugs = Array.from(
    new Set(payments.map((p) => p.planSlug).filter((s): s is string => !!s))
  );
  const plans = slugs.length
    ? await prisma.planConfig.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true },
      })
    : [];
  const planMap = new Map(plans.map((p) => [p.slug, p.name]));

  return payments.map((p) => ({
    id: p.id,
    planSlug: p.planSlug,
    planName: p.planSlug ? planMap.get(p.planSlug) ?? null : null,
    amountCents: p.amountCents,
    createdAt: p.createdAt,
  }));
}

export async function countUnusedCredits(
  userId: string | null | undefined
): Promise<number> {
  if (!userId) return 0;
  return prisma.payment.count({
    where: { userId, status: "succeeded", quizId: null },
  });
}
