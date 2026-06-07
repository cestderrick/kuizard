-- =============================================
-- Migration de rattrapage V3 + V5
-- =============================================
-- Regroupe tout ce qui a été ajouté au schema.prisma depuis la dernière
-- migration appliquée en prod (add_monetization).

-- V2.H — Code promo "cadeau" (offrir un quizz)
ALTER TABLE "PromoCode" ADD COLUMN IF NOT EXISTS "giftPlanSlug" TEXT;

-- V3.D — Read receipts dans la messagerie
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readByAdminAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readByUserAt" TIMESTAMP(3);

-- V3.F — Tags + thème sur les templates
ALTER TABLE "QuizTemplate" ADD COLUMN IF NOT EXISTS "theme" TEXT;
ALTER TABLE "QuizTemplate" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- V3.G — Tracking templates utilisés
ALTER TABLE "Quiz" ADD COLUMN IF NOT EXISTS "fromTemplateSlug" TEXT;

-- V3.E — Stats publiques configurables
CREATE TABLE IF NOT EXISTS "PublicStatsConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "showUsers" BOOLEAN NOT NULL DEFAULT true,
    "showQuizzes" BOOLEAN NOT NULL DEFAULT true,
    "showQuestions" BOOLEAN NOT NULL DEFAULT false,
    "showParticipations" BOOLEAN NOT NULL DEFAULT true,
    "showAvgScore" BOOLEAN NOT NULL DEFAULT false,
    "customTitle" TEXT,
    "customSubtitle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublicStatsConfig_pkey" PRIMARY KEY ("id")
);

-- V5 — Tracking activité pour suppression auto des comptes inactifs
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "inactivityWarnedAt" TIMESTAMP(3);
