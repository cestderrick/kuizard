-- V26 : ajout du flag "libraryIsPremium" sur Quiz pour gater les quizz de
-- la banque réservés aux abonnés. false = gratuit (accessible à tous).
ALTER TABLE "Quiz" ADD COLUMN "libraryIsPremium" BOOLEAN NOT NULL DEFAULT false;
