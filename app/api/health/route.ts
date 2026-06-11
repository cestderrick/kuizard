import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Endpoint de monitoring santé — utilisé par UptimeRobot (et autres outils
 * de monitoring). Vérifie que :
 *   - Next tourne et répond
 *   - La connexion BDD est OK
 *
 * Retourne :
 *   200 + JSON si tout va bien
 *   503 + JSON détaillant l'erreur sinon
 *
 * UptimeRobot teste juste le code HTTP (200 = OK, autre = down).
 */
export async function GET() {
  const checks: Record<string, "ok" | "ko"> = {
    next: "ok",
    db: "ok",
  };

  let dbError: string | null = null;

  try {
    // Ping BDD très léger — pas de read sur table, juste une query système
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    checks.db = "ko";
    dbError = err instanceof Error ? err.message : "unknown error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      ...(dbError && { dbError }),
      version: process.env.npm_package_version ?? "unknown",
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
