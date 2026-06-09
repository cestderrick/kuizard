-- =============================================
-- V6.C — Langue sur les templates de quizz
-- =============================================

ALTER TABLE "QuizTemplate"
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'fr';

-- Index pour filtrer rapidement par langue dans le browser user
CREATE INDEX IF NOT EXISTS "QuizTemplate_language_isActive_idx"
  ON "QuizTemplate" ("language", "isActive");
