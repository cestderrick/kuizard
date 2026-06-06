"use client";

import { useActionState } from "react";

import {
  updateSuggestionStatusAction,
  type AdminSuggestionState,
} from "@/lib/actions/suggestion";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminSuggestionState = { ok: false };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "seen", label: "Vu" },
  { value: "done", label: "Traité" },
  { value: "wont_fix", label: "Ignoré" },
];

export function SuggestionStatusForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateSuggestionStatusAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form
      action={formAction}
      className="inline-flex items-center gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={currentStatus}
        disabled={isPending}
        className="text-xs px-2 py-1 rounded-md bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] disabled:opacity-60"
        // Soumission auto à chaque changement
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
