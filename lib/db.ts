// =============================================
// Prisma Client singleton
// =============================================
// En dev, Next.js fait du hot-reload qui peut créer plusieurs instances
// du client Prisma (et donc plusieurs pools de connexions à Postgres).
// On garde une instance unique via globalThis.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
