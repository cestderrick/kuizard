"use client";

// Formulaire de réponse réutilisable côté user ET côté admin (l'action
// est passée en prop).

import { useActionState, useEffect, useRef } from "react";

import {
  type MessagesState,
  initialMessagesState,
} from "@/lib/actions/messages";
import { useActionToast } from "@/lib/hooks/use-action-toast";

type ReplyAction = (
  prev: MessagesState,
  formData: FormData
) => Promise<MessagesState>;

export function ReplyForm({
  conversationId,
  action,
  placeholder = "Ta réponse…",
  disabled,
  disabledMessage,
}: {
  conversationId: string;
  action: ReplyAction;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialMessagesState
  );
  useActionToast(state);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset du textarea après envoi OK
  useEffect(() => {
    if (state.ok && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [state]);

  if (disabled) {
    return (
      <div className="rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(167,139,250,0.15)] p-4 text-sm opacity-70 text-center">
        {disabledMessage ?? "Conversation clôturée."}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        ref={textareaRef}
        name="body"
        placeholder={placeholder}
        rows={3}
        required
        disabled={isPending}
        className="w-full rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] placeholder:opacity-50 focus:outline-none focus:border-[var(--color-gold)] disabled:opacity-60"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold hover:bg-[var(--color-gold-light)] disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer ✉️"}
        </button>
      </div>
    </form>
  );
}
