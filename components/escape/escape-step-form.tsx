"use client";

// V60.2 — Formulaire d'edition d'une etape d'escape

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateEscapeStepAction,
  type UpdateEscapeStepState,
} from "@/lib/actions/escape";
// V60.5b — Upload image/audio pour l'etape
import {
  uploadEscapeStepImageAction,
  removeEscapeStepImageAction,
  setEscapeStepImageFromUrlAction,
  uploadEscapeStepAudioAction,
  removeEscapeStepAudioAction,
} from "@/lib/actions/upload";
import { ImageUploader } from "@/components/quiz/image-uploader";
import { EscapeAudioUploader } from "@/components/escape/escape-audio-uploader";

type StepType = "TEXT" | "CHOICE" | "IMAGE" | "AUDIO";
type Option = { label: string; isCorrect: boolean };

type Props = {
  escapeId: string;
  step: {
    id: string;
    type: string;
    title: string | null;
    body: string;
    expectedAnswer: string | null;
    options: unknown;
    hints: unknown;
    points: number;
    // V60.5b — media
    imageUrl?: string | null;
    audioUrl?: string | null;
  };
};

const INITIAL: UpdateEscapeStepState = { ok: false };

function parseOptions(raw: unknown): Option[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (o): o is Option =>
        typeof o === "object" &&
        o !== null &&
        typeof (o as Option).label === "string" &&
        typeof (o as Option).isCorrect === "boolean"
    )
    .map((o) => ({ label: o.label, isCorrect: o.isCorrect }));
}

function parseHints(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((h): h is string => typeof h === "string");
}

