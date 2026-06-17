-- V16 — Quizz de la semaine (featured public)

CREATE TABLE IF NOT EXISTS "WeeklyFeaturedQuiz" (
  "id"          TEXT NOT NULL,
  "quizId"      TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "subtitle"    TEXT,
  "prizesText"  TEXT NOT NULL,
  "weekStart"   TIMESTAMP(3) NOT NULL,
  "weekEnd"     TIMESTAMP(3) NOT NULL,
  "ctaLabel"    TEXT DEFAULT '🎁 Tenter ma chance',
  "featuredBy"  TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WeeklyFeaturedQuiz_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyFeaturedQuiz_quizId_key" ON "WeeklyFeaturedQuiz"("quizId");
CREATE INDEX IF NOT EXISTS "WeeklyFeaturedQuiz_weekStart_weekEnd_idx" ON "WeeklyFeaturedQuiz"("weekStart", "weekEnd");
CREATE INDEX IF NOT EXISTS "WeeklyFeaturedQuiz_quizId_idx" ON "WeeklyFeaturedQuiz"("quizId");
