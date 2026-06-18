-- V35 : flag d'onboarding complété ou skippé par l'utilisateur
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
