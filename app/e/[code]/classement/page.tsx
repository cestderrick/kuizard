import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = {
  title: "🏅 Classement escape",
};

export default async function EscapeClassementPage({ params }: Props) {
  const { code: codeRaw } = await params;
  const code = codeRaw.toUpperCase();

  const escape = await prisma.escape.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      startedAt: true,
      steps: { select: { id: true }, orderBy: { order: "asc" } },
    },
  });
  if (!escape) notFound();

  const teams = await prisma.escapeTeam.findMany({
    where: { escapeId: escape.id },
    orderBy: [
      { finishedAt: { sort: "asc", nulls: "last" } },
      { score: "desc" },
      { lastActivityAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      playerNames: true,
      score: true,
      hintsUsed: true,
      currentStepOrder: true,
      startedAt: true,
      finishedAt: true,
    },
  });

  const totalSteps = escape.steps.length;

  function fmtDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background:
          "linear-gradient(180deg, var(--color-night, #1a0e3a) 0%, var(--color-night-2, #251152) 100%)",
        color: "var(--color-lavender, #e5dcf5)",
        zIndex: 1000,
      }}
    >
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <header className="text-center">
          <p className="text-xs opacity-60 font-mono mb-1">Code : {escape.code}</p>
          <h1
            className="font-display text-3xl"
            style={{ color: "var(--color-gold-light, #fbbf24)" }}
          >
            🏅 Classement — {escape.title}
          </h1>
        </header>

        {teams.length === 0 ? (
          <p className="text-center opacity-70 italic py-10">
            Aucune equipe n&apos;a rejoint pour l&apos;instant.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {teams.map((t, i) => {
              const rank = i + 1;
              const emoji =
                rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
              const durationMs =
                t.finishedAt && t.startedAt
                  ? new Date(t.finishedAt).getTime() - new Date(t.startedAt).getTime()
                  : null;
              const progress = t.finishedAt
                ? totalSteps
                : Math.max(0, t.currentStepOrder - 1);
              const players = Array.isArray(t.playerNames)
                ? (t.playerNames as string[])
                : [];
              return (
                <li
                  key={t.id}
                  className="rounded-xl border p-3 flex items-center gap-3"
                  style={{
                    backgroundColor: t.finishedAt
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: t.finishedAt
                      ? "rgba(34,197,94,0.4)"
                      : "rgba(167,139,250,0.2)",
                  }}
                >
                  <span className="text-2xl w-10 text-center shrink-0">
                    {emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {t.name}{" "}
                      {t.finishedAt && (
                        <span className="text-xs opacity-70 font-normal">
                          · termine{durationMs ? ` en ${fmtDuration(durationMs)}` : ""}
                        </span>
                      )}
                    </p>
                    <p className="text-xs opacity-70">
                      Progression : {progress}/{totalSteps} enigmes
                      {t.hintsUsed > 0 && ` · ${t.hintsUsed} indice${t.hintsUsed > 1 ? "s" : ""}`}
                    </p>
                    {players.length > 0 && (
                      <p className="text-[11px] opacity-50 mt-0.5">
                        {players.join(" · ")}
                      </p>
                    )}
                  </div>
                  <p
                    className="font-display text-xl shrink-0"
                    style={{ color: "var(--color-gold-light, #fbbf24)" }}
                  >
                    {t.score}
                    <span className="text-xs opacity-70 ml-0.5">pts</span>
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        <div className="text-center mt-6">
          <Link
            href={`/e/${escape.code}`}
            className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            ← Retour a la page d&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
