"use client";

import { useActionState } from "react";

import {
  deleteSuggestionAction,
  type AdminSuggestionState,
} from "@/lib/actions/suggestion";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminSuggestionState = { ok: false };

export function SuggestionDeleteButton({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(
    deleteSuggestionAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Supprimer cette suggestion définitivement ?")) {
          e.preventDefault();
        }
      }}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-50"
      >
        🗑
      </button>
    </form>
  );
}
