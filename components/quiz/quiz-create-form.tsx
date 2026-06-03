"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { createQuizAction, type CreateQuizState } from "@/lib/actions/quiz";

const initialState: CreateQuizState = { ok: false };

export function QuizCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createQuizAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre du quizz</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          maxLength={80}
          placeholder="Quizz du mariage de Marie & Paul"
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">
            {state.errors.title.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">
          Description (optionnel)
          <span className="text-muted-foreground font-normal ml-1">
            — affichée aux participants
          </span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
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
          defaultValue="LIVE_MANUAL"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="LIVE_MANUAL">
            🎩 Pilotage live — tu lances les questions une par une
          </option>
          <option value="SCHEDULED">
            ⏰ Créneau horaire — accessible entre deux dates
          </option>
        </select>
        <p className="text-xs text-muted-foreground">
          Tu pourras changer ce mode plus tard.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          {isPending ? "Création…" : "Créer le quizz ✨"}
        </Button>
      </div>
    </form>
  );
}
