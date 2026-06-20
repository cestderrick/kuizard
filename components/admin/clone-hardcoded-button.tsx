"use client";

import { useActionState } from "react";

import {
  cloneHardcodedTemplateAction,
  type CloneState,
} from "@/lib/actions/admin-templates";

const INITIAL: CloneState = { ok: false };

export function CloneHardcodedButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [state, formAction, isPending] = useActionState(
    cloneHardcodedTemplateAction,
    INITIAL
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 self-start"
        style={{
          backgroundColor: "var(--color-gold)",
          color: "var(--color-violet-deep)",
        }}
      >
        {isPending ? "Clonage…" : `📋 Cloner « ${title} » en BDD pour modifier`}
      </button>
      {state.message && (
        <p
          className={
            "text-xs " +
            (state.ok ? "text-green-300" : "text-red-300")
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
