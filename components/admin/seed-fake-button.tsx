"use client";

// =============================================
// V52 — Bouton admin pour générer des participations factices
// =============================================

import { useActionState, useState } from "react";

import {
  seedFakeParticipationsAction,
  type SeedFakeState,
} from "@/lib/actions/admin/seed-fake-participations";

export function SeedFakeButton({
  quizId,
  code,
  title,
}: {
  quizId: string;
  code: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState("20");
  const [state, formAction, isPending] = useActionState(
    seedFakeParticipationsAction,
    { ok: false } as SeedFakeState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Générer des participations factices (démo)"
        className="text-xs px-2 py-1 rounded border border-[var(--color-violet-primary)]/40 text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)]/10"
      >
        🌱
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
            <h2 className="font-display text-xl mb-3 text-[var(--color-violet-deep)]">
              🌱 Générer des participations factices
            </h2>
            <p className="text-sm mb-1">
              <strong>{title}</strong>{" "}
              <span className="font-mono text-xs opacity-60">({code})</span>
            </p>
            <p className="text-xs text-zinc-600 mb-4">
              Crée des participants fictifs avec pseudos, scores et chronos
              réalistes — utile pour amorcer un classement de démo.
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

            <label className="block text-xs font-semibold mb-1 text-zinc-700">
              Nombre de participations (1 à 100)
            </label>
            <input
              type="number"
              name="count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min={1}
              max={100}
              required
              className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm mb-4 focus:outline-none focus:border-[var(--color-violet-primary)]"
            />

            <p className="text-[11px] text-zinc-500 italic mb-4">
              ⚠️ Action tracée dans l&apos;audit log. Les chronos sont étalés
              dans la fenêtre du créneau si SCHEDULED, sinon répartis sur les
              dernières 24h.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-3 py-2 rounded text-sm border border-zinc-300 hover:bg-zinc-50"
              >
                Fermer
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                {isPending ? "Génération…" : `Générer ${count} participations`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
