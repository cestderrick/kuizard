-- =============================================
-- V6.A — Champs entreprise sur User (comptes pros)
-- =============================================

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "siret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;
