"use client";

import { useActionState } from "react";

import { acceptTermsAction, type AcceptTermsState } from "@/lib/actions/legal";

const INITIAL: AcceptTermsState = { ok: false };

export function AcceptTermsForm({ nextPath }: { nextPath?: string }) {
  const [state, action, pending] = useActionState(acceptTermsAction, INITIAL);

  return (
    <form action={action} className="not-prose mt-6 flex flex-col gap-4">
      {nextPath && (
        <input type="hidden" name="next" value={nextPath} />
      )}

      <label
        htmlFor="accept"
        className="flex items-start gap-2 text-sm cursor-pointer select-none rounded-lg border-2 border-[var(--color-violet-primary)]/20 bg-violet-50/40 p-4"
      >
        <input
          id="accept"
          name="accept"
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--color-violet-primary)]"
        />
        <span>
          J'ai lu et j'accepte les{" "}
          <strong>Conditions générales d'utilisation</strong> et les{" "}
          <strong>Conditions générales de vente</strong> de Kuizard en vigueur.
        </span>
      </label>

      {state.message && !state.ok && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-end px-5 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 text-white"
        style={{ backgroundColor: "var(--color-violet-primary)" }}
      >
        {pending ? "Enregistrement…" : "Accepter et continuer ✨"}
      </button>
    </form>
  );
}
