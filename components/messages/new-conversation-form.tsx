"use client";

import { useActionState } from "react";

import { createConversationAction } from "@/lib/actions/messages";
import { initialMessagesState } from "@/lib/messages/types";
import { useActionToast } from "@/lib/hooks/use-action-toast";

export function NewConversationForm() {
  const [state, formAction, isPending] = useActionState(
    createConversationAction,
    initialMessagesState
  );
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Sujet
        </span>
        <input
          name="subject"
          required
          minLength={3}
          maxLength={140}
          placeholder="Ex : Comment ajouter une photo ?"
          disabled={isPending}
          className="w-full rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)] disabled:opacity-60"
        />
        {state.errors?.subject && (
          <span className="text-xs text-red-600">
            {state.errors.subject[0]}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Message
        </span>
        <textarea
          name="body"
          required
          minLength={5}
          maxLength={4000}
          rows={6}
          placeholder="Décris ta question ou ton souci…"
          disabled={isPending}
          className="w-full rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)] disabled:opacity-60"
        />
        {state.errors?.body && (
          <span className="text-xs text-red-600">{state.errors.body[0]}</span>
        )}
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
          className="px-5 py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer le message ✨"}
        </button>
      </div>
    </form>
  );
}
