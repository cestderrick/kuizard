"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateThemeAction,
  type UpdateThemeState,
} from "@/lib/actions/quiz";
import { DEFAULT_THEME, type QuizTheme } from "@/lib/quiz/theme";

const PRESETS: { name: string; color: string; emoji: string }[] = [
  { name: "Magicien", color: "#6B46C1", emoji: "🎩" },
  { name: "Mariage", color: "#EC4899", emoji: "💗" },
  { name: "Anniversaire", color: "#F59E0B", emoji: "🎂" },
  { name: "Bar / Pro", color: "#0EA5E9", emoji: "🍻" },
  { name: "Nature", color: "#16A34A", emoji: "🌿" },
  { name: "Nuit", color: "#1F1B3A", emoji: "🌌" },
];

const initial: UpdateThemeState = { ok: false };

type Props = {
  quizId: string;
  defaultTheme: QuizTheme;
};

export function ThemeEditor({ quizId, defaultTheme }: Props) {
  const [primary, setPrimary] = useState(defaultTheme.primaryColor);
  const [background, setBackground] = useState<"night" | "light">(
    defaultTheme.background
  );

  const [state, formAction, isPending] = useActionState(
    updateThemeAction,
    initial
  );

  function reset() {
    setPrimary(DEFAULT_THEME.primaryColor);
    setBackground(DEFAULT_THEME.background);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="primaryColor" value={primary} />
      <input type="hidden" name="background" value={background} />

      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Aperçu */}
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background:
            background === "night"
              ? "linear-gradient(160deg, #0F0A2E 0%, #1F1B3A 100%)"
              : "linear-gradient(160deg, #FAF7FF 0%, #E9D5FF 100%)",
          color: background === "night" ? "#FAF7FF" : "#1F1B3A",
        }}
      >
        <p
          className="text-xs uppercase tracking-[3px] font-semibold mb-2"
          style={{ color: primary }}
        >
          ✨ Aperçu
        </p>
        <h3 className="font-display text-2xl mb-3 tracking-wide">
          Mon quizz magique
        </h3>
        <div
          className="inline-block px-5 py-2 rounded-md font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          Commencer ✨
        </div>
      </div>

      {/* Presets */}
      <div>
        <Label className="mb-2 block">Presets</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => setPrimary(p.color)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border hover:shadow-md transition-shadow"
              style={{
                borderColor: primary === p.color ? p.color : "#e4e4e7",
                backgroundColor: primary === p.color ? `${p.color}10` : "white",
                outline:
                  primary === p.color ? `2px solid ${p.color}` : undefined,
              }}
              title={p.name}
            >
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
              <span
                className="block w-full h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Couleur custom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="customColor">Couleur principale</Label>
          <div className="flex items-center gap-2">
            <input
              id="customColor"
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-12 h-10 rounded-md border cursor-pointer"
            />
            <input
              type="text"
              value={primary}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
                  setPrimary(v.startsWith("#") ? v : `#${v}`);
                }
              }}
              maxLength={7}
              className="font-mono text-sm border rounded-md px-3 py-2 w-32"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="background">Ambiance de fond</Label>
          <select
            id="background"
            value={background}
            onChange={(e) =>
              setBackground(e.target.value as "night" | "light")
            }
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="night">🌌 Nuit étoilée (par défaut)</option>
            <option value="light">☀️ Clair lavande</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          className="text-sm"
        >
          Réinitialiser au défaut
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          {isPending ? "Enregistrement…" : "Enregistrer le thème"}
        </Button>
      </div>
    </form>
  );
}
