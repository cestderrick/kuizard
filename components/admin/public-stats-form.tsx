"use client";

import { useActionState } from "react";

import {
  updatePublicStatsConfigAction,
  type PublicStatsState,
} from "@/lib/actions/admin-public-stats";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: PublicStatsState = { ok: false };

type Defaults = {
  enabled: boolean;
  showUsers: boolean;
  showQuizzes: boolean;
  showQuestions: boolean;
  showParticipations: boolean;
  showAvgScore: boolean;
  customTitle: string | null;
  customSubtitle: string | null;
};

export function PublicStatsConfigForm({ defaults }: { defaults: Defaults }) {
  const [state, action, pending] = useActionState(
    updatePublicStatsConfigAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form
      action={action}
      className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5 flex flex-col gap-5"
    >
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={defaults.enabled}
          className="w-5 h-5 accent-[var(--color-gold)]"
        />
        <span className="font-semibold">
          🌍 Afficher publiquement les stats
        </span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Toggle name="showUsers" label="🧙 Utilisateurs inscrits" value={defaults.showUsers} />
        <Toggle name="showQuizzes" label="🎩 Quizz créés" value={defaults.showQuizzes} />
        <Toggle name="showQuestions" label="❓ Questions posées" value={defaults.showQuestions} />
        <Toggle name="showParticipations" label="🎮 Joueurs participants" value={defaults.showParticipations} />
        <Toggle name="showAvgScore" label="⭐ Score moyen" value={defaults.showAvgScore} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Titre personnalisé (optionnel)
          </span>
          <input
            name="customTitle"
            defaultValue={defaults.customTitle ?? ""}
            placeholder="Kuizard en chiffres"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Sous-titre (optionnel)
          </span>
          <input
            name="customSubtitle"
            defaultValue={defaults.customSubtitle ?? ""}
            placeholder="Depuis 2026, une communauté qui grandit"
            className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={value}
        className="w-4 h-4 accent-[var(--color-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}
