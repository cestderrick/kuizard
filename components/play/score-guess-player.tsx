"use client";

// =============================================
// V50 — Composant joueur pour question SCORE_GUESS
// =============================================

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import {
  parseScoreGuessConfig,
  type ScoreGuessAnswer,
} from "@/lib/quiz/score-guess";

export function ScoreGuessPlayer({
  rawConfig,
  initialAnswer,
  onChange,
  locked,
}: {
  rawConfig: unknown;
  initialAnswer?: ScoreGuessAnswer | null;
  onChange: (answer: ScoreGuessAnswer) => void;
  locked?: boolean;
}) {
  const config = parseScoreGuessConfig(rawConfig);

  const [home, setHome] = useState<string>(
    initialAnswer ? String(initialAnswer.home) : ""
  );
  const [away, setAway] = useState<string>(
    initialAnswer ? String(initialAnswer.away) : ""
  );

  useEffect(() => {
    const hNum = parseInt(home);
    const aNum = parseInt(away);
    if (!isNaN(hNum) && !isNaN(aNum)) {
      onChange({
        type: "score",
        home: Math.max(0, hNum),
        away: Math.max(0, aNum),
      });
    }
  }, [home, away, onChange]);

  if (!config) {
    return (
      <p className="text-xs text-red-500 italic">
        ⚠️ Configuration de la question invalide.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[var(--color-gold)] italic">
        ⚽ Pronostique le score final
      </p>
      <div className="flex items-end justify-center gap-3 sm:gap-5">
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[140px]">
          <span
            className="text-xs font-bold uppercase tracking-wide opacity-80 truncate max-w-full text-center"
            style={{ color: "var(--color-gold)" }}
          >
            {config.labelHome ?? "Équipe A"}
          </span>
          <Input
            type="number"
            min={0}
            max={999}
            inputMode="numeric"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={locked}
            className="text-center text-2xl font-bold h-14"
            style={{
              color: "#1a0e3a",
              WebkitTextFillColor: "#1a0e3a",
              backgroundColor: "#ffffff",
            }}
            placeholder="0"
          />
        </div>
        <span className="text-2xl font-bold pb-3 opacity-50">-</span>
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[140px]">
          <span
            className="text-xs font-bold uppercase tracking-wide opacity-80 truncate max-w-full text-center"
            style={{ color: "var(--color-gold)" }}
          >
            {config.labelAway ?? "Équipe B"}
          </span>
          <Input
            type="number"
            min={0}
            max={999}
            inputMode="numeric"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={locked}
            className="text-center text-2xl font-bold h-14"
            style={{
              color: "#1a0e3a",
              WebkitTextFillColor: "#1a0e3a",
              backgroundColor: "#ffffff",
            }}
            placeholder="0"
          />
        </div>
      </div>
      <p className="text-[11px] text-center opacity-60 italic">
        Score exact = {config.exactPoints} pts · paliers d&apos;écart bonus
      </p>
    </div>
  );
}
