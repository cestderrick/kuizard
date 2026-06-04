// =============================================
// Helper de récupération du classement d'un quizz
// =============================================
// Tri par score DESC, puis par completedAt ASC (qui finit le premier en cas
// d'égalité gagne le tiebreak).

import { prisma } from "@/lib/db";

export type LeaderboardEntry = {
  rank: number;
  participationId: string;
  nickname: string;
  score: number;
  completedAt: Date;
};

export type LeaderboardData = {
  quizId: string;
  title: string;
  description: string | null;
  code: string;
  status: string;
  totalPoints: number;
  entries: LeaderboardEntry[];
};

export async function getQuizLeaderboard(
  code: string
): Promise<LeaderboardData | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      title: true,
      description: true,
      code: true,
      status: true,
      questions: { select: { points: true } },
      participations: {
        where: { completedAt: { not: null } },
        orderBy: [{ score: "desc" }, { completedAt: "asc" }],
        select: {
          id: true,
          nickname: true,
          score: true,
          completedAt: true,
        },
      },
    },
  });

  if (!quiz) return null;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  // Calcul des rangs avec gestion des égalités (dense ranking)
  // Si plusieurs joueurs ont le même score, ils ont le même rang.
  let lastScore: number | null = null;
  let lastRank = 0;
  let nextRank = 0;
  const entries: LeaderboardEntry[] = quiz.participations.map((p) => {
    nextRank += 1;
    if (lastScore !== p.score) {
      lastRank = nextRank;
      lastScore = p.score;
    }
    return {
      rank: lastRank,
      participationId: p.id,
      nickname: p.nickname,
      score: p.score,
      completedAt: p.completedAt!,
    };
  });

  return {
    quizId: quiz.id,
    title: quiz.title,
    description: quiz.description,
    code: quiz.code,
    status: quiz.status,
    totalPoints,
    entries,
  };
}
