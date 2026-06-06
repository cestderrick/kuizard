"use client";

import { useActionState } from "react";

import { toggleConvoStatusAction } from "@/lib/actions/messages";
import { initialMessagesState } from "@/lib/messages/types";
import { useActionToast } from "@/lib/hooks/use-action-toast";

export function ToggleConvoStatusButton({
  conversationId,
  currentStatus,
}: {
  conversationId: string;
  currentStatus: string;
}) {
  const [state, formAction, isPending] = useActionState(
    toggleConvoStatusAction,
    initialMessagesState
  );
  useActionToast(state);

  const willClose = currentStatus === "open";

  return (
    <form action={formAction}>
      <input type="hidden" name="conversationId" value={conversationId} />
      <button
        type="submit"
        disabled={isPending}
        className={`text-xs px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${
          willClose
            ? "bg-zinc-500/15 border-zinc-500/40 text-zinc-200 hover:bg-zinc-500/25"
            : "bg-green-500/15 border-green-500/40 text-green-200 hover:bg-green-500/25"
        }`}
      >
        {willClose ? "🗄 Clôturer" : "↻ Rouvrir"}
      </button>
    </form>
  );
}
