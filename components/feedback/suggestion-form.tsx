"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  submitSuggestionAction,
  type SuggestionState,
} from "@/lib/actions/suggestion";

const initial: SuggestionState = { ok: false };

const CATEGORIES = [
  { value: "bug", label: "🐛 Un bug à signaler" },
  { value: "feature", label: "✨ Une idée de fonctionnalité" },
  { value: "design", label: "🎨 Un retour sur le design" },
  { value: "other", label: "💬 Autre" },
];

type Props = {
  defaultEmail?: string;
};

export function SuggestionForm({ defaultEmail }: Props) {
  const [state, formAction, isPending] = useActionState(
    submitSuggestionAction,
    initial
  );

  if (state.ok) {
    return (
      <div className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-8 text-center flex flex-col gap-4">
        <div className="text-5xl" aria-hidden>
          ✨
        </div>
        <h2
          className="font-display text-2xl tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Merci !
        </h2>
        <p className="text-muted-foreground">
          {state.message ??
            "Ta suggestion a bien été enregistrée. On la lit attentivement."}
        </p>
        <a
          href="/"
          className="inline-block mt-2 px-5 py-2 rounded-md font-semibold"
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-8 flex flex-col gap-5"
    >
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Catégorie</Label>
        <select
          id="category"
          name="category"
          defaultValue="feature"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Ta suggestion</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={4000}
          placeholder="Raconte-nous ! Bug, idée, retour, ce que tu veux. Plus c'est précis, plus on pourra agir."
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 resize-y"
        />
        {state.errors?.message && (
          <p className="text-sm text-destructive">
            {state.errors.message.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          Email (optionnel)
          <span className="text-muted-foreground font-normal ml-1">
            — pour qu'on puisse te répondre
          </span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultEmail ?? ""}
          placeholder="ton@email.fr"
        />
        {state.errors?.email && (
          <p className="text-sm text-destructive">
            {state.errors.email.join(" ")}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        style={{
          backgroundColor: "var(--color-violet-primary)",
          color: "white",
        }}
      >
        {isPending ? "Envoi…" : "Envoyer ma suggestion ✨"}
      </Button>
    </form>
  );
}
