"use client";

// V33 — Bouton "Appliquer mon crédit" sur une card quiz

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  applyCreditToQuizAction,
  type ApplyCreditState,
} from "@/lib/actions/credits";

type Credit = {
  id: string;
  planName: string | null;
  planSlug: string | null;
  amountCents: number;
};

const INITIAL: ApplyCreditState = { ok: false };

export function ApplyCreditButton({
  quizId,
  quizTitle,
  credits,
}: {
  quizId: string;
  quizTitle: string;
  credits: Credit[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(credits[0]?.id ?? "");
  const [state, formAction, isPending] = useActionState(
    applyCreditToQuizAction,
    INITIAL
  );

  if (credits.length === 0) return null;

  const selected = credits.find((c) => c.id === selectedId) ?? credits[0];

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: "var(--color-gold)",
          color: "var(--color-violet-deep)",
        }}
        className="font-bold"
      >
        ✨ Appliquer mon crédit
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div
              className="px-5 py-4 border-b"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-violet-deep), var(--color-violet-primary))",
              }}
            >
              <p className="text-[10px] uppercase tracking-[3px] font-bold text-[var(--color-gold)] mb-1">
                ✨ Appliquer un crédit
              </p>
              <p className="text-white font-display text-lg font-bold truncate">
                {quizTitle}
              </p>
            </div>

            <form action={formAction} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="quizId" value={quizId} />
              <input type="hidden" name="paymentId" value={selectedId} />

              {credits.length > 1 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[2px] font-semibold text-muted-foreground">
                    Quel crédit appliquer ?
                  </p>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    {credits.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.planName ?? c.planSlug ?? "Crédit"} —{" "}
                        {(c.amountCents / 100).toFixed(2).replace(".", ",")} €
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tu vas appliquer ton crédit{" "}
                  <strong>{selected?.planName ?? selected?.planSlug}</strong> (
                  {((selected?.amountCents ?? 0) / 100)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  €) à ce quiz. L&apos;opération est irréversible.
                </p>
              )}

              {state.message && (
                <p
                  className={`text-sm rounded-md px-3 py-2 ${
                    state.ok
                      ? "text-green-700 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {state.message}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-zinc-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  {isPending ? "Application…" : "✨ Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
