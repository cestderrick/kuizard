"use client";

import { useActionState } from "react";

import {
  deleteAccountAction,
  type ProfileState,
} from "@/lib/actions/profile";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: ProfileState = { ok: false };

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Es-tu absolument sûr ? Cette suppression est définitive : quizz, participations, messages, tout sera effacé."
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-red-900 bg-red-50 border border-red-200 rounded-lg p-3">
        Cette action est <strong>définitive et irréversible</strong>. Tous tes
        quizz, participations, messages et données personnelles seront
        supprimés conformément au droit à l'oubli (RGPD art. 17).
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-red-700 font-semibold">
          Mot de passe actuel
        </span>
        <input
          type="password"
          name="currentPassword"
          required
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-red-500"
        />
        {state.errors?.currentPassword && (
          <span className="text-xs text-red-600">
            {state.errors.currentPassword[0]}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-red-700 font-semibold">
          Tape "SUPPRIMER" pour confirmer
        </span>
        <input
          type="text"
          name="confirmation"
          required
          placeholder="SUPPRIMER"
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm uppercase font-mono focus:outline-none focus:border-red-500"
        />
        {state.errors?.confirmation && (
          <span className="text-xs text-red-600">
            {state.errors.confirmation[0]}
          </span>
        )}
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Suppression…" : "🗑 Supprimer définitivement mon compte"}
        </button>
      </div>
    </form>
  );
}
