import Link from "next/link";

import { getQuizLeaderboard } from "@/lib/quiz/leaderboard";

type Props = {
  code: string;
};

const MEDAL: Record<number, string> = { 1: "🏆", 2: "🥈", 3: "🥉" };

/**
 * Affichage compact du classement, pour le créateur dans la page d'édition.
 * Top 3 + total participants + lien vers la page publique complète.
 */
export async function AdminLeaderboard({ code }: Props) {
  const data = await getQuizLeaderboard(code);
  if (!data) return null;

  if (data.entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span aria-hidden>🎩</span>
        Personne n'a encore joué ce quizz.
      </div>
    );
  }

  const top = data.entries.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y rounded-lg border bg-white">
        {top.map((entry) => (
          <li
            key={entry.participationId}
            className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-3 py-2"
          >
            <span className="text-lg" aria-hidden>
              {MEDAL[entry.rank] ?? `${entry.rank}.`}
            </span>
            <span className="font-medium truncate">{entry.nickname}</span>
            <span className="font-display font-bold text-[var(--color-violet-primary)]">
              {entry.score}
              <span className="text-xs text-muted-foreground"> pts</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">
          {data.entries.length} participant{data.entries.length > 1 ? "s" : ""}{" "}
          au total
        </p>
        <Link
          href={`/q/${code}/classement`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
          style={{ color: "var(--color-violet-primary)" }}
        >
          Voir le classement complet →
        </Link>
      </div>
    </div>
  );
}
