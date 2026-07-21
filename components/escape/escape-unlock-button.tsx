"use client";

// V60.5d — Bouton "Debloquer" qui declenche le checkout Stripe

import { useActionState, useEffect } from "react";

import {
  createEscapeUnlockCheckoutSessionAction,
  type EscapeCheckoutState,
} from "@/lib/actions/escape-checkout";

const INITIAL: EscapeCheckoutState = { ok: false };

type Props = {
  escapeLibraryId: string;
  planSlug: string;
};

export function EscapeUnlockButton({ escapeLibraryId, planSlug }: Props) {
  const [state, formAction, isPending] = useActionState(
    createEscapeUnlockCheckoutSessionAction,
    INITIAL
  );

  // Redirect quand on a l'URL Stripe
  useEffect(() => {
    if (state.ok && state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state.ok, state.redirectUrl]);

  return (
    <form action={formAction}>
      <input type="hidden" name="escapeLibraryId" value={escapeLibraryId} />
      <input type="hidden" name="planSlug" value={planSlug} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-violet-primary)",
          color: "white",
        }}
      >
        {isPending ? "..." : "🔓 Debloquer"}
      </button>
      {state.message && !state.ok && (
        <p className="text-xs text-destructive mt-1">{state.message}</p>
      )}
    </form>
  );
}
