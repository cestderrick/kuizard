"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateQuizMetaAction,
  type UpdateQuizMetaState,
} from "@/lib/actions/quiz";

const initialState: UpdateQuizMetaState = { ok: false };

type Props = {
  quizId: string;
  defaultTitle: string;
  defaultDescription: string | null;
  defaultMode: "LIVE_MANUAL" | "SCHEDULED";
};

export function QuizMetaForm({
  quizId,
  defaultTitle,
  defaultDescription,
  defaultMode,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateQuizMetaAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="quizId" value={quizId} />

      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          maxLength={80}
          defaultValue={defaultTitle}
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">
            {state.errors.title.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaultDescription ?? ""}
          placeholder="Quelques mots pour annoncer le quizz aux participants…"
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 resize-none"
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mode">Mode de pilotage</Label>
        <select
          id="mode"
          name="mode"
          defaultValue={defaultMode}
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="LIVE_MANUAL">
            🎩 Pilotage live — tu lances les questions une par une
          </option>
          <option value="SCHEDULED">
            ⏰ Créneau horaire — accessible entre deux dates
          </option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
