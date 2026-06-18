import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getQuizLeaderboard } from "@/lib/quiz/leaderboard";

export const metadata: Metadata = {
  title: "Mes quizz répondus",
};

/**
 * V30 : Page historique des quizz auxquels l\'utilisateur a participé.
 * Source : les cookies kz_play_<quizId> → IDs de participations → quiz + score + rang.
 * Inclut les quizz library répondus, le quizz de la semaine, etc.
 */
export default async function MesParticipationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 1. Récupère tous les cookies kz_play_*
  const cookieStore = await cookies();
  const partIds = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("kz_play_"))
    .map((c) => c.value);

  // 2. Charge les participations + leur quiz
  const participations = partIds.length
    ? await prisma.participation.findMany({
        where: { id: { in: partIds } },
        select: {
          id: true,
          nickname: true,
          score: true,
          completedAt: true,
          startedAt: true,
          quiz: {
            select: {
              id: true,
              code: true,
              title: true,
              mode: true,
              status: true,
              isLibrary: true,
              libraryIsPremium: true,
              coverImageUrl: true,
              scheduledCloseAt: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
      })
    : [];

  // 3. Pour chaque participation : calculer le rang via le classement
  const enriched = await Promise.all(
    participations.map(async (p) => {
      const lb = await getQuizLeaderboard(p.quiz.code);
      const entry = lb?.entries.find((e) => e.participationId === p.id);
      return {
        participation: p,
        rank: entry?.rank ?? null,
        totalPlayers: lb?.entries.length ?? 0,
        totalPoints: lb?.totalPoints ?? 0,
      };
    })
  );

  // 4. Filtrer ceux qui n\'ont pas terminé (score = 0 et completedAt null)
  const finished = enriched.filter((e) => e.participation.completedAt);
  const inProgress = enriched.filter((e) => !e.participation.completedAt);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <header>
        <Link
          href="/dashboard/quizzes"
          className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
        >
          ← Mes quizz
        </Link>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mt-4 mb-2 font-semibold">
          🕘 Historique
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Mes quizz répondus
        </h1>
        <p className="mt-2 text-muted-foreground">
          Retrouve tous les quizz auxquels tu as joué (Quizthèque, quizz de
          la semaine, liens d\'invitation…) avec ton score et ton classement.
        </p>
      </header>

      {finished.length === 0 && inProgress.length === 0 ? (
        <div className="rounded-2xl bg-white border p-12 text-center">
          <p className="text-2xl mb-3">🎩</p>
          <p className="font-semibold mb-2">
            Tu n\'as pas encore joué à un quizz
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Explore la Quizthèque pour découvrir des quizz prêts à l\'emploi.
          </p>
          <Link
            href="/dashboard/quizzes/library"
            className="inline-block px-5 py-2.5 rounded-md font-semibold"
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            📚 Aller à la Quizthèque
          </Link>
        </div>
      ) : (
        <>
          {finished.length > 0 && (
            <section>
              <h2
                className="font-display text-xl font-bold tracking-wide mb-3"
                style={{ color: "var(--color-violet-deep)" }}
              >
                ✓ Quizz terminés ({finished.length})
              </h2>
              <ul className="flex flex-col gap-3">
                {finished.map((e) => (
                  <ParticipationRow key={e.participation.id} data={e} />
                ))}
              </ul>
            </section>
          )}

          {inProgress.length > 0 && (
            <section>
              <h2
                className="font-display text-xl font-bold tracking-wide mb-3"
                style={{ color: "var(--color-violet-deep)" }}
              >
                ⏳ En cours / non terminés ({inProgress.length})
              </h2>
              <ul className="flex flex-col gap-3">
                {inProgress.map((e) => (
                  <ParticipationRow key={e.participation.id} data={e} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type EnrichedParticipation = {
  participation: {
    id: string;
    nickname: string;
    score: number;
    completedAt: Date | null;
    startedAt: Date;
    quiz: {
      id: string;
      code: string;
      title: string;
      mode: string;
      status: string;
      isLibrary: boolean;
      libraryIsPremium: boolean;
      coverImageUrl: string | null;
      scheduledCloseAt: Date | null;
    };
  };
  rank: number | null;
  totalPlayers: number;
  totalPoints: number;
};

function ParticipationRow({ data }: { data: EnrichedParticipation }) {
  const { participation: p, rank, totalPlayers, totalPoints } = data;
  const ratio = totalPoints > 0 ? Math.round((p.score / totalPoints) * 100) : 0;
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(p.startedAt);
  const isFinished = !!p.completedAt;

  // V30 : si SCHEDULED non clôturé, le rang n\'est pas définitif
  const scheduledNotYetClosed =
    p.quiz.mode === "SCHEDULED" &&
    p.quiz.scheduledCloseAt &&
    Date.now() < p.quiz.scheduledCloseAt.getTime();

  return (
    <li className="rounded-xl bg-white border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      {p.quiz.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.quiz.coverImageUrl}
          alt=""
          className="w-full sm:w-20 h-32 sm:h-16 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div
          className="w-full sm:w-20 h-32 sm:h-16 rounded-lg shrink-0 flex items-center justify-center text-3xl"
          style={{
            background:
              "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
            color: "white",
          }}
        >
          🎩
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {p.quiz.isLibrary && (
            <span className="text-[10px] uppercase tracking-[1.5px] px-1.5 py-0.5 rounded bg-violet-100 text-[var(--color-violet-primary)] font-semibold">
              📚 Quizthèque
            </span>
          )}
          <span className="text-xs text-muted-foreground">{dateStr}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            Pseudo : <strong>{p.nickname}</strong>
          </span>
        </div>
        <p
          className="font-display text-base font-bold tracking-wide truncate"
          style={{ color: "var(--color-violet-deep)" }}
        >
          {p.quiz.title}
        </p>
      </div>

      <div className="text-right shrink-0">
        {isFinished ? (
          <>
            <p
              className="font-display font-bold text-2xl leading-none"
              style={{ color: "var(--color-violet-primary)" }}
            >
              {p.score}
              <span className="text-sm text-muted-foreground">
                {" "}
                / {totalPoints}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ratio}% ·{" "}
              {scheduledNotYetClosed
                ? "Rang à venir"
                : rank
                ? `Rang #${rank}${totalPlayers ? ` / ${totalPlayers}` : ""}`
                : ""}
            </p>
          </>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold">
            En cours
          </span>
        )}
      </div>

      <div className="shrink-0 sm:ml-2">
        <Link
          href={`/q/${p.quiz.code}/classement`}
          className="inline-block text-xs font-semibold underline-offset-2 hover:underline whitespace-nowrap"
          style={{ color: "var(--color-violet-primary)" }}
        >
          Voir le classement →
        </Link>
      </div>
    </li>
  );
}
