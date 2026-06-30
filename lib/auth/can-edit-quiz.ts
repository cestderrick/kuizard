// =============================================
// V53.3 — Helper : un admin peut éditer le quiz d'un autre user (modération/assistance)
// =============================================

import { prisma } from "@/lib/db";

/**
 * Retourne true si l'user a le droit d'éditer le quiz : soit il en est le
 * propriétaire, soit il est admin (assistance/modération).
 */
export async function canEditQuiz(
  quizId: string,
  sessionUserId: string
): Promise<boolean> {
  if (!sessionUserId) return false;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { userId: true },
  });
  if (!quiz) return false;
  if (quiz.userId === sessionUserId) return true;
  const me = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true },
  });
  return me?.role === "ADMIN";
}

/**
 * Construit la clause WHERE Prisma pour les opérations sur Quiz qui doivent
 * accepter le propriétaire OU un admin. Utilise findFirst plutôt que update
 * direct si tu veux vérifier l'autorisation avant.
 */
export async function getEditableQuizWhere(
  quizId: string,
  sessionUserId: string
): Promise<{ id: string; userId?: string } | null> {
  if (!sessionUserId) {
    console.log("[canEditQuiz] no sessionUserId");
    return null;
  }
  const me = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true, email: true },
  });
  console.log(
    `[canEditQuiz] quizId=${quizId} userId=${sessionUserId} email=${me?.email} role=${me?.role}`
  );
  if (me?.role === "ADMIN") {
    return { id: quizId };
  }
  return { id: quizId, userId: sessionUserId };
}
