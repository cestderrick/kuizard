-- V42 — SiteSetting : config éditables par admin
CREATE TABLE "SiteSetting" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT
);
