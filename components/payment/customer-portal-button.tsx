"use client";

import { useTransition } from "react";

import { openCustomerPortalAction } from "@/lib/actions/subscription";

export function CustomerPortalButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await openCustomerPortalAction();
        })
      }
      className="px-4 py-2 rounded-lg border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white text-sm font-semibold transition disabled:opacity-50"
    >
      {isPending ? "Ouverture…" : "🔐 Gérer mon abo (Stripe)"}
    </button>
  );
}
