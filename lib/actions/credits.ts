"use server";

// =============================================
// V33 — Action : appliquer un crédit one-shot à un quiz
// =============================================
// Le user a acheté un crédit (Payment.quizId=null). Il choisit maintenant
// le quiz auquel l'associer. On set Payment.quizId + on flag le quiz comme
// "isPaid" (utilisé par getEffectivePlan pour le gating).

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type ApplyCreditState = {
  ok: boolean;
  message?: string;
};

export async function applyCreditToQuizAction(
  _prev: ApplyCreditState,
  formData: FormData
): Promise<ApplyCreditState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const paymentId = formData.get("paymentId");
  const quizId = formData.get("quizId");

  if (typeof paymentId !== "string" || !paymentId) {
    return { ok: false, message: "Crédit manquant." };
  }
  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }

  // Vérifier que le crédit appartient au user, est succeeded, et libre
  const credit = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId: session.user.id,
      status: "succeeded",
      quizId: null,
    },
    select: { id: true, planSlug: true },
  });
  if (!credit) {
    return {
      ok: false,
      message: "Crédit introuvable ou déjà utilisé.",
    };
  }

  // Vérifier que le quiz appartient au user
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: { id: true, isPaid: true },
  });
  if (!quiz) {
    return { ok: false, message: "Quizz introuvable." };
  }
  if (quiz.isPaid) {
    return {
      ok: false,
      message: "Ce quizz est déjà débloqué — pas besoin d'appliquer un crédit.",
    };
  }

  // Atomique : update du Payment + du Quiz
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: credit.id },
      data: { quizId: quiz.id },
    }),
    prisma.quiz.update({
      where: { id: quiz.id },
      data: { isPaid: true },
    }),
  ]);

  revalidatePath("/dashboard/quizzes");
  revalidatePath(`/dashboard/quizzes/${quiz.id}/edit`);
  return {
    ok: true,
    message: `✨ Crédit ${credit.planSlug ?? ""} appliqué — ton quizz est débloqué.`,
  };
}
