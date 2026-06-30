"use client";

// =============================================
// V55 — Bouton "Saisir le score" pour les questions SCORE_GUESS
// =============================================
// Affiche un encart visible (avec ou sans modal) sur la liste des questions
// de l'editeur de quiz. Permet a l'organisateur de saisir le score reel
// apres le match. Le scoring de tous les participants est recalcule.

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  setScoreGuessResultAction,
  type SetScoreGuessResultState,
} from "@/lib/actions/quiz/set-score-guess-result";

type Props = {
  quizId: string;
  questionId: string;
  labelHome?: string | null;
  labelAway?: string | null;
  /** Score reel actuel (null = pas encore saisi) */
  currentHome: number | null;
  currentAway: number | null;
  /** Nombre de participations qui seront impactees par le recalcul */
  participantCount?: number;
};

const initial: SetScoreGuessResultState = { ok: false };

export function ScoreGuessResultButton({
  quizId,
  questionId,
  labelHome,
  labelAway,
  currentHome,
  currentAway,
  participantCount = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [home, setHome] = useState(
    currentHome !== null && currentHome !== undefined ? String(currentHome) : ""
  );
  const [away, setAway] = useState(
    currentAway !== null && currentAway !== undefined ? String(currentAway) : ""
  );
  const [state, formAction, isPending] = useActionState(
    setScoreGuessResultAction,
    initial
  );

  const hasResult = currentHome !== null && currentAway !== null;
  const lh = labelHome || "Équipe A";
  const la = labelAway || "Équipe B";

  // Auto-ferme apres succes
  useEffect(() => {
    if (state.ok && !isPending && open) {
      const t = setTimeout(() => setOpen(false), 1400);
      return () => clearTimeout(t);
    }
  }, [state.ok, isPending, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition hover:opacity-90 border"
        style={
          hasResult
            ? {
                backgroundColor: "rgba(34,197,94,0.1)",
                borderColor: "rgba(34,197,94,0.5)",
                color: "#166534",
              }
            : {
                backgroundColor: "rgba(245,158,11,0.15)",
                borderColor: "rgba(245,158,11,0.6)",
                color: "#92400e",
              }
        }
        title={
          hasResult
            ? `Score saisi : ${currentHome} - ${currentAway}. Cliquer pour modifier.`
            : "Score reel pas encore saisi — cliquer pour le renseigner"
        }
      >
        {hasResult ? (
          <>🏆 {currentHome} - {currentAway}</>
        ) : (
          <>🏆 Saisir le score</>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !isPending && setOpen(false)}
          />
          <form
            action={formAction}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <input type="hidden" name="quizId" value={quizId} />
            <input type="hidden" name="questionId" value={questionId} />

            <h2
              className="font-display text-xl mb-2"
              style={{ color: "var(--color-violet-deep)" }}
            >
              🏆 Saisir le score final
            </h2>
            <p className="text-sm text-zinc-700 mb-4 leading-relaxed">
              Une fois saisi, les pronostics de tous les participants seront
              recalcules selon le bareme.{" "}
              {participantCount > 0 && (
                <>
                  <strong>{participantCount} participation{participantCount > 1 ? "s" : ""}</strong>{" "}
                  sera{participantCount > 1 ? "ont" : ""} mise{participantCount > 1 ? "s" : ""} a jour.
                </>
              )}
            </p>

            {state.message && (
              <div
                className={`text-sm rounded p-2 mb-3 ${
                  state.ok
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {state.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4 items-end">
              <div>
                <Label htmlFor="sg-home" className="text-xs font-bold block mb-1">
                  {lh}
                </Label>
                <Input
                  id="sg-home"
                  name="home"
                  type="number"
                  min={0}
                  max={999}
                  value={home}
                  onChange={(e) => setHome(e.target.value)}
                  placeholder="0"
                  className="text-2xl font-bold text-center h-14"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="sg-away" className="text-xs font-bold block mb-1">
                  {la}
                </Label>
                <Input
                  id="sg-away"
                  name="away"
                  type="number"
                  min={0}
                  max={999}
                  value={away}
                  onChange={(e) => setAway(e.target.value)}
                  placeholder="0"
                  className="text-2xl font-bold text-center h-14"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 italic mb-4 leading-relaxed">
              💡 Astuce : laisse les deux champs vides et clique sur Enregistrer
              pour <strong>annuler</strong> un score deja saisi (les participations
              repassent a 0 sur cette question).
            </p>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-3 py-2 rounded text-sm border border-zinc-300 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <Button
                type="submit"
                disabled={isPending}
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                {isPending ? "Recalcul…" : "Enregistrer & recalculer"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
