"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  title: string;
  openAt: string; // ISO string
  code: string;
};

/**
 * Affichage avant ouverture d'un quizz en mode SCHEDULED : compte à rebours
 * jusqu'à l'heure d'ouverture, puis recharge la page.
 */
export function ScheduledCountdown({ title, openAt, code }: Props) {
  const target = new Date(openAt).getTime();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);

  // Recharger automatiquement quand le créneau s'ouvre
  useEffect(() => {
    if (diff === 0 && typeof window !== "undefined") {
      window.location.reload();
    }
  }, [diff]);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const formattedOpen = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(openAt));

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)]">
      <div className="max-w-xl w-full text-center">
        <div className="text-6xl mb-4" aria-hidden>
          ⏳
        </div>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
          Le quizz n'est pas encore ouvert
        </p>
        <h1 className="font-display text-3xl tracking-wide mb-3">{title}</h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mb-8">
          Ouverture le <strong>{formattedOpen}</strong>
        </p>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {[
            { label: "Jours", value: days },
            { label: "Heures", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Secondes", value: seconds },
          ].map((unit) => (
            <div
              key={unit.label}
              className="bg-[var(--color-night-2)] rounded-xl p-3 border border-[rgba(167,139,250,0.2)]"
            >
              <div className="font-display text-3xl font-bold text-[var(--color-gold-light)] tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-lavender-2)] opacity-70">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--color-lavender-2)] opacity-60 mt-8">
          Cette page se rechargera automatiquement à l'ouverture.
        </p>
        <Link
          href={`/q/${code}/classement`}
          className="block mt-4 text-sm underline underline-offset-4 text-[var(--color-gold-light)]"
        >
          Voir le classement (vide pour l'instant)
        </Link>
      </div>
    </main>
  );
}

/**
 * Affichage après fermeture d'un quizz en mode SCHEDULED.
 */
export function ScheduledClosed({
  title,
  closeAt,
  code,
}: {
  title: string;
  closeAt: string;
  code: string;
}) {
  const formattedClose = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(closeAt));

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)]">
      <div className="max-w-xl w-full text-center">
        <div className="text-6xl mb-4" aria-hidden>
          🎩
        </div>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
          Quizz terminé
        </p>
        <h1 className="font-display text-3xl tracking-wide mb-3">{title}</h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mb-6">
          Le quizz a été clôturé le {formattedClose}.
          <br />
          Le classement final est figé.
        </p>
        <Link
          href={`/q/${code}/classement`}
          className="inline-block px-6 py-3 rounded-md font-semibold"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          🏆 Voir le classement final
        </Link>
      </div>
    </main>
  );
}
