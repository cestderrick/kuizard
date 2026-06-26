"use client";

// =============================================
// V50 — Éditeur de question SCORE_GUESS
// =============================================
// Sous-formulaire affiché dans QuestionForm quand type === "SCORE_GUESS".
// Le state est lifté vers le parent via onChange (string JSON serializable).

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseScoreGuessConfig,
  type ScoreGuessConfig,
} from "@/lib/quiz/score-guess";

const DEFAULT_CONFIG: ScoreGuessConfig = {
  labelHome: "Équipe A",
  labelAway: "Équipe B",
  expectedHome: 2,
  expectedAway: 1,
  exactPoints: 10,
  brackets: [
    { maxDiff: 1, points: 6 },
    { maxDiff: 3, points: 3 },
    { maxDiff: 5, points: 1 },
  ],
};

export function ScoreGuessEditor({
  initialJson,
  onChange,
}: {
  initialJson: unknown;
  onChange: (cfg: ScoreGuessConfig) => void;
}) {
  const [cfg, setCfg] = useState<ScoreGuessConfig>(() => {
    return parseScoreGuessConfig(initialJson) ?? DEFAULT_CONFIG;
  });

  useEffect(() => {
    onChange(cfg);
  }, [cfg, onChange]);

  function patch(partial: Partial<ScoreGuessConfig>) {
    setCfg((prev) => ({ ...prev, ...partial }));
  }

  function patchBracket(index: number, key: "maxDiff" | "points", value: number) {
    setCfg((prev) => ({
      ...prev,
      brackets: prev.brackets.map((b, i) =>
        i === index ? { ...b, [key]: Math.max(0, Math.floor(value)) } : b
      ),
    }));
  }

  function addBracket() {
    setCfg((prev) => ({
      ...prev,
      brackets: [
        ...prev.brackets,
        {
          maxDiff: (prev.brackets[prev.brackets.length - 1]?.maxDiff ?? 0) + 2,
          points: 1,
        },
      ],
    }));
  }

  function removeBracket(index: number) {
    setCfg((prev) => ({
      ...prev,
      brackets: prev.brackets.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-violet-100 p-4 bg-violet-50/30">
      <p className="text-xs uppercase tracking-[2px] font-semibold text-[var(--color-violet-primary)]">
        ⚽ Find the score — barème
      </p>

      {/* Labels équipes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="sg-labelHome" className="text-xs">
            Équipe A (label optionnel)
          </Label>
          <Input
            id="sg-labelHome"
            type="text"
            value={cfg.labelHome ?? ""}
            onChange={(e) => patch({ labelHome: e.target.value })}
            placeholder="ex : PSG"
            maxLength={40}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sg-labelAway" className="text-xs">
            Équipe B (label optionnel)
          </Label>
          <Input
            id="sg-labelAway"
            type="text"
            value={cfg.labelAway ?? ""}
            onChange={(e) => patch({ labelAway: e.target.value })}
            placeholder="ex : OM"
            maxLength={40}
          />
        </div>
      </div>

      {/* Score attendu */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="sg-expHome" className="text-xs">
            Score Équipe A *
          </Label>
          <Input
            id="sg-expHome"
            type="number"
            min={0}
            value={cfg.expectedHome}
            onChange={(e) =>
              patch({ expectedHome: Math.max(0, parseInt(e.target.value) || 0) })
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sg-expAway" className="text-xs">
            Score Équipe B *
          </Label>
          <Input
            id="sg-expAway"
            type="number"
            min={0}
            value={cfg.expectedAway}
            onChange={(e) =>
              patch({ expectedAway: Math.max(0, parseInt(e.target.value) || 0) })
            }
          />
        </div>
      </div>

      {/* Points score exact */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="sg-exactPts" className="text-xs">
          Points si score exact *
        </Label>
        <Input
          id="sg-exactPts"
          type="number"
          min={0}
          value={cfg.exactPoints}
          onChange={(e) =>
            patch({ exactPoints: Math.max(0, parseInt(e.target.value) || 0) })
          }
        />
      </div>

      {/* Brackets */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Paliers de récompense par écart</Label>
        <p className="text-[11px] text-muted-foreground -mt-1">
          Si pas exact, on prend le 1er palier où |Δscore A| + |Δscore B|
          ≤ écart max. Trier par écart croissant.
        </p>
        {cfg.brackets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs opacity-70 w-6">#{i + 1}</span>
            <span className="text-xs">Écart ≤</span>
            <Input
              type="number"
              min={1}
              value={b.maxDiff}
              onChange={(e) =>
                patchBracket(i, "maxDiff", parseInt(e.target.value) || 1)
              }
              className="w-20"
            />
            <span className="text-xs">→</span>
            <Input
              type="number"
              min={0}
              value={b.points}
              onChange={(e) =>
                patchBracket(i, "points", parseInt(e.target.value) || 0)
              }
              className="w-20"
            />
            <span className="text-xs">pts</span>
            <button
              type="button"
              onClick={() => removeBracket(i)}
              disabled={cfg.brackets.length <= 1}
              className="px-2 text-xs text-destructive hover:bg-destructive/10 rounded disabled:opacity-30"
              title="Supprimer ce palier"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addBracket}
          disabled={cfg.brackets.length >= 6}
          className="self-start text-xs px-2 py-1 rounded border border-violet-200 text-[var(--color-violet-primary)] hover:bg-violet-50 disabled:opacity-30"
        >
          + Ajouter un palier
        </button>
      </div>
    </div>
  );
}
