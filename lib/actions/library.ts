"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateUniqueQuizCode } from "@/lib/quiz/generate-code";
import { getBillingContext } from "@/lib/billing/context";
import { getPlanLimitsForUser } from "@/lib/plans/user-limits";

export type DuplicateState = {
  ok: boolean;
  message?: string;
};

/**
 * Duplique un quiz de la banque (isLibrary=true) dans le compte du user.
 * - Copie le quiz : titre, description, theme, settings, photos cover
 * - Copie toutes les questions associées avec leurs options
 * - Génère un nouveau code unique
 * - Statut DRAFT pour que le user puisse modifier avant publication
 * - isLibrary=false sur la copie (c'est un quiz user normal maintenant)
 *
 * Au succès : redirige vers l'éditeur du nouveau quiz.
 */
export async function duplicateLibraryQuizAction(
  _prev: DuplicateState,
  formData: FormData
): Promise<DuplicateState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Tu dois être connecté pour dupliquer." };
  }
  const userId = session.user.id;

  const libraryQuizId = formData.get("libraryQuizId");
  if (typeof libraryQuizId !== "string" || !libraryQuizId) {
    return { ok: false, message: "ID quiz library invalide." };
  }

  // 1. Récupère le quiz library source avec ses questions
  const source = await prisma.quiz.findUnique({
    where: { id: libraryQuizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });
  if (!source || !source.isLibrary) {
    return { ok: false, message: "Ce quiz n'est pas disponible dans la banque." };
  }

  // V26 : gating premium → uniquement abonnés actifs
  if (source.libraryIsPremium) {
    const billing = await getBillingContext(userId);
    if (!billing.hasActiveSubscription) {
      return {
        ok: false,
        message:
          "Ce quizz est réservé aux abonnés. Souscris à un abonnement pour le dupliquer.",
      };
    }
  }

  // 2. Crée le nouveau quiz dans le compte du user
  const code = await generateUniqueQuizCode();
  let newQuizId: string;

  try {
    const newQuiz = await prisma.$transaction(async (tx) => {
      const created = await tx.quiz.create({
        data: {
          userId,
          code,
          title: source.title,
          description: source.description,
          coverImageUrl: source.coverImageUrl,
          // theme et settings sont des JSON, on les copie tels quels
          theme: source.theme as object,
          settings: source.settings as object,
          mode: source.mode,
          prizes: source.prizes ?? undefined,
          finalMessage: source.finalMessage,
          // Le nouveau quiz n'est PAS dans la banque (c'est une copie user)
          isLibrary: false,
          // Statut DRAFT pour que le user puisse modifier avant publication
          status: "DRAFT",
        },
      });

      // 3. Copie les questions, sliced selon le plan du user destinataire.
      // V47.4 : un user free qui copie un quiz library de 20Q n'en garde
      // que les 5 premières (sa limite). Sinon il bénéficierait gratos
      // d'un quiz 20Q. Subscriber → toutes les questions.
      const userLimits = await getPlanLimitsForUser(userId);
      const maxQ = userLimits.maxQuestions ?? 5;
      const slicedQuestions = source.questions.slice(0, maxQ);
      if (slicedQuestions.length > 0) {
        await tx.question.createMany({
          data: slicedQuestions.map((q) => ({
            quizId: created.id,
            order: q.order,
            type: q.type,
            text: q.text,
            imageUrl: q.imageUrl,
            options: q.options as object,
            points: q.points,
            timerSeconds: q.timerSeconds,
          })),
        });
      }

      return created;
    });
    newQuizId = newQuiz.id;
  } catch (err) {
    console.error("[library] duplicate failed:", err);
    return {
      ok: false,
      message: "Erreur lors de la duplication. Réessaie dans quelques instants.",
    };
  }

  // 4. Redirige vers l'éditeur du nouveau quiz
  redirect(`/dashboard/quizzes/${newQuizId}/edit`);
}
