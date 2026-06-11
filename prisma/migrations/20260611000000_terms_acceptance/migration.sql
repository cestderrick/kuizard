-- Acceptation explicite des CGU/CGV avec historique
-- Sert de preuve juridique : qui a accepté quoi, quand, avec quelle IP

-- 1) Colonne sur User pour query rapide
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastAcceptedTermsVersion" TEXT;

-- 2) Table TermsAcceptance (1 ligne par acceptation explicite)
CREATE TABLE IF NOT EXISTS "TermsAcceptance" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "termsVersion" TEXT NOT NULL,
  "acceptedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress"    TEXT,
  "userAgent"    TEXT,

  CONSTRAINT "TermsAcceptance_pkey" PRIMARY KEY ("id")
);

-- 3) Foreign key vers User
ALTER TABLE "TermsAcceptance"
  ADD CONSTRAINT "TermsAcceptance_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) Index pour query rapide
CREATE INDEX IF NOT EXISTS "TermsAcceptance_userId_idx" ON "TermsAcceptance"("userId");
CREATE INDEX IF NOT EXISTS "TermsAcceptance_termsVersion_idx" ON "TermsAcceptance"("termsVersion");
CREATE INDEX IF NOT EXISTS "TermsAcceptance_acceptedAt_idx" ON "TermsAcceptance"("acceptedAt" DESC);
