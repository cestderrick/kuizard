-- V47.31 — Table PasswordResetToken (si pas déjà créée)
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'PasswordResetToken_userId_fkey'
  ) THEN
    ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- V50 — Question type SCORE_GUESS (foot/rugby etc.)
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'SCORE_GUESS';

-- V51 — Champ Quiz.displayCompanyPromoId
ALTER TABLE "Quiz"
ADD COLUMN IF NOT EXISTS "displayCompanyPromoId" TEXT;

-- V51 — Codes promo société (modèle CompanyPromoCode)
CREATE TABLE IF NOT EXISTS "CompanyPromoCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "discountPercent" INTEGER,
  "validUntil" TIMESTAMP(3),
  "maxUses" INTEGER,
  "currentUses" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyPromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyPromoCode_userId_code_key" ON "CompanyPromoCode"("userId", "code");
CREATE INDEX IF NOT EXISTS "CompanyPromoCode_userId_idx" ON "CompanyPromoCode"("userId");
CREATE INDEX IF NOT EXISTS "CompanyPromoCode_active_idx" ON "CompanyPromoCode"("active");

ALTER TABLE "CompanyPromoCode" ADD CONSTRAINT "CompanyPromoCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- V51 — Log d'utilisation des codes promo (view/copy)
CREATE TABLE IF NOT EXISTS "CompanyPromoCodeUsage" (
  "id" TEXT NOT NULL,
  "promoCodeId" TEXT NOT NULL,
  "quizId" TEXT,
  "action" TEXT NOT NULL,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyPromoCodeUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CompanyPromoCodeUsage_promoCodeId_idx" ON "CompanyPromoCodeUsage"("promoCodeId");
CREATE INDEX IF NOT EXISTS "CompanyPromoCodeUsage_quizId_idx" ON "CompanyPromoCodeUsage"("quizId");
CREATE INDEX IF NOT EXISTS "CompanyPromoCodeUsage_createdAt_idx" ON "CompanyPromoCodeUsage"("createdAt");

ALTER TABLE "CompanyPromoCodeUsage" ADD CONSTRAINT "CompanyPromoCodeUsage_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "CompanyPromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
