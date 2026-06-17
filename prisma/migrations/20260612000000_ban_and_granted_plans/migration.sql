-- V15 — Bannissement utilisateurs + plans offerts par admin

-- 1) Bannissement
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "bannedAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bannedReason" TEXT,
  ADD COLUMN IF NOT EXISTS "bannedBy"     TEXT;

-- 2) Plans offerts (cadeaux admin)
CREATE TABLE IF NOT EXISTS "GrantedPlan" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "planSlug"     TEXT NOT NULL,
  "type"         TEXT NOT NULL,           -- "one_shot" | "subscription"
  "quizId"       TEXT,                    -- pour one_shot uniquement
  "startsAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt"       TIMESTAMP(3),
  "grantedBy"    TEXT NOT NULL,
  "reason"       TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt"    TIMESTAMP(3),
  "revokedBy"    TEXT,
  "revokeReason" TEXT,

  CONSTRAINT "GrantedPlan_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GrantedPlan"
  ADD CONSTRAINT "GrantedPlan_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "GrantedPlan_userId_idx"  ON "GrantedPlan"("userId");
CREATE INDEX IF NOT EXISTS "GrantedPlan_quizId_idx"  ON "GrantedPlan"("quizId");
CREATE INDEX IF NOT EXISTS "GrantedPlan_type_idx"    ON "GrantedPlan"("type");
CREATE INDEX IF NOT EXISTS "GrantedPlan_endsAt_idx"  ON "GrantedPlan"("endsAt");
