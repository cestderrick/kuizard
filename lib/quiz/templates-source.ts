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
import { QUIZ_TEMPLATES, type QuizTemplate } from "@/lib/quiz/templates";

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
  coverImageUrl: string | null;
  questions: unknown;
}): UnifiedTemplate {
  const emoji = FALLBACK_EMOJIS[t.category] ?? "✨";
  const themeColor =
    FALLBACK_COLORS[t.category] ?? "var(--color-violet-primary)";
  return {
    slug: t.slug,
    emoji,
    title: t.title,
    description: t.description,
    themeColor,
    quizTitle: t.title,
    quizDescription: t.description,
    coverImageUrl: t.coverImageUrl,
    questions: (t.questions as QuizTemplate["questions"]) ?? [],
    source: "db",
  };
}

function fromHardcoded(t: QuizTemplate): UnifiedTemplate {
  return {
    slug: t.slug,
    emoji: t.emoji,
    title: t.title,
    description: t.description,
    themeColor: t.themeColor,
    quizTitle: t.quizTitle,
    quizDescription: t.quizDescription,
    coverImageUrl: null,
    questions: t.questions,
    source: "hardcoded",
  };
}

/**
 * Renvoie tous les templates disponibles, BDD prioritaire.
 * En cas de slug en doublon, la version BDD écrase la hardcoded.
 */
export async function listAllTemplates(): Promise<UnifiedTemplate[]> {
  const dbTemplates = await prisma.quizTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
  const merged: UnifiedTemplate[] = [
    ...dbTemplates.map(fromDB),
    ...QUIZ_TEMPLATES.filter((t) => !dbSlugs.has(t.slug)).map(fromHardcoded),
  ];

  return merged;
}

export async function getTemplateBySlugUnified(
  slug: string
): Promise<UnifiedTemplate | null> {
  const fromDb = await prisma.quizTemplate.findUnique({
    where: { slug },
  });
  if (fromDb && fromDb.isActive) return fromDB(fromDb);

  const hard = QUIZ_TEMPLATES.find((t) => t.slug === slug);
  if (hard) return fromHardcoded(hard);

  return null;
}
