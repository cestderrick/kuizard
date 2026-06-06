"use server";

// =============================================
// Server Actions — Codes promos côté user
// =============================================
//
// Deux types de codes :
// 1. Réduction (% off / amount off)  → on renvoie une URL Checkout avec le
//    code pré-rempli pour appliquer au prochain achat
// 2. Cadeau (giftPlanSlug)           → on débloque DIRECTEMENT un quizz avec
//    ce plan, sans paiement Stripe

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type RedeemState = {
  ok: boolean;
  message?: string;
  // Si code de réduction : redirige le user vers la page upgrade quiz
  // (il devra choisir un quizz et appliquer le code au moment du checkout)
  type?: "discount" | "gift";
  giftPlanSlug?: string;
};

const INITIAL: RedeemState = { ok: false };
export const initialRedeemState = INITIAL;

/**
 * Étape 1 : le user saisit un code. On le valide et on lui indique quoi faire.
 */
export async function validatePromoCodeAction(
  _prev: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const codeRaw = (formData.get("code") as string) ?? "";
  const code = codeRaw.toUpperCase().trim();
  if (!code) return { ok: false, message: "Saisis un code." };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo) return { ok: false, message: "Code inconnu." };
  if (!promo.isActive) return { ok: false, message: "Ce code n'est plus actif." };
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { ok: false, message: "Ce code a expiré." };
  }
  if (
    promo.maxRedemptions !== null &&
    promo.redemptions >= promo.maxRedemptions
  ) {
    return { ok: false, message: "Ce code a atteint son nombre max d'utilisations." };
  }

  // Code cadeau : on indique au front quel plan offert (pour qu'il propose le
  // choix d'un de ses quizz à débloquer)
  if (promo.giftPlanSlug) {
    return {
      ok: true,
      type: "gift",
      giftPlanSlug: promo.giftPlanSlug,
      message: `Code cadeau valide ! Choisis le quizz à débloquer avec le plan "${promo.giftPlanSlug}".`,
    };
  }

  // Code de réduction : on confirme et on indique que c'est utilisable au checkout
  return {
    ok: true,
    type: "discount",
    message: promo.percentOff
      ? `Code valide ! -${promo.percentOff}% sur ton prochain achat. Saisis-le au moment du checkout.`
      : `Code valide ! -${(promo.amountOffCents ?? 0) / 100}€ sur ton prochain achat. Saisis-le au moment du checkout.`,
  };
}

/**
 * Étape 2 (cadeau uniquement) : applique le plan à un quizz que l'user choisit.
 */
export async function applyGiftCodeAction(
  _prev: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const codeRaw = (formData.get("code") as string) ?? "";
  const code = codeRaw.toUpperCase().trim();
  const quizId = (formData.get("quizId") as string) ?? "";

  if (!code || !quizId) {
    return { ok: false, message: "Code ou quizz manquant." };
  }

  const [promo, quiz] = await Promise.all([
    prisma.promoCode.findUnique({ where: { code } }),
    prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, userId: true, isPaid: true },
    }),
  ]);

  if (!promo) return { ok: false, message: "Code inconnu." };
  if (!quiz || quiz.userId !== session.user.id) {
    return { ok: false, message: "Quizz introuvable." };
  }

  if (!promo.giftPlanSlug) {
    return { ok: false, message: "Ce code n'est pas un code cadeau." };
  }
  if (!promo.isActive || (promo.expiresAt && promo.expiresAt < new Date())) {
    return { ok: false, message: "Code expiré ou désactivé." };
  }
  if (
    promo.maxRedemptions !== null &&
    promo.redemptions >= promo.maxRedemptions
  ) {
    return { ok: false, message: "Plus d'utilisation disponible." };
  }

  // On enregistre un Payment "gift" pour tracer + le webhook futur ne re-marquera
  // pas isPaid s'il existe déjà
  await prisma.$transaction([
    prisma.quiz.update({
      where: { id: quizId },
      data: { isPaid: true },
    }),
    prisma.payment.create({
      data: {
        userId: session.user.id,
        quizId,
        amountCents: 0,
        planSlug: promo.giftPlanSlug,
        promoCodeId: promo.id,
        status: "succeeded",
      },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { redemptions: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath("/dashboard/promos");

  return {
    ok: true,
    type: "gift",
    message: `🎉 Quizz débloqué avec le plan ${promo.giftPlanSlug} !`,
  };
}