export function EscapeStepForm({ escapeId, step }: Props) {
  const [type, setType] = useState<StepType>(step.type as StepType);
  const [options, setOptions] = useState<Option[]>(() => {
    const p = parseOptions(step.options);
    return p.length > 0
      ? p
      : [
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
        ];
  });
  const [hints, setHints] = useState<string[]>(() => parseHints(step.hints));

  const [state, formAction, isPending] = useActionState(
    updateEscapeStepAction,
    INITIAL
  );

  function updateOptionLabel(i: number, label: string) {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, label } : o))
    );
  }
  function toggleOptionCorrect(i: number) {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, isCorrect: !o.isCorrect } : o))
    );
  }
  function addOption() {
    setOptions((prev) =>
      prev.length < 8 ? [...prev, { label: "", isCorrect: false }] : prev
    );
  }
  function removeOption(i: number) {
    setOptions((prev) =>
      prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev
    );
  }

  function updateHint(i: number, value: string) {
    setHints((prev) => prev.map((h, idx) => (idx === i ? value : h)));
  }
  function addHint() {
    setHints((prev) => (prev.length < 5 ? [...prev, ""] : prev));
  }
  function removeHint(i: number) {
    setHints((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="escapeId" value={escapeId} />
      <input type="hidden" name="stepId" value={step.id} />
      <input type="hidden" name="optionsJson" value={JSON.stringify(options)} />
      <input
        type="hidden"
        name="hintsJson"
        value={JSON.stringify(hints.filter((h) => h.trim().length > 0))}
      />

      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Type */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type d&apos;enigme</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as StepType)}
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
        >
          <option value="TEXT">📝 Réponse texte libre</option>
          <option value="CHOICE">☑️ Choix multiples</option>
          <option value="IMAGE" disabled>
            🖼️ Image + réponse (à venir)
          </option>
          <option value="AUDIO" disabled>
            🔊 Audio + réponse (à venir)
          </option>
        </select>
      </div>

      {/* Titre optionnel */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre de l&apos;énigme (optionnel)</Label>
        <Input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          defaultValue={step.title ?? ""}
          placeholder="ex : Le mystère de la clé perdue"
        />
      </div>

      {/* V60.5b — Media (image + audio) */}
      <div className="flex flex-col gap-3 rounded-xl border p-3 bg-violet-50/30">
        <p className="text-xs uppercase tracking-widest opacity-70 font-semibold">
          🎬 Media (optionnel)
        </p>

        <div>
          <Label className="text-xs">Image d&apos;illustration</Label>
          <div className="mt-1">
            <ImageUploader
              currentUrl={step.imageUrl ?? null}
              uploadAction={uploadEscapeStepImageAction}
              removeAction={removeEscapeStepImageAction}
              setFromUrlAction={setEscapeStepImageFromUrlAction}
              hiddenFields={{ escapeId, stepId: step.id }}
              emptyLabel="Glisse une image ou clique pour parcourir"
              previewHeightClass="h-32"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Audio (mp3, wav, ogg — 20 Mo max)</Label>
          <div className="mt-1">
            <EscapeAudioUploader
              escapeId={escapeId}
              stepId={step.id}
              currentUrl={step.audioUrl ?? null}
            />
          </div>
        </div>
      </div>

      {/* Enonce */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Énoncé de l&apos;énigme *</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          maxLength={2000}
          defaultValue={step.body}
          placeholder="Ecris ici le texte que verront les joueurs..."
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs resize-y min-h-[100px]"
        />
        {state.errors?.body && (
          <p className="text-sm text-destructive">
            {state.errors.body.join(" ")}
          </p>
        )}
      </div>

      {/* Reponse attendue ou options selon type */}
      {type === "CHOICE" ? (
        <div className="flex flex-col gap-3">
          <Label>Réponses possibles</Label>
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border p-2"
              style={
                opt.isCorrect
                  ? {
                      borderColor: "var(--color-gold)",
                      backgroundColor: "#fffbeb",
                    }
                  : undefined
              }
            >
              <button
                type="button"
                onClick={() => toggleOptionCorrect(i)}
                className="w-7 h-7 rounded-md border flex items-center justify-center"
                style={{
                  borderColor: opt.isCorrect
                    ? "var(--color-gold)"
                    : "#d4d4d8",
                  backgroundColor: opt.isCorrect ? "var(--color-gold)" : "white",
                  color: opt.isCorrect ? "white" : "#71717a",
                }}
                aria-label={
                  opt.isCorrect ? "Bonne reponse" : "Marquer comme bonne"
                }
              >
                {opt.isCorrect ? "✓" : ""}
              </button>
              <Input
                type="text"
                value={opt.label}
                onChange={(e) => updateOptionLabel(i, e.target.value)}
                placeholder={`Réponse ${String.fromCharCode(65 + i)}`}
                maxLength={200}
                className="flex-1"
                style={
                  opt.isCorrect
                    ? {
                        color: "#1a0e3a",
                        WebkitTextFillColor: "#1a0e3a",
                        backgroundColor: "transparent",
                      }
                    : undefined
                }
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                className="px-2 text-xs text-destructive hover:bg-destructive/10 rounded disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
          {options.length < 8 && (
            <button
              type="button"
              onClick={addOption}
              className="self-start rounded-lg border-2 border-dashed border-violet-200 px-3 py-2 text-sm font-medium text-[var(--color-violet-primary)] hover:bg-violet-50"
            >
              + Ajouter une réponse
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="expectedAnswer">Réponse attendue *</Label>
          <Input
            id="expectedAnswer"
            name="expectedAnswer"
            type="text"
            maxLength={500}
            defaultValue={step.expectedAnswer ?? ""}
            placeholder="ex : cle rouge"
          />
          <p className="text-xs text-muted-foreground -mt-1">
            La comparaison est insensible à la casse et aux accents.
          </p>
        </div>
      )}

      {/* Indices */}
      <div className="flex flex-col gap-3">
        <Label>Indices déblocables (optionnel)</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Les équipes peuvent débloquer ces indices en séquence si elles bloquent.
          Chaque indice coûte des points (voir réglages de l&apos;escape).
        </p>
        {hints.map((hint, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs opacity-70 w-6">#{i + 1}</span>
            <Input
              type="text"
              value={hint}
              onChange={(e) => updateHint(i, e.target.value)}
              maxLength={300}
              placeholder={`Indice ${i + 1}...`}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeHint(i)}
              className="text-xs text-destructive hover:bg-destructive/10 rounded px-2 py-1"
            >
              ✕
            </button>
          </div>
        ))}
        {hints.length < 5 && (
          <button
            type="button"
            onClick={addHint}
            className="self-start text-xs px-3 py-1.5 rounded-md border border-violet-200 text-[var(--color-violet-primary)] hover:bg-violet-50"
          >
            + Ajouter un indice
          </button>
        )}
      </div>

      {/* Points */}
      <div className="flex flex-col gap-2 max-w-xs">
        <Label htmlFor="points">Points de base pour cette étape</Label>
        <Input
          id="points"
          name="points"
          type="number"
          min={0}
          max={1000}
          defaultValue={step.points}
        />
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
          {isPending ? "Enregistrement..." : "Enregistrer l'étape ✨"}
        </Button>
      </div>
    </form>
  );
}
