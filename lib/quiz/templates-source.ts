// =============================================
// Source unifiée des templates de quizz
// =============================================
//
// Stratégie de migration :
// 1. On lit en priorité les templates depuis la BDD (table QuizTemplate)
// 2. Si la BDD est vide, on retombe sur le hardcoded TS de templates.ts
//    pour garantir une expérience par défaut
//
// Quand l'admin aura migré tous les templates en BDD, le fallback TS
// pourra être retiré.

import { prisma } from "@/lib/db";
import type { QuizTemplate } from "@/lib/quiz/templates";

const FALLBACK_EMOJIS: Record<string, string> = {
  mariage: "💍",
  "evjf-evg": "🎉",
  anniversaire: "🎂",
  "blind-test": "🎵",
  naissance: "👶",
  "team-building": "🤝",
};

const FALLBACK_COLORS: Record<string, string> = {
  mariage: "#EC4899",
  "evjf-evg": "#F59E0B",
  anniversaire: "#8B5CF6",
  "blind-test": "#06B6D4",
  naissance: "#10B981",
  "team-building": "#5523BB",
};

export type UnifiedTemplate = {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  themeColor: string;
  theme: string | null;
  category: string;
  language: string;
  tags: string[];
  questionsCount: number;
  popularity: number; // nombre de quizz créés à partir de ce template
  quizTitle: string;
  quizDescription: string;
  coverImageUrl: string | null;
  questions: QuizTemplate["questions"];
  source: "db" | "hardcoded";
};

function fromDB(t: {
  slug: string;
  title: string;
  description: string;
  category: string;
  language: string;
  theme: string | null;
  tags: string[];
  coverImageUrl: string | null;
  questions: unknown;
}): UnifiedTemplate {
  const emoji = FALLBACK_EMOJIS[t.category] ?? "✨";
  const themeColor =
    FALLBACK_COLORS[t.category] ?? "var(--color-violet-primary)";
  const qList = (t.questions as QuizTemplate["questions"]) ?? [];
  return {
    slug: t.slug,
    emoji,
    title: t.title,
    description: t.description,
    themeColor,
    theme: t.theme,
    category: t.category,
    language: t.language,
    tags: t.tags ?? [],
    questionsCount: qList.length,
    popularity: 0,
    quizTitle: t.title,
    quizDescription: t.description,
    coverImageUrl: t.coverImageUrl,
    questions: qList,
    source: "db",
  };
}

/**
 * V47.9 — Renvoie UNIQUEMENT les templates BDD (les hardcodés sont
 * désormais cachés des utilisateurs pour donner à l'admin la liberté de
 * choisir lesquels exposer via /admin/templates → bouton « Cloner en BDD »).
 *
 * Les fallback hardcodés restent disponibles côté admin uniquement.
 */
export async function listAllTemplates(): Promise<UnifiedTemplate[]> {
  const [dbTemplates, popularity] = await Promise.all([
    prisma.quizTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
    // Compteur de popularité = nombre de quizz créés depuis chaque template
    prisma.quiz.groupBy({
      by: ["fromTemplateSlug"],
      where: { fromTemplateSlug: { not: null } },
      _count: true,
    }),
  ]);

  const popMap = new Map(
    popularity.map((p) => [p.fromTemplateSlug as string, p._count])
  );

  return dbTemplates
    .map(fromDB)
    .map((t) => ({ ...t, popularity: popMap.get(t.slug) ?? 0 }));
}

/**
 * Renvoie l'ensemble des slugs de templates déjà utilisés par un user donné.
 */
export async function getUsedTemplateSlugs(userId: string): Promise<Set<string>> {
  const used = await prisma.quiz.findMany({
    where: { userId, fromTemplateSlug: { not: null } },
    select: { fromTemplateSlug: true },
    distinct: ["fromTemplateSlug"],
  });
  return new Set(used.map((q) => q.fromTemplateSlug!).filter(Boolean));
}

/**
 * V47.9 : seuls les templates BDD (et actifs) sont exposés aux utilisateurs.
 * Si tu as besoin du fallback hardcoded (ex: admin clonage), passe par
 * QUIZ_TEMPLATES directement.
 */
export async function getTemplateBySlugUnified(
  slug: string
): Promise<UnifiedTemplate | null> {
  const fromDb = await prisma.quizTemplate.findUnique({
    where: { slug },
  });
  if (fromDb && fromDb.isActive) return fromDB(fromDb);
  return null;
}
