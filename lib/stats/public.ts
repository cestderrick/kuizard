// =============================================
// Helper — récupère les stats publiques selon la config admin
// =============================================
//
// Renvoie null si désactivé (l'affichage est totalement caché).

import { prisma } from "@/lib/db";

export type PublicStatsData = {
  enabled: boolean;
  title: string;
  subtitle: string | null;
  items: { label: string; value: number | string; icon: string }[];
};

export async function getPublicStats(): Promise<PublicStatsData | null> {
  const config = await prisma.publicStatsConfig.findUnique({
    where: { id: "singleton" },
  });
  if (!config || !config.enabled) return null;

  const items: PublicStatsData["items"] = [];

  if (config.showUsers) {
    const c = await prisma.user.count();
    items.push({ label: "Magiciens inscrits", value: c, icon: "🧙" });
  }
  if (config.showQuizzes) {
    const c = await prisma.quiz.count();
    items.push({ label: "Quizz créés", value: c, icon: "🎩" });
  }
  if (config.showQuestions) {
    const c = await prisma.question.count();
    items.push({ label: "Questions posées", value: c, icon: "❓" });
  }
  if (config.showParticipations) {
    const c = await prisma.participation.count();
    items.push({ label: "Joueurs participants", value: c, icon: "🎮" });
  }
  if (config.showAvgScore) {
    const agg = await prisma.participation.aggregate({
      where: { completedAt: { not: null } },
      _avg: { score: true },
    });
    items.push({
      label: "Score moyen",
      value: Math.round(agg._avg.score ?? 0),
      icon: "⭐",
    });
  }

  if (items.length === 0) return null;

  return {
    enabled: true,
    title: config.customTitle ?? "Kuizard en chiffres",
    subtitle: config.customSubtitle,
    items,
  };
}
