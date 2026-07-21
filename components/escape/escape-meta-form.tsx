"use client";

// V60.2 — Formulaire meta de l'escape (titre, description, chrono, cout indice)

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateEscapeMetaAction,
  type UpdateEscapeMetaState,
} from "@/lib/actions/escape";

const INITIAL: UpdateEscapeMetaState = { ok: false };

type Props = {
  escapeId: string;
  defaultTitle: string;
  defaultDescription: string | null;
  defaultTimerMinutes: number | null;
  defaultHintCostPoints: number;
};

export function EscapeMetaForm({
  escapeId,
  defaultTitle,
  defaultDescription,
  defaultTimerMinutes,
  defaultHintCostPoints,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateEscapeMetaAction,
    INITIAL
  );
  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="escapeId" value={escapeId} />

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
          minLength={2}
          maxLength={100}
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
          rows={2}
          maxLength={500}
          defaultValue={defaultDescription ?? ""}
          placeholder="Le pitch de ton escape (theme, ambiance, contexte...)"
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="timerMinutes">
            Chrono en minutes (optionnel)
          </Label>
          <Input
            id="timerMinutes"
            name="timerMinutes"
            type="number"
            min={1}
            max={600}
            defaultValue={defaultTimerMinutes ?? ""}
            placeholder="ex : 60"
          />
          <p className="text-xs text-muted-foreground -mt-1">
            Vide = pas de limite de temps.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hintCostPoints">Coût d&apos;un indice (pts)</Label>
          <Input
            id="hintCostPoints"
            name="hintCostPoints"
            type="number"
            min={0}
            max={100}
            defaultValue={defaultHintCostPoints}
          />
          <p className="text-xs text-muted-foreground -mt-1">
            Points deduits chaque fois qu&apos;une equipe deverrouille un indice.
          </p>
        </div>
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
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
