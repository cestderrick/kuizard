// =============================================
// Export CSV des participations d'un quizz
// =============================================
//
// Accessible UNIQUEMENT au propriétaire du quizz. On envoie tous les détails
// (pseudo, email, score, date début/fin, durée). Format CSV compatible Excel
// (BOM UTF-8 + séparateur ; pour le décimal français).

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true, userId: true, title: true },
  });
  if (!quiz) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (quiz.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const participations = await prisma.participation.findMany({
    where: { quizId: quiz.id },
    orderBy: { score: "desc" },
  });

  // CSV builder simple — on échappe les " et entoure les champs textuels.
  function csvField(v: string | number | null | undefined): string {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[";\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const headers = [
    "Pseudo",
    "Email",
    "Score",
    "Début",
    "Fin",
    "Durée (min)",
    "Statut",
  ];

  const rows = participations.map((p) => {
    const startedAt = p.startedAt;
    const completedAt = p.completedAt;
    const durationMin = completedAt
      ? Math.round((completedAt.getTime() - startedAt.getTime()) / 60000)
      : "";
    const fmt = (d: Date | null) =>
      d
        ? new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Paris",
          }).format(d)
        : "";

    return [
      csvField(p.nickname),
      csvField(p.email),
      csvField(p.score),
      csvField(fmt(startedAt)),
      csvField(fmt(completedAt)),
      csvField(durationMin),
      csvField(completedAt ? "Terminé" : "En cours"),
    ].join(";");
  });

  // BOM UTF-8 pour qu'Excel affiche correctement les accents
  const csv = "﻿" + [headers.join(";"), ...rows].join("\r\n");

  const filename = `participations-${code}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
