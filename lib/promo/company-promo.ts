// =============================================
// V51 — Helpers pour les codes promo société
// =============================================

import crypto from "node:crypto";
import { prisma } from "@/lib/db";

export type CompanyPromoDTO = {
  id: string;
  code: string;
  description: string;
  discountPercent: number | null;
  validUntil: Date | null;
};

/**
 * Retourne les codes promo actifs d'un user (= société).
 * Un code est actif s'il est `active === true`, non expiré, et pas
 * encore atteint son maxUses.
 */
export async function getActiveCompanyPromos(
  userId: string
): Promise<CompanyPromoDTO[]> {
  const now = new Date();
  const codes = await prisma.companyPromoCode.findMany({
    where: {
      userId,
      active: true,
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: {
      id: true,
      code: true,
      description: true,
      discountPercent: true,
      validUntil: true,
      maxUses: true,
      currentUses: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return codes
    .filter((c) => c.maxUses === null || c.currentUses < c.maxUses)
    .map(({ maxUses: _m, currentUses: _u, ...rest }) => rest);
}

/**
 * Récupère le code promo à afficher en bandeau pour un quiz, ou null.
 */
export async function getQuizCompanyPromo(
  quizId: string
): Promise<CompanyPromoDTO | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { displayCompanyPromoId: true, userId: true },
  });
  if (!quiz?.displayCompanyPromoId) return null;
  const promo = await prisma.companyPromoCode.findUnique({
    where: { id: quiz.displayCompanyPromoId },
    select: {
      id: true,
      code: true,
      description: true,
      discountPercent: true,
      validUntil: true,
      active: true,
      maxUses: true,
      currentUses: true,
      userId: true,
    },
  });
  // Sanity : le promo doit toujours appartenir à la société proprio du quiz
  if (!promo || promo.userId !== quiz.userId) return null;
  if (!promo.active) return null;
  if (promo.validUntil && promo.validUntil < new Date()) return null;
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) return null;
  return {
    id: promo.id,
    code: promo.code,
    description: promo.description,
    discountPercent: promo.discountPercent,
    validUntil: promo.validUntil,
  };
}

/** Log une "vue" ou "copie" du code promo. Tracking ROI admin. */
export async function logCompanyPromoUsage(
  promoCodeId: string,
  quizId: string | null,
  action: "view" | "copy",
  rawIp: string | null
): Promise<void> {
  const ipHash = rawIp
    ? crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16)
    : null;
  await prisma.companyPromoCodeUsage
    .create({
      data: { promoCodeId, quizId, action, ipHash },
    })
    .catch((e) => console.warn("[promo-usage] create failed:", e));

  // Incrément currentUses sur copy uniquement (vue ne consomme pas)
  if (action === "copy") {
    await prisma.companyPromoCode
      .update({
        where: { id: promoCodeId },
        data: { currentUses: { increment: 1 } },
      })
      .catch((e) => console.warn("[promo-uses] increment failed:", e));
  }
}
