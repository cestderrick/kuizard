"use client";

import { useActionState } from "react";

import {
  setWeeklyFeaturedAction,
  removeWeeklyFeaturedAction,
  type WeeklyState,
} from "@/lib/actions/admin/weekly";

const INITIAL: WeeklyState = { ok: false };

type SimpleQuiz = { id: string; title: string; code: string };

type ExistingFeatured = {
  id: string;
  quizId: string;
  title: string;
  subtitle: string | null;
  prizesText: string;
  weekStart: string; // ISO
  weekEnd: string;
  ctaLabel: string | null;
};

export function WeeklyFeaturedForm({
  quizzes,
  current,
}: {
  quizzes: SimpleQuiz[];
  current: ExistingFeatured | null;
}) {
  const [state, action, pending] = useActionState(
    setWeeklyFeaturedAction,
    INITIAL
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeWeeklyFeaturedAction,
    INITIAL
  );

  // Date helper : YYYY-MM-DD pour input type=date
  const toInputDate = (iso?: string) => {
    if (!iso) return "";
    return iso.slice(0, 10);
  };
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Quizz cible
          </span>
          <select
            name="quizId"
            required
            defaultValue={current?.quizId ?? ""}
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
          >
            <option value="">— Choisir un quiz publié —</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.code})
              </option>
            ))}
          </select>
          <span className="text-[10px] opacity-60">
            Seuls les quizz publiés ou en cours peuvent être featurés.
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Titre affiché sur la home
          </span>
          <input
            type="text"
            name="title"
            required
            minLength={3}
            maxLength={140}
            defaultValue={current?.title ?? ""}
            placeholder="Ex : Quizz de la semaine — Spécial Été"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Accroche courte (optionnel)
          </span>
          <input
            type="text"
            name="subtitle"
            maxLength={280}
            defaultValue={current?.subtitle ?? ""}
            placeholder="Ex : 10 questions sur les vacances, classement en temps réel"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Lots à gagner
          </span>
          <textarea
            name="prizesText"
            required
            minLength={3}
            maxLength={500}
            rows={3}
            defaultValue={current?.prizesText ?? ""}
            placeholder="Ex : 1er — bon Amazon 50 € · 2e — coffret Smartbox · 3e — t-shirt Kuizard"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
              Ouverture
            </span>
            <input
              type="date"
              name="weekStart"
              required
              defaultValue={toInputDate(current?.weekStart) || today}
              className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
              Clôture (tirage au sort)
            </span>
            <input
              type="date"
              name="weekEnd"
              required
              defaultValue={toInputDate(current?.weekEnd) || nextWeek}
              className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Libellé bouton CTA (optionnel)
          </span>
          <input
            type="text"
            name="ctaLabel"
            maxLength={80}
            defaultValue={current?.ctaLabel ?? ""}
            placeholder="🎁 Tenter ma chance"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>

        {state.message && (
          <p
            className={`text-xs ${
              state.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Enregistrement…"
            : current
            ? "💾 Mettre à jour"
            : "✨ Activer ce featured"}
        </button>
      </form>

      {current && (
        <form
          action={removeAction}
          onSubmit={(e) => {
            if (
              !confirm("Retirer ce featured ? Il disparaîtra de la home.")
            ) {
              e.preventDefault();
            }
          }}
          className="border-t border-[rgba(167,139,250,0.15)] pt-4"
        >
          <input type="hidden" name="id" value={current.id} />
          {removeState.message && (
            <p
              className={`text-xs mb-2 ${
                removeState.ok ? "text-green-400" : "text-red-400"
              }`}
            >
              {removeState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={removePending}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 text-red-200 hover:bg-red-900/60 disabled:opacity-50"
          >
            🗑 Retirer ce featured
          </button>
        </form>
      )}
    </div>
  );
}
