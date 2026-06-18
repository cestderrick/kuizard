"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Décompte d'une question.
 *
 * - `mode="live"` : on reçoit `startedAtMs` (timestamp UTC) du serveur, le
 *   timer est synchronisé pour tous les joueurs LIVE.
 * - `mode="scheduled"` : on n'a pas de startedAt — le timer démarre côté
 *   client au mount du composant (donc local au téléphone).
 *
 * À la fin du décompte, on appelle `onExpire?.()`.
 */
export function QuestionTimer({
  durationSeconds,
  startedAtMs,
  mode,
  onExpire,
}: {
  durationSeconds: number;
  startedAtMs?: number | null;
  mode: "live" | "scheduled";
  onExpire?: () => void;
}) {
  const startedAt = useMemo(() => {
    // V23 : on prend startedAtMs si fourni, peu importe le mode. En scheduled,
    // ça permet de garder un compte à rebours cohérent quand l'utilisateur
    // navigue entre les questions (le timer ne se ré-arme pas à chaque mount).
    if (startedAtMs && Number.isFinite(startedAtMs)) {
      return startedAtMs;
    }
    return Date.now();
    // mode est conservé pour compat / lisibilité côté appelant
    void mode;
  }, [mode, startedAtMs]);

  const endAt = startedAt + durationSeconds * 1000;

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, endAt - now);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const expired = remainingMs <= 0;
  const progress = Math.max(0, Math.min(1, remainingMs / (durationSeconds * 1000)));

  // Fire onExpire une seule fois quand on passe à 0
  useEffect(() => {
    if (expired && onExpire) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  // Couleur dynamique : vert > orange > rouge
  const color =
    progress > 0.5 ? "#10B981" : progress > 0.2 ? "#F59E0B" : "#EF4444";

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center w-10 h-10">
        <svg className="absolute" width="40" height="40" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="rgba(167,139,250,0.2)"
            strokeWidth="4"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${progress * 100.53} 100.53`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: "stroke-dasharray 0.25s linear, stroke 0.5s" }}
          />
        </svg>
        <span
          className="relative text-xs font-bold font-display"
          style={{ color }}
        >
          {expired ? "⏱" : remainingSeconds}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {expired ? "Temps écoulé" : "secondes"}
      </span>
    </div>
  );
}
