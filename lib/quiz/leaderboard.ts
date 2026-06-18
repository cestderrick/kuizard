// =============================================
// Helper de récupération du classement d'un quizz
// =============================================
// V36 : Tri par score DESC, puis par DURÉE (completedAt - startedAt) ASC.
// Le plus rapide en cas d'égalité gagne. Utile surtout en SCHEDULED où les
// joueurs ne démarrent pas au même moment (en LIVE le tri par completedAt
// équivaut à la durée car tous démarrent ensemble).

import { prisma } from "@/lib/db";

export type LeaderboardEntry = {
  rank: number;
  participationId: string;
  nickname: string;
  score: number;
  completedAt: Date;
  durationMs: number;
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
        // V36 : on fetch startedAt pour calculer la durée. Le tri final est
        // fait en JS car SQL Prisma ne supporte pas orderBy par calcul.
        select: {
          id: true,
          nickname: true,
          score: true,
          startedAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!quiz) return null;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  // V36 : tri par score DESC puis par durée ASC (le plus rapide gagne)
  const sorted = [...quiz.participations].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const durA = a.completedAt!.getTime() - a.startedAt.getTime();
    const durB = b.completedAt!.getTime() - b.startedAt.getTime();
    return durA - durB;
  });

  // Dense ranking avec égalité (même score ET même durée → même rang)
  let lastScore: number | null = null;
  let lastDuration: number | null = null;
  let lastRank = 0;
  let nextRank = 0;
  const entries: LeaderboardEntry[] = sorted.map((p) => {
    nextRank += 1;
    const duration = p.completedAt!.getTime() - p.startedAt.getTime();
    if (lastScore !== p.score || lastDuration !== duration) {
      lastRank = nextRank;
      lastScore = p.score;
      lastDuration = duration;
    }
    return {
      rank: lastRank,
      participationId: p.id,
      nickname: p.nickname,
      score: p.score,
      completedAt: p.completedAt!,
      durationMs: duration,
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
