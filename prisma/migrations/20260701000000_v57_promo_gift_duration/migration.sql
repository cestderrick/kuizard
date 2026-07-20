-- V57 — Champ PromoCode.giftDurationDays pour codes cadeaux a l'inscription.
-- Idempotent : safe a rejouer sur la prod si deja applique.

ALTER TABLE "PromoCode"
  ADD COLUMN IF NOT EXISTS "giftDurationDays" INTEGER;
