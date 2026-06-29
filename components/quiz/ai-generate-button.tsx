"use client";

// =============================================
// V53 — Bouton "Générer avec IA" pour l'éditeur de quiz
// =============================================

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  generateQuizQuestionsAction,
  type AIGenerateState,
} from "@/lib/actions/ai/generate-quiz-questions";

export function AIGenerateButton({
  quizId,
  hasActiveSubscription,
}: {
  quizId: string;
  hasActiveSubscription: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState("10");
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");
  const [state, formAction, isPending] = useActionState(
    generateQuizQuestionsAction,
    { ok: false } as AIGenerateState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #5523bb, #f59e0b)",
          color: "white",
        }}
        title="Générer des questions automatiquement avec une IA"
      >
        ✨ Générer avec IA
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

          {!hasActiveSubscription ? (
            // Pas d'abo : on affiche un upgrade CTA
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="font-display text-xl mb-3" style={{ color: "var(--color-violet-deep)" }}>
                ✨ Génération IA — Premium
              </h2>
              <p className="text-sm mb-4 text-zinc-700 leading-relaxed">
                Décris ton thème, choisis la difficulté, l&apos;IA te génère
                un quizz complet en quelques secondes. Réservé aux abonnés.
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-5 text-xs text-amber-900">
                Cette fonctionnalité fait partie des abonnements Bar /
                Entreprise. Active un abo pour la débloquer instantanément.
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded text-sm border border-zinc-300 hover:bg-zinc-50"
                >
                  Plus tard
                </button>
                <Link
                  href="/tarifs#abonnements"
                  className="px-4 py-2 rounded text-sm font-bold inline-flex items-center"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  Voir les abonnements →
                </Link>
              </div>
            </div>
          ) : (
            <form
              action={formAction}
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <input type="hidden" name="quizId" value={quizId} />
              <h2 className="font-display text-xl mb-3" style={{ color: "var(--color-violet-deep)" }}>
                ✨ Générer des questions avec IA
              </h2>

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

              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <Label htmlFor="theme" className="text-xs">
                    Thème / sujet *
                  </Label>
                  <Input
                    id="theme"
                    name="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="ex : Culture générale années 90, Football Coupe du Monde, Friends saison 1..."
                    required
                    minLength={3}
                    maxLength={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="count" className="text-xs">
                      Nombre de questions (3-30)
                    </Label>
                    <Input
                      id="count"
                      name="count"
                      type="number"
                      min={3}
                      max={30}
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty" className="text-xs">
                      Difficulté
                    </Label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(e.target.value as typeof difficulty)
                      }
                      className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm h-8"
                    >
                      <option value="facile">😊 Facile</option>
                      <option value="moyen">🤔 Moyen</option>
                      <option value="difficile">🔥 Difficile</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 italic mb-4 leading-relaxed">
                ✨ L&apos;IA génère des QCM 4 réponses avec 1 bonne. Tu peux
                tout modifier après. Les questions sont ajoutées à la suite
                des existantes (pas de remplacement).
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
                  disabled={isPending || theme.trim().length < 3}
                  style={{
                    background:
                      "linear-gradient(135deg, #5523bb, #f59e0b)",
                    color: "white",
                  }}
                >
                  {isPending ? "Génération…" : "✨ Générer"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
