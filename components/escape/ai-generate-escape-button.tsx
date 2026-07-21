"use client";

// V60.5c — Bouton "Generer un escape avec IA"

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  generateEscapeAction,
  type GenerateEscapeState,
} from "@/lib/actions/ai/generate-escape";

const INITIAL: GenerateEscapeState = { ok: false };

export function AIGenerateEscapeButton({
  hasActiveSubscription,
}: {
  hasActiveSubscription: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [stepCount, setStepCount] = useState("6");
  const [difficulty, setDifficulty] = useState<
    "facile" | "moyen" | "difficile" | "expert"
  >("moyen");
  const [state, formAction, isPending] = useActionState(
    generateEscapeAction,
    INITIAL
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
        title="Generer un scenario d'escape complet avec l'IA"
      >
        ✨ Generer avec IA
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
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2
                className="font-display text-xl mb-3"
                style={{ color: "var(--color-violet-deep)" }}
              >
                ✨ Generation IA — Premium
              </h2>
              <p className="text-sm mb-4 text-zinc-700 leading-relaxed">
                Decris un theme, l&apos;IA te genere un scenario complet
                (5 a 12 enigmes progressives avec indices). Reserve aux abonnes.
              </p>
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
              <h2
                className="font-display text-xl mb-3"
                style={{ color: "var(--color-violet-deep)" }}
              >
                ✨ Generer un escape complet avec IA
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
                    Theme du scenario *
                  </Label>
                  <Input
                    id="theme"
                    name="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="ex : Braquage au musee du Louvre, Mystere en Egypte antique, Enquete a Poudlard..."
                    required
                    minLength={3}
                    maxLength={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="stepCount" className="text-xs">
                      Nombre d&apos;etapes (3-12)
                    </Label>
                    <Input
                      id="stepCount"
                      name="stepCount"
                      type="number"
                      min={3}
                      max={12}
                      value={stepCount}
                      onChange={(e) => setStepCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty" className="text-xs">
                      Difficulte
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
                      <option value="expert">🧠 Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 italic mb-4 leading-relaxed">
                ✨ L&apos;IA cree un scenario complet avec titre, description
                et etapes sequentielles (mix TEXT/CHOICE avec indices).
                Tu pourras tout modifier apres.
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
                    background: "linear-gradient(135deg, #5523bb, #f59e0b)",
                    color: "white",
                  }}
                >
                  {isPending ? "Generation..." : "✨ Generer"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
