-- V19 — Audit log des actions admin

CREATE TABLE IF NOT EXISTS "AdminAction" (
  "id"             TEXT NOT NULL,
  "adminId"        TEXT NOT NULL,
  "adminEmail"     TEXT NOT NULL,
  "action"         TEXT NOT NULL,
  "targetUserId"   TEXT,
  "targetUserEmail" TEXT,
  "targetQuizId"   TEXT,
  "targetEntityId" TEXT,
  "payload"        JSONB,
  "ipAddress"      TEXT,
  "userAgent"      TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdminAction_adminId_createdAt_idx" ON "AdminAction"("adminId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AdminAction_action_createdAt_idx" ON "AdminAction"("action", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AdminAction_targetUserId_idx" ON "AdminAction"("targetUserId");
CREATE INDEX IF NOT EXISTS "AdminAction_createdAt_idx" ON "AdminAction"("createdAt" DESC);
