// =============================================
// Helper : verrouillage d'un quizz après usage
// =============================================
// Règle V29 (Option A) :
// - Quizz "verrouillé" = il a déjà été terminé OU a au moins une participation
//   completée. Dans ce cas, on bloque les modifs sensibles (questions, mode,
//   dates) pour éviter qu'un user ne ré-utilise le même paiement à l'infini.
// - Les abonnés (sub active) sont EXEMPTÉS : ils ont droit à l'illimité.
// - Le cosmétique (titre, description, cover, thème, lots) reste éditable
//   pour tous (utile pour réparer une coquille même après).

import { prisma } from "@/lib/db";
import { getBillingContext } from "@/lib/billing/context";

export type QuizLockState = {
  isLocked: boolean;
  reason: "none" | "finished" | "has_completed_participations";
  /** true si l'utilisateur a un abonnement actif → pas de lock */
  isSubscriber: boolean;
};

export async function getQuizLockState(quizId: string): Promise<QuizLockState> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      userId: true,
      status: true,
      _count: {
        select: {
          participations: { where: { completedAt: { not: null } } },
        },
      },
    },
  });
  if (!quiz) {
    return { isLocked: false, reason: "none", isSubscriber: false };
  }

  const billing = await getBillingContext(quiz.userId);
  // Abonné = pas de lock
  if (billing.hasActiveSubscription) {
    return { isLocked: false, reason: "none", isSubscriber: true };
  }

  if (quiz.status === "FINISHED") {
    return {
      isLocked: true,
      reason: "finished",
      isSubscriber: false,
    };
  }
  if (quiz._count.participations > 0) {
    return {
      isLocked: true,
      reason: "has_completed_participations",
      isSubscriber: false,
    };
  }
  return { isLocked: false, reason: "none", isSubscriber: false };
}

/**
 * Throw une erreur si le quizz est lock. À appeler en début de toute action
 * de modification "sensible" (CRUD questions, update mode/dates, etc.).
 */
export async function assertQuizUnlocked(quizId: string): Promise<void> {
  const lock = await getQuizLockState(quizId);
  if (lock.isLocked) {
    throw new Error(
      "Ce quizz a déjà été utilisé. Pour modifier les questions, duplique-le ou passe à un abonnement illimité."
    );
  }
}
