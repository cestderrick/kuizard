"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updatePrizesAction,
  type UpdatePrizesState,
} from "@/lib/actions/quiz";

type Prize = {
  rank: number;
  label: string;
  description?: string;
};

const initial: UpdatePrizesState = { ok: false };

type Props = {
  quizId: string;
  defaultPrizes: Prize[];
};

const MAX_PRIZES = 10;

export function PrizesEditor({ quizId, defaultPrizes }: Props) {
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    if (defaultPrizes.length === 0) return [];
    // Trier par rang croissant
    return [...defaultPrizes].sort((a, b) => a.rank - b.rank);
  });

  const [state, formAction, isPending] = useActionState(
    updatePrizesAction,
    initial
  );

  function updatePrize(index: number, patch: Partial<Prize>) {
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  }

  function removePrize(index: number) {
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  }

  function addPrize() {
    setPrizes((prev) => {
      if (prev.length >= MAX_PRIZES) return prev;
      const nextRank =
        prev.length === 0
          ? 1
          : Math.max(...prev.map((p) => p.rank)) + 1;
      return [...prev, { rank: nextRank, label: "", description: "" }];
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="prizesJson" value={JSON.stringify(prizes)} />

      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {prizes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[var(--color-violet-light)] p-6 text-center">
          <div className="text-4xl mb-2" aria-hidden>
            🎁
          </div>
          <p className="text-sm text-muted-foreground">
            Aucun lot configuré. Ajoute une récompense pour le 1er, le 2e…
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {prizes.map((p, index) => (
            <li
              key={index}
              className="grid grid-cols-[64px_1fr_auto] gap-3 items-start rounded-lg border bg-white p-3"
              style={{
                borderColor:
                  p.rank === 1
                    ? "var(--color-gold)"
                    : p.rank === 2
                    ? "#cbd5e1"
                    : p.rank === 3
                    ? "#fb923c"
                    : "#e4e4e7",
              }}
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor={`rank-${index}`} className="text-xs">
                  Rang
                </Label>
                <Input
                  id={`rank-${index}`}
                  type="number"
                  min={1}
                  max={20}
                  value={p.rank}
                  onChange={(e) =>
                    updatePrize(index, {
                      rank: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                    })
                  }
                  className="text-center font-display font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <Label htmlFor={`label-${index}`} className="text-xs">
                    Lot
                  </Label>
                  <Input
                    id={`label-${index}`}
                    type="text"
                    value={p.label}
                    onChange={(e) =>
                      updatePrize(index, { label: e.target.value })
                    }
                    placeholder="ex : Bon resto Italien pour 2"
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`desc-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    Détails (optionnel)
                  </Label>
                  <Input
                    id={`desc-${index}`}
                    type="text"
                    value={p.description ?? ""}
                    onChange={(e) =>
                      updatePrize(index, { description: e.target.value })
                    }
                    placeholder="ex : Valable chez La Trattoria"
                    maxLength={300}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePrize(index)}
                className="self-start px-2 py-1 text-sm text-destructive hover:bg-destructive/10 rounded"
                title="Supprimer le lot"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t">
        <div>
          {prizes.length < MAX_PRIZES && (
            <Button
              type="button"
              variant="outline"
              onClick={addPrize}
              style={{
                borderColor: "var(--color-violet-light)",
                color: "var(--color-violet-primary)",
              }}
            >
              + Ajouter un lot
            </Button>
          )}
          {prizes.length >= MAX_PRIZES && (
            <p className="text-xs text-muted-foreground italic">
              Maximum {MAX_PRIZES} lots
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les lots"}
        </Button>
      </div>
    </form>
  );
}
