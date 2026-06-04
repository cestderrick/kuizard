"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  publishQuizAction,
  unpublishQuizAction,
  type PublishQuizState,
} from "@/lib/actions/quiz";

const initial: PublishQuizState = { ok: false };

type Props = {
  quizId: string;
  isPublished: boolean;
  hasQuestions: boolean;
};

export function PublishButton({ quizId, isPublished, hasQuestions }: Props) {
  const action = isPublished ? unpublishQuizAction : publishQuizAction;
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <div className="flex flex-col gap-3">
      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <form action={formAction}>
        <input type="hidden" name="quizId" value={quizId} />
        <Button
          type="submit"
          disabled={isPending || (!isPublished && !hasQuestions)}
          style={
            isPublished
              ? {
                  backgroundColor: "white",
                  color: "var(--color-violet-primary)",
                  border: "1.5px solid var(--color-violet-primary)",
                }
              : {
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }
          }
          size="lg"
        >
          {isPending
            ? isPublished
              ? "Dépublication…"
              : "Publication…"
            : isPublished
            ? "Remettre en brouillon"
            : "Publier le quizz ✨"}
        </Button>
        {!isPublished && !hasQuestions && (
          <p className="mt-2 text-xs text-muted-foreground">
            Tu dois ajouter au moins 1 question avant de publier.
          </p>
        )}
      </form>
    </div>
  );
}
