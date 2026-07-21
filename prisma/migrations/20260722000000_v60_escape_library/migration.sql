-- V60.4b — Bibliotheque publique pour les escape games
-- Idempotent : safe a rejouer.

ALTER TABLE "Escape"
  ADD COLUMN IF NOT EXISTS "isLibrary" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "libraryIsPremium" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "libraryDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "libraryTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "libraryLanguage" TEXT;

CREATE INDEX IF NOT EXISTS "Escape_isLibrary_idx" ON "Escape"("isLibrary");
