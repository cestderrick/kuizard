"use client";

import { useActionState, useState } from "react";

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
  defaultOpenAt: Date | null;
  defaultCloseAt: Date | null;
};

/**
 * Convertit une Date en string compatible avec <input type="datetime-local">
 * (format : "YYYY-MM-DDTHH:mm", heure locale).
 */
function toDatetimeLocalValue(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function QuizMetaForm({
  quizId,
  defaultTitle,
  defaultDescription,
  defaultMode,
  defaultOpenAt,
  defaultCloseAt,
}: Props) {
  const [mode, setMode] = useState<"LIVE_MANUAL" | "SCHEDULED">(defaultMode);

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
          value={mode}
          onChange={(e) =>
            setMode(e.target.value as "LIVE_MANUAL" | "SCHEDULED")
          }
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

      {mode === "SCHEDULED" && (
        <div className="rounded-lg border border-[var(--color-violet-light)] bg-[var(--color-lavender)] p-4 flex flex-col gap-3">
          <p className="text-sm font-medium" style={{ color: "var(--color-violet-deep)" }}>
            ⏰ Créneau d'ouverture
          </p>
          <p className="text-xs text-muted-foreground">
            Le quizz sera accessible aux participants uniquement entre ces deux
            dates. Avant : compte à rebours. Après : classement final figé.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="scheduledOpenAt" className="text-xs">
                Ouverture
              </Label>
              <Input
                id="scheduledOpenAt"
                name="scheduledOpenAt"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(defaultOpenAt)}
                required={mode === "SCHEDULED"}
              />
              {state.errors?.scheduledOpenAt && (
                <p className="text-xs text-destructive">
                  {state.errors.scheduledOpenAt.join(" ")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="scheduledCloseAt" className="text-xs">
                Fermeture
              </Label>
              <Input
                id="scheduledCloseAt"
                name="scheduledCloseAt"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(defaultCloseAt)}
                required={mode === "SCHEDULED"}
              />
              {state.errors?.scheduledCloseAt && (
                <p className="text-xs text-destructive">
                  {state.errors.scheduledCloseAt.join(" ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
