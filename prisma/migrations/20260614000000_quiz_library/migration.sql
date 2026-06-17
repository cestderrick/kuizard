-- V17 — Banque de quizz (quiz library)
-- Permet à l'admin de mettre des quizz complets à disposition pour duplication.

ALTER TABLE "Quiz"
  ADD COLUMN IF NOT EXISTS "isLibrary"          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "libraryDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "libraryTags"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "libraryLanguage"    TEXT;

-- Index pour le browser library côté user (filtres rapides)
CREATE INDEX IF NOT EXISTS "Quiz_isLibrary_status_idx"
  ON "Quiz"("isLibrary", "status")
  WHERE "isLibrary" = TRUE;

CREATE INDEX IF NOT EXISTS "Quiz_isLibrary_libraryLanguage_idx"
  ON "Quiz"("isLibrary", "libraryLanguage")
  WHERE "isLibrary" = TRUE;
