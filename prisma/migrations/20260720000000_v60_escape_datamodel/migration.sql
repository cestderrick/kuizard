-- V60 — Data model Escape games digitaux.
-- Idempotent : safe a rejouer sur la prod.

-- ENUMS
DO $$ BEGIN
  CREATE TYPE "EscapeStatus" AS ENUM ('DRAFT','PUBLISHED','RUNNING','FINISHED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EscapeStepType" AS ENUM ('TEXT','CHOICE','IMAGE','AUDIO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ESCAPE
CREATE TABLE IF NOT EXISTS "Escape" (
  "id"                TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL,
  "code"              TEXT NOT NULL UNIQUE,
  "title"             TEXT NOT NULL,
  "description"       TEXT,
  "coverImageUrl"     TEXT,
  "theme"             JSONB NOT NULL DEFAULT '{}'::jsonb,
  "maxTeamsCount"     INTEGER,
  "timerMinutes"      INTEGER,
  "hintCostPoints"    INTEGER NOT NULL DEFAULT 10,
  "status"            "EscapeStatus" NOT NULL DEFAULT 'DRAFT',
  "startedAt"         TIMESTAMP(3),
  "scheduledOpenAt"   TIMESTAMP(3),
  "scheduledCloseAt"  TIMESTAMP(3),
  "finalMessage"      TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Escape_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Escape_userId_idx" ON "Escape"("userId");
CREATE INDEX IF NOT EXISTS "Escape_code_idx"   ON "Escape"("code");
CREATE INDEX IF NOT EXISTS "Escape_status_idx" ON "Escape"("status");

-- ESCAPESTEP
CREATE TABLE IF NOT EXISTS "EscapeStep" (
  "id"             TEXT PRIMARY KEY,
  "escapeId"       TEXT NOT NULL,
  "order"          INTEGER NOT NULL,
  "type"           "EscapeStepType" NOT NULL,
  "title"          TEXT,
  "body"           TEXT NOT NULL,
  "imageUrl"       TEXT,
  "audioUrl"       TEXT,
  "expectedAnswer" TEXT,
  "options"        JSONB NOT NULL DEFAULT '[]'::jsonb,
  "points"         INTEGER NOT NULL DEFAULT 10,
  "hints"          JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscapeStep_escapeId_fkey" FOREIGN KEY ("escapeId") REFERENCES "Escape"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "EscapeStep_escapeId_order_idx" ON "EscapeStep"("escapeId","order");

-- ESCAPETEAM
CREATE TABLE IF NOT EXISTS "EscapeTeam" (
  "id"               TEXT PRIMARY KEY,
  "escapeId"         TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "playerNames"      JSONB NOT NULL DEFAULT '[]'::jsonb,
  "currentStepOrder" INTEGER NOT NULL DEFAULT 1,
  "score"            INTEGER NOT NULL DEFAULT 0,
  "hintsUsed"        INTEGER NOT NULL DEFAULT 0,
  "attempts"         JSONB NOT NULL DEFAULT '{}'::jsonb,
  "usedHints"        JSONB NOT NULL DEFAULT '{}'::jsonb,
  "startedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt"       TIMESTAMP(3),
  "lastActivityAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscapeTeam_escapeId_fkey" FOREIGN KEY ("escapeId") REFERENCES "Escape"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "EscapeTeam_escapeId_idx"                ON "EscapeTeam"("escapeId");
CREATE INDEX IF NOT EXISTS "EscapeTeam_escapeId_score_idx"          ON "EscapeTeam"("escapeId","score" DESC);
CREATE INDEX IF NOT EXISTS "EscapeTeam_escapeId_finishedAt_idx"     ON "EscapeTeam"("escapeId","finishedAt");
