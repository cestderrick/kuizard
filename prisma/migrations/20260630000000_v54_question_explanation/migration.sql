-- V54 — Champ Question.explanation (explication affichée après la réponse).
-- Idempotent : safe à rejouer sur la prod si déjà appliqué partiellement.

ALTER TABLE "Question"
  ADD COLUMN IF NOT EXISTS "explanation" TEXT;
