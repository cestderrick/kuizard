import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getQuizLeaderboard } from "@/lib/quiz/leaderboard";
import { parsePrizes, prizesByRank, type Prize } from "@/lib/quiz/prizes";
import { MyAnswersPanel } from "@/components/play/my-answers-panel";
import { UpgradeCTA } from "@/components/marketing/upgrade-cta";
import { ReplayQuizButton } from "@/components/quiz/replay-quiz-button";
import { getActivePlans } from "@/lib/plans/config";
import { getActiveWeeklyFeatured } from "@/lib/weekly/featured";

// V47.2 — Format chrono "1m23s" pour afficher le temps mis sur chaque entrée
// V47.23 — Cap à 99m59s : au-dela on affiche "–" (chrono aberrant : participation
// reprise apres plusieurs heures/jours = donnee non significative)
function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  if (totalSec > 99 * 60 + 59) return "–";
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m${String(s).padStart(2, "0")}s`;
}

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
  // V47.22 : le masquage SCHEDULED ne s'applique QUE pour le quiz de la
  // semaine (weekly featured). Les autres quiz SCHEDULED de la quizzthèque
  // affichent leurs résultats immédiatement.
  const weekly = await getActiveWeeklyFeatured();
  const isWeeklyFeatured = weekly?.quizCode === code;
  if (
    isWeeklyFeatured &&
    quizMeta?.mode === "SCHEDULED" &&
    quizMeta.scheduledCloseAt &&
    Date.now() < quizMeta.scheduledCloseAt.getTime()
  ) {
    const closeStr = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(quizMeta.scheduledCloseAt);

    // V29 : participation du joueur courant (visible même avant clôture)
    const myEntryScheduled = myParticipationId
      ? data.entries.find((e) => e.participationId === myParticipationId) ?? null
      : null;

    // Stats anonymisées pour donner un aperçu sans permettre la triche
    const completedCount = data.entries.length;
    const topScore = completedCount > 0 ? data.entries[0].score : 0;

    return (
      <main className="block px-4 pt-4 pb-12 bg-[var(--color-night)] text-[var(--color-lavender)] min-h-screen">
        <div className="max-w-xl text-center w-full mx-auto">
          <div className="text-6xl mb-4" aria-hidden>
            🤫
          </div>
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
            Surprise en préparation
          </p>
          <h1
            className="text-2xl tracking-wide mb-3 font-bold"
            style={{
              color: "var(--color-lavender)",
              WebkitTextFillColor: "var(--color-lavender)",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            {data.title}
          </h1>
          <p className="text-[var(--color-lavender-2)] opacity-80 mb-6">
            Le classement et les pseudos seront dévoilés à la clôture du
            quizz, le <strong>{closeStr}</strong>.
          </p>

          {/* V29 : Bloc "Mes résultats" même avant clôture */}
          {myEntryScheduled && myParticipationId && (
            <section
              className="rounded-2xl p-4 mb-5 border-2 text-left"
              style={{
                borderColor: "var(--color-gold)",
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(124,58,237,0.18))",
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
                    🎯 Tes résultats
                  </p>
                  <p
                    className="text-lg tracking-wide mt-1"
                    style={{
                      color: "var(--color-lavender)",
                      WebkitTextFillColor: "var(--color-lavender)",
                      fontFamily: "var(--font-display, inherit)",
                    }}
                  >
                    {myEntryScheduled.nickname}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-bold text-2xl leading-none"
                    style={{
                      color: "var(--color-gold-light)",
                      WebkitTextFillColor: "var(--color-gold-light)",
                      fontFamily: "var(--font-display, inherit)",
                    }}
                  >
                    🤫
                  </p>
                  <p className="text-[10px] uppercase tracking-[2px] text-[var(--color-lavender-2)] opacity-70 mt-1">
                    Score scellé
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-lavender-2)] opacity-80">
                Ta participation est enregistrée. Ton score et le classement
                complet seront dévoilés à tous à la clôture du créneau.
              </p>
              <div className="mt-3">
                <MyAnswersPanel
                  code={data.code}
                  participationId={myParticipationId}
                />
              </div>
            </section>
          )}

          {/* Stats anonymisées */}
          {completedCount > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-4">
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--color-gold-light)",
                    WebkitTextFillColor: "var(--color-gold-light)",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  {completedCount}
                </p>
                <p className="text-xs uppercase tracking-wide opacity-70 mt-1">
                  Participant{completedCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-4">
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--color-gold-light)",
                    WebkitTextFillColor: "var(--color-gold-light)",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  {topScore}
                </p>
                <p className="text-xs uppercase tracking-wide opacity-70 mt-1">
                  Meilleur score
                </p>
              </div>
            </div>
          )}

          {/* V45 : Mini-podium anonyme (rang + score, pseudo masqué) */}
          {data.entries.length > 0 && (
            <section className="mb-6 text-left">
              <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2 text-center">
                🥇 Aperçu anonyme du classement
              </p>
              <ol className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] divide-y divide-[rgba(167,139,250,0.1)] overflow-hidden">
                {data.entries.slice(0, 5).map((e) => (
                  <li
                    key={e.participationId}
                    className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-2.5"
                  >
                    <span
                      className="font-bold text-base"
                      style={{
                        color: "var(--color-lavender-2)",
                        WebkitTextFillColor: "var(--color-lavender-2)",
                        fontFamily: "var(--font-display, inherit)",
                      }}
                    >
                      #{e.rank}
                    </span>
                    <span className="text-sm opacity-80 italic">
                      Joueur anonyme
                    </span>
                    {/* V47.20 : on affiche le SCORE (chiffre) — les pseudos
                        restent cachés jusqu'à la clôture, mais le suspense
                        autour du chiffre est plus motivant. */}
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-gold-light)",
                        WebkitTextFillColor: "var(--color-gold-light)",
                        fontFamily: "var(--font-display, inherit)",
                      }}
                    >
                      {e.score}
                      <span
                        className="text-xs opacity-70 ml-0.5"
                        style={{
                          color: "var(--color-lavender-2)",
                          WebkitTextFillColor: "var(--color-lavender-2)",
                          fontFamily: "inherit",
                        }}
                      >
                        pts
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-[10px] text-center text-[var(--color-lavender-2)] opacity-60 mt-2">
                Pseudos et scores révélés à la clôture du créneau ({closeStr})
              </p>
            </section>
          )}

          {/* V47.21 : Retour à l'accueil Kuizard (au lieu du quiz lui-même) */}
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-md font-semibold"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            ← Retour à l'accueil Kuizard
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

  // V36 : prix du plus petit plan one-shot (pour CTA dynamique)
  const oneShotPlans = await getActivePlans("one_shot");
  const minOneShotPriceCents = oneShotPlans
    .filter((p) => p.priceCents > 0)
    .map((p) => p.priceCents)
    .reduce<number | null>((min, n) => (min === null || n < min ? n : min), null);

  // V24 : participation du joueur courant pour le bloc "Mes résultats"
  const myEntry = myParticipationId
    ? data.entries.find((e) => e.participationId === myParticipationId) ?? null
    : null;

  return (
    <main className="block px-3 sm:px-4 pt-3 pb-8 sm:pt-4 sm:pb-12 bg-[var(--color-night)] text-[var(--color-lavender)] relative overflow-hidden min-h-screen">
      {/* Halos magiques */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/4 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-1/4 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-2 sm:gap-3">
        {/* Header — compact sur mobile pour voir les résultats sans scroll */}
        <header className="text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-0.5">
            ✨ Classement ✨
          </p>
          <h1
            className="text-sm sm:text-2xl md:text-3xl tracking-wide mb-0.5 font-bold line-clamp-1"
            style={{
              color: "var(--color-lavender)",
              WebkitTextFillColor: "var(--color-lavender)",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            {data.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-lavender-2)] opacity-80">
            {data.entries.length} participant{data.entries.length > 1 ? "s" : ""}{" "}
            · sur {data.totalPoints} point{data.totalPoints > 1 ? "s" : ""}
          </p>
        </header>

        {/* V47.24 : Bandeau "Tes resultats" ULTRA compact (1 ligne) pour que le podium
            soit visible en first-fold. Le panel "Voir mes reponses" est replie. */}
        {myEntry && myParticipationId && (
          <section
            className="rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border"
            style={{
              borderColor: "var(--color-gold)",
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(124,58,237,0.15))",
            }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span
                  className="text-[10px] uppercase tracking-[2px] font-bold px-2 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  🎯 TOI
                </span>
                <p
                  className="text-sm sm:text-base font-semibold truncate"
                  style={{
                    color: "var(--color-lavender)",
                    WebkitTextFillColor: "var(--color-lavender)",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  {myEntry.nickname}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <span
                  className="font-bold text-xl sm:text-2xl leading-none"
                  style={{
                    color: "var(--color-gold-light)",
                    WebkitTextFillColor: "var(--color-gold-light)",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  {myEntry.score}
                  <span className="text-sm opacity-70">/{data.totalPoints}</span>
                </span>
                <span className="text-[11px] sm:text-xs text-[var(--color-lavender-2)] opacity-90 whitespace-nowrap">
                  #{myEntry.rank} · ⏱ {formatDuration(myEntry.durationMs)}
                </span>
              </div>
            </div>
            <div className="mt-1.5">
              <MyAnswersPanel
                code={data.code}
                participationId={myParticipationId}
              />
            </div>
            {/* V47.23 : bouton "Rejouer" visible directement dans le bloc resultats
                (en plus du footer) pour qu'on n'ait pas a scroller. */}
            {!isWeeklyFeatured && (
              <div className="mt-2 flex justify-center">
                <ReplayQuizButton code={data.code} />
              </div>
            )}
          </section>
        )}

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
              <h2
                className="text-sm tracking-[2px] uppercase opacity-80"
                style={{
                  color: "var(--color-lavender-2)",
                  WebkitTextFillColor: "var(--color-lavender-2)",
                  fontFamily: "var(--font-display, inherit)",
                }}
              >
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
                      className="text-base font-bold"
                      style={{
                        color: "var(--color-lavender-2)",
                        WebkitTextFillColor: "var(--color-lavender-2)",
                        fontFamily: "var(--font-display, inherit)",
                      }}
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
                        <span className="ml-2 text-[10px] opacity-60">
                          ⏱ {formatDuration(entry.durationMs)}
                        </span>
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
                      className="font-bold text-base"
                      style={{
                        color: "var(--color-gold-light)",
                        WebkitTextFillColor: "var(--color-gold-light)",
                        fontFamily: "var(--font-display, inherit)",
                      }}
                    >
                      {entry.score}
                      <span
                        className="text-xs opacity-70"
                        style={{
                          color: "var(--color-lavender-2)",
                          WebkitTextFillColor: "var(--color-lavender-2)",
                          fontFamily: "inherit",
                        }}
                      >
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

        {/* V24 : CTA paiement / abonnement pour les joueurs séduits */}
        <UpgradeCTA minOneShotPriceCents={minOneShotPriceCents} />

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-3">
          {/* V47.23 : Bouton "Rejouer" pour TOUS les quiz sauf le weekly featured
              (un seul essai pour le quiz de la semaine, mais on peut recommencer
              les autres SCHEDULED de la quizztheque) */}
          {myEntry && myParticipationId && !isWeeklyFeatured && (
            <ReplayQuizButton code={data.code} />
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            ← Retour à l'accueil Kuizard
            <span className="text-xs opacity-70" aria-hidden>↗</span>
          </a>
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
  entry: { rank: number; nickname: string; score: number; durationMs: number };
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
      <div
        className="font-bold text-3xl"
        style={{
          color: rankColor,
          WebkitTextFillColor: rankColor,
          fontFamily: "var(--font-display, inherit)",
        }}
      >
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
      <div
        className="text-sm tracking-wide truncate max-w-full"
        style={{
          color: "var(--color-lavender)",
          WebkitTextFillColor: "var(--color-lavender)",
          fontFamily: "var(--font-display, inherit)",
        }}
      >
        {entry.nickname}
      </div>
      <div
        className="text-xs"
        style={{
          color: "var(--color-lavender-2)",
          WebkitTextFillColor: "var(--color-lavender-2)",
          opacity: 0.85,
        }}
      >
        {entry.score} pt{entry.score > 1 ? "s" : ""}
        {entry.durationMs > 0 && (
          <span className="block text-[10px] opacity-80">
            ⏱ {formatDuration(entry.durationMs)}
          </span>
        )}
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
