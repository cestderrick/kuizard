"use client";

import { useActionState } from "react";

import {
  deleteAccountAction,
  type ProfileState,
} from "@/lib/actions/profile";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: ProfileState = { ok: false };

type DeleteFormTexts = {
  delete_warning_strong: string;
  delete_warning: string;
  current_password_label: string;
  delete_confirm_label: string;
  delete_confirm_value: string;
  delete_button: string;
  delete_deleting: string;
  delete_confirm_dialog: string;
};

export function DeleteAccountForm({ texts }: { texts: DeleteFormTexts }) {
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    INITIAL
  );
  useActionToast(state);

  // Interpolation simple côté client (le {strong} est remplacé par un <strong>)
  const warningParts = texts.delete_warning.split("{strong}");

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(texts.delete_confirm_dialog)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-red-900 bg-red-50 border border-red-200 rounded-lg p-3">
        {warningParts[0]}
        <strong>{texts.delete_warning_strong}</strong>
        {warningParts[1] ?? ""}
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-red-700 font-semibold">
          {texts.current_password_label}
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
          {texts.delete_confirm_label}
        </span>
        <input
          type="text"
          name="confirmation"
          required
          placeholder={texts.delete_confirm_value}
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
          {pending ? texts.delete_deleting : texts.delete_button}
        </button>
      </div>
    </form>
  );
}
