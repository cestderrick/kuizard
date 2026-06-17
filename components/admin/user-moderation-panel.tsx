"use client";

import { useActionState } from "react";

import {
  banUserAction,
  unbanUserAction,
  type ModerationState,
} from "@/lib/actions/admin/moderation";

const INITIAL: ModerationState = { ok: false };

export function BanUserForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(banUserAction, INITIAL);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Bannir définitivement cet utilisateur ? Il ne pourra plus se connecter.")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Raison du bannissement (interne)
        </span>
        <textarea
          name="reason"
          required
          minLength={3}
          maxLength={500}
          rows={3}
          placeholder="Ex : Spam répété, contenu illégal signalé, violation CGU §3..."
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
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Bannissement…" : "🚫 Bannir cet utilisateur"}
      </button>
    </form>
  );
}

export function UnbanUserForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(unbanUserAction, INITIAL);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-violet-primary)] text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Déblocage…" : "✓ Lever le bannissement"}
      </button>
    </form>
  );
}
