import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getQuizLeaderboard } from "@/lib/quiz/leaderboard";
import { parsePrizes, prizesByRank, type Prize } from "@/lib/quiz/prizes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const data = await getQuizLeaderboard(code);
  if (!data) return { title: "Classement introuvable" };
  return {
    title: `Classement · ${data.title}`,
    description: `Classement du quizz "${data.title}" sur Kuizard.`,
  };
}

export default async function ClassementPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getQuizLeaderboard(code);
  if (!data) notFound();

  // Récupérer la participation courante via le cookie pour la mettre en surbrillance
  const cookieStore = await cookies();
  const myParticipationId = cookieStore.get(`kz_play_${data.quizId}`)?.value;

  // 🚪 Mode SCHEDULED : on ne révèle le classement qu'après la fermeture
  // du créneau. Avant et pendant, on affiche un message d'attente.
  const quizMeta = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    select: {
      mode: true,
      scheduledCloseAt: true,
      prizes: true,
    },
  });
  if (
    quizMeta?.mode === "SCHEDULED" &&
    quizMeta.scheduledCloseAt &&
    Date.now() < quizMeta.scheduledCloseAt.getTime()
  ) {
    const closeStr = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(quizMeta.scheduledCloseAt);

    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)]">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4" aria-hidden>
            🤫
          </div>
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
            Surprise en préparation
          </p>
          <h1 className="font-display text-2xl tracking-wide mb-3">
            {data.title}
          </h1>
          <p className="text-[var(--color-lavender-2)] opacity-80 mb-6">
            Le classement et les scores seront dévoilés à la clôture du
            quizz, le <strong>{closeStr}</strong>.
          </p>
          <Link
            href={`/q/${data.code}`}
            className="inline-block px-5 py-2.5 rounded-md font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            Retour au quizz
          </Link>
        </div>
      </main>
    );
  }

  // Lots configurés par le créateur (jsonb sur Quiz)
  const quizPrizesRow = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    select: { prizes: true },
  });
  const prizes = parsePrizes(quizPrizesRow?.prizes);
  const prizeMap = prizesByRank(prizes);

  const podium = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  // Ordre d'affichage du podium : 2e à gauche, 1er au milieu, 3e à droite
  const podiumDisplayOrder = (() => {
    const second = podium.find((e) => e.rank === 2) ?? podium[1];
    const first = podium.find((e) => e.rank === 1) ?? podium[0];
    const third = podium.find((e) => e.rank === 3) ?? podium[2];
    return [second, first, third].filter(Boolean);
  })();

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 bg-[var(--color-night)] text-[var(--color-lavender)] relative overflow-hidden">
      {/* Halos magiques */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-8">
        {/* Header */}
        <header className="text-center">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
            ✨ Classement ✨
          </p>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-2">
            {data.title}
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80">
            {data.entries.length} participant{data.entries.length > 1 ? "s" : ""}{" "}
            · sur {data.totalPoints} point{data.totalPoints > 1 ? "s" : ""}
          </p>
        </header>

        {/* Podium */}
        {podium.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3" aria-hidden>
              🎩
            </div>
            <p className="text-[var(--color-lavender-2)]">
              Personne n'a encore terminé ce quizz.
            </p>
            <Link
              href={`/q/${data.code}`}
              className="inline-block mt-4 px-5 py-2 rounded-md font-semibold"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              Joue maintenant ✨
            </Link>
          </div>
        ) : (
          <section className="flex items-end justify-center gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
            {podiumDisplayOrder.map((entry) => (
              <PodiumStep
                key={entry.participationId}
                entry={entry}
                isMe={entry.participationId === myParticipationId}
                prize={prizeMap.get(entry.rank) ?? null}
              />
            ))}
          </section>
        )}

        {/* Classement complet (rang 4+) */}
        {rest.length > 0 && (
          <section className="bg-[var(--color-night-2)] rounded-2xl border border-[rgba(167,139,250,0.2)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[rgba(167,139,250,0.15)]">
              <h2 className="font-display text-sm tracking-[2px] uppercase text-[var(--color-lavender-2)] opacity-80">
                Et les autres
              </h2>
            </div>
            <ol className="divide-y divide-[rgba(167,139,250,0.1)]">
              {rest.map((entry) => {
                const isMe = entry.participationId === myParticipationId;
                const prize = prizeMap.get(entry.rank);
                return (
                  <li
                    key={entry.participationId}
                    className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-5 py-3"
                    style={
                      isMe
                        ? {
                            backgroundColor: "rgba(245,158,11,0.08)",
                            borderLeft: "3px solid var(--color-gold)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className="font-display text-base font-bold"
                      style={{ color: "var(--color-lavender-2)" }}
                    >
                      {entry.rank}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {entry.nickname}
                        {isMe && (
                          <span className="ml-2 text-xs italic text-[var(--color-gold-light)]">
                            (toi)
                          </span>
                        )}
                      </span>
                      {prize && (
                        <span className="text-xs text-[var(--color-gold-light)] flex items-center gap-1">
                          🎁 {prize.label}
                          {prize.description && (
                            <span className="opacity-70">
                              — {prize.description}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <span
                      className="font-display font-bold text-base"
                      style={{ color: "var(--color-gold-light)" }}
                    >
                      {entry.score}
                      <span className="text-xs text-[var(--color-lavender-2)] opacity-70">
                        {" "}
                        pts
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 border-t border-[rgba(167,139,250,0.15)]">
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mb-3">
            Envie de créer ton propre quizz ?
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 rounded-md font-medium border"
            style={{
              color: "var(--color-lavender)",
              borderColor: "rgba(167,139,250,0.4)",
            }}
          >
            Découvrir Kuizard ✨
          </Link>
        </footer>
      </div>
    </main>
  );
}

// ----------------------------------------------------------
// Sous-composant — Une marche du podium
// ----------------------------------------------------------
function PodiumStep({
  entry,
  isMe,
  prize,
}: {
  entry: { rank: number; nickname: string; score: number };
  isMe: boolean;
  prize: Prize | null;
}) {
  const isFirst = entry.rank === 1;
  const isSecond = entry.rank === 2;
  const isThird = entry.rank === 3;

  const medal = isFirst ? "🏆" : isSecond ? "🥈" : isThird ? "🥉" : "✨";
  const rankColor = isFirst
    ? "var(--color-gold)"
    : isSecond
    ? "#cbd5e1"
    : isThird
    ? "#fb923c"
    : "var(--color-lavender-2)";

  const bg = isFirst
    ? "linear-gradient(180deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))"
    : isSecond
    ? "linear-gradient(180deg, rgba(203,213,225,0.20), rgba(203,213,225,0.05))"
    : "linear-gradient(180deg, rgba(249,115,22,0.18), rgba(249,115,22,0.05))";

  const borderColor = isFirst
    ? "var(--color-gold)"
    : isSecond
    ? "rgba(203,213,225,0.5)"
    : "rgba(249,115,22,0.5)";

  const heightClass = isFirst ? "min-h-[180px]" : "min-h-[150px]";
  const scaleClass = isFirst ? "sm:scale-105" : "";
  const avatarSize = isFirst ? "w-16 h-16 text-2xl" : "w-12 h-12 text-xl";

  // Initiale pour l'avatar
  const initial = entry.nickname.charAt(0).toUpperCase();

  return (
    <div
      className={`flex-1 max-w-[180px] rounded-2xl p-4 text-center flex flex-col items-center gap-2 ${heightClass} ${scaleClass} relative`}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        boxShadow: isMe ? "0 0 0 2px var(--color-gold)" : undefined,
      }}
    >
      <div className="text-2xl" aria-hidden>
        {medal}
      </div>
      <div className="font-display font-bold text-3xl" style={{ color: rankColor }}>
        {entry.rank}
      </div>
      <div
        className={`rounded-full flex items-center justify-center font-bold ${avatarSize}`}
        style={{
          backgroundColor: isFirst
            ? "var(--color-gold)"
            : "var(--color-violet-primary)",
          color: isFirst ? "var(--color-violet-deep)" : "white",
        }}
      >
        {initial}
      </div>
      <div className="font-display text-sm tracking-wide truncate max-w-full">
        {entry.nickname}
      </div>
      <div
        className="text-xs"
        style={{ color: "var(--color-lavender-2)", opacity: 0.85 }}
      >
        {entry.score} pt{entry.score > 1 ? "s" : ""}
      </div>
      {prize && (
        <div
          className="mt-1 px-2 py-1 rounded-md text-xs font-semibold leading-tight max-w-full"
          style={{
            backgroundColor: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            color: "var(--color-gold-light)",
          }}
        >
          <div className="flex items-center justify-center gap-1">
            <span aria-hidden>🎁</span>
            <span className="truncate">{prize.label}</span>
          </div>
          {prize.description && (
            <div className="text-[10px] opacity-80 truncate">
              {prize.description}
            </div>
          )}
        </div>
      )}
      {isMe && (
        <div
          className="absolute -top-2 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          TOI
        </div>
      )}
    </div>
  );
}
