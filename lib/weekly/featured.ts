// =============================================
// Quizz de la semaine — helpers
// =============================================

import { prisma } from "@/lib/db";

export type WeeklyFeaturedDTO = {
  id: string;
  title: string;
  subtitle: string | null;
  prizesText: string;
  weekStart: Date;
  weekEnd: Date;
  ctaLabel: string | null;
  // Données du Quiz référencé
  quizId: string;
  quizCode: string;
  quizColor: string | null;
  quizCoverImageUrl: string | null;
};

/**
 * Retourne le quizz featured actif maintenant (s'il y en a un).
 * Un seul à la fois : le plus récent dont weekStart ≤ now ≤ weekEnd.
 */
export async function getActiveWeeklyFeatured(): Promise<WeeklyFeaturedDTO | null> {
  const now = new Date();
  const row = await prisma.weeklyFeaturedQuiz.findFirst({
    where: {
      weekStart: { lte: now },
      weekEnd: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return null;

  const quiz = await prisma.quiz.findUnique({
    where: { id: row.quizId },
    select: {
      id: true,
      code: true,
      color: true,
      coverImageUrl: true,
      status: true,
    },
  });
  // Si le quiz référencé a été supprimé ou n'est plus publié, on ne l'affiche pas
  if (!quiz || quiz.status === "DRAFT" || quiz.status === "ARCHIVED") return null;

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    prizesText: row.prizesText,
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    ctaLabel: row.ctaLabel,
    quizId: quiz.id,
    quizCode: quiz.code,
    quizColor: quiz.color,
    quizCoverImageUrl: quiz.coverImageUrl,
  };
}
