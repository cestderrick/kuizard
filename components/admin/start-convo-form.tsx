"use client";

import { useActionState } from "react";

import { adminStartConversationAction } from "@/lib/actions/messages";
import { initialMessagesState } from "@/lib/messages/types";
import { useActionToast } from "@/lib/hooks/use-action-toast";

export function StartConvoForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    adminStartConversationAction,
    initialMessagesState
  );
  useActionToast(state);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[2px] opacity-70 text-[var(--color-gold)] font-semibold">
          Sujet
        </span>
        <input
          name="subject"
          required
          minLength={3}
          maxLength={140}
          placeholder="Ex : À propos de ton dernier quizz"
          disabled={pending}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[2px] opacity-70 text-[var(--color-gold)] font-semibold">
          Message
        </span>
        <textarea
          name="body"
          required
          minLength={5}
          maxLength={4000}
          rows={5}
          placeholder="Le message envoyé déclenchera aussi une notification email."
          disabled={pending}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Envoi…" : "✉️ Envoyer"}
        </button>
      </div>
    </form>
  );
}
