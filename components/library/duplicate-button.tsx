"use client";

import { useActionState } from "react";

import {
  duplicateLibraryQuizAction,
  type DuplicateState,
} from "@/lib/actions/library";

const INITIAL: DuplicateState = { ok: false };

export function DuplicateButton({ libraryQuizId }: { libraryQuizId: string }) {
  const [state, action, pending] = useActionState(
    duplicateLibraryQuizAction,
    INITIAL
  );

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="libraryQuizId" value={libraryQuizId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-violet-primary)",
          color: "white",
        }}
      >
        {pending ? "Duplication…" : "✨ Dupliquer dans mon compte"}
      </button>
      {state.message && !state.ok && (
        <p className="text-xs text-red-600 mt-1">{state.message}</p>
      )}
    </form>
  );
}
