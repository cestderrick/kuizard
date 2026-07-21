-- V60.5d — Champ Payment.escapeLibraryId pour paiements one-shot debloquant
-- la duplication d'un escape library premium.
-- Idempotent.

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "escapeLibraryId" TEXT;

CREATE INDEX IF NOT EXISTS "Payment_escapeLibraryId_idx" ON "Payment"("escapeLibraryId");
