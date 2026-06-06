"use client";

import { useActionState } from "react";

import { createCheckoutSessionAction } from "@/lib/actions/checkout";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL = { ok: false };

export function CheckoutButton({
  quizId,
  planSlug,
  label,
  primary,
}: {
  quizId: string;
  planSlug: string;
  label: string;
  primary?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    createCheckoutSessionAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="planSlug" value={planSlug} />
      {/* TODO V2 : champ promoCode visible dans le form */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
          primary
            ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:brightness-110"
            : "border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white"
        }`}
      >
        {isPending ? "Redirection…" : label}
      </button>
    </form>
  );
}
