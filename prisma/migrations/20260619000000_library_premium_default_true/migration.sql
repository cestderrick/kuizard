-- V32 : Tous les quiz library deviennent premium par défaut.
-- 1. Backfill : on flip les existants à TRUE (sauf si admin les a explicitement
--    laissés à FALSE — ici on les met tous true car l'utilisateur veut tout
--    en premium ; il pourra repasser ceux qu'il veut en gratuit après).
UPDATE "Quiz" SET "libraryIsPremium" = true WHERE "isLibrary" = true;

-- 2. Change le default au niveau du schéma pour les futurs INSERT
ALTER TABLE "Quiz" ALTER COLUMN "libraryIsPremium" SET DEFAULT true;
