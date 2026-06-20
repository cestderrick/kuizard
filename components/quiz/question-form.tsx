"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateQuestionAction,
  type UpdateQuestionState,
} from "@/lib/actions/question";
import {
  uploadQuestionImageAction,
  removeQuestionImageAction,
  setQuestionImageFromUrlAction,
} from "@/lib/actions/upload";
import { ImageUploader } from "@/components/quiz/image-uploader";
import { useActionToast } from "@/lib/hooks/use-action-toast";

type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "TEXT";

type Option = { label: string; isCorrect: boolean };

type Props = {
  quizId: string;
  question: {
    id: string;
    type: string;
    text: string;
    points: number;
    timerSeconds: number | null;
    options: unknown; // venant de Prisma JSONB
    imageUrl: string | null;
    order?: number;
  };
  /** V43 : si le plan ne permet pas les images, on grise la zone + CTA upgrade */
  allowImages?: boolean;
  /** Nom du plan courant pour le message de gating */
  planName?: string;
  /** V47.4 : true si la question est hors limite du plan (ex: 6e sur free=5max) */
  isBeyondPlanLimit?: boolean;
  /** Limite du plan courant */
  maxQuestions?: number;
};

const initialState: UpdateQuestionState = { ok: false };

function parseInitialOptions(raw: unknown): Option[] {
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

export function QuestionForm({
  quizId,
  question,
  allowImages = true,
  planName,
  isBeyondPlanLimit = false,
  maxQuestions,
}: Props) {
  const [type, setType] = useState<QuestionType>(question.type as QuestionType);

  // Options gérées en state pour le côté dynamique (ajout/suppression)
  const [options, setOptions] = useState<Option[]>(() => {
    const parsed = parseInitialOptions(question.options);
    // Si on bascule de type, on ré-initialise si nécessaire
    if (parsed.length === 0) {
      if (type === "TRUE_FALSE") {
        return [
          { label: "Vrai", isCorrect: true },
          { label: "Faux", isCorrect: false },
        ];
      }
      if (type === "TEXT") return [{ label: "", isCorrect: true }];
      return [
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
      ];
    }
    return parsed;
  });

  const [state, formAction, isPending] = useActionState(
    updateQuestionAction,
    initialState
  );
  useActionToast(state);

  // Quand l'utilisateur change le type, on adapte les options
  function handleTypeChange(newType: QuestionType) {
    setType(newType);
    if (newType === "TRUE_FALSE") {
      setOptions([
        { label: "Vrai", isCorrect: true },
        { label: "Faux", isCorrect: false },
      ]);
    } else if (newType === "TEXT") {
      setOptions([{ label: "", isCorrect: true }]);
    } else {
      // SINGLE_CHOICE ou MULTIPLE_CHOICE
      setOptions((prev) => {
        if (prev.length >= 2) return prev;
        return [
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
        ];
      });
    }
  }

  function updateOptionLabel(index: number, label: string) {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, label } : o))
    );
  }

  function toggleOptionCorrect(index: number) {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
          // Une seule peut être correcte
          return { ...o, isCorrect: i === index };
        }
        // MULTIPLE_CHOICE
        if (i === index) return { ...o, isCorrect: !o.isCorrect };
        return o;
      })
    );
  }

  function addOption() {
    setOptions((prev) =>
      prev.length < 8 ? [...prev, { label: "", isCorrect: false }] : prev
    );
  }

  function removeOption(index: number) {
    setOptions((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="optionsJson" value={JSON.stringify(options)} />

      {/* V47.4 : Bandeau si question hors limite du plan */}
      {isBeyondPlanLimit && (
        <div
          className="rounded-xl border-2 p-4 flex items-start gap-3"
          style={{
            borderColor: "rgba(245,158,11,0.4)",
            backgroundColor: "rgba(245,158,11,0.08)",
          }}
        >
          <span className="text-2xl shrink-0" aria-hidden>🔒</span>
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm mb-1"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Question hors limite de ton plan
            </p>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              Cette question est la #{question.order ?? "?"}
              {maxQuestions ? ` sur les ${maxQuestions} autorisées` : ""} par
              ton plan{planName ? ` « ${planName} »` : ""}.{" "}
              <strong>Tu peux la visualiser mais pas l\'enregistrer.</strong>{" "}
              Pour la débloquer, passe à un plan supérieur.
            </p>
            <a
              href="/tarifs"
              className="inline-block text-xs font-bold underline-offset-2 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              Voir les plans qui débloquent les questions au-delà →
            </a>
          </div>
        </div>
      )}

      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Type de question */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type de question</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="SINGLE_CHOICE">QCM — choix unique</option>
          <option value="MULTIPLE_CHOICE">QCM — choix multiples</option>
          <option value="TRUE_FALSE" disabled>
            Vrai / Faux — fonctionnalité à venir
          </option>
          <option value="TEXT" disabled>
            Réponse texte libre — fonctionnalité à venir
          </option>
        </select>
        {type === "MULTIPLE_CHOICE" && (
          <p
            className="text-xs mt-1 rounded-md px-2 py-1.5"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              color: "var(--color-violet-deep)",
            }}
          >
            ⚠️ <strong>QCM choix multiples</strong> : le joueur doit cocher
            <strong> exactement</strong> toutes les bonnes réponses (ni plus,
            ni moins) pour gagner les points. Pas de score partiel.
          </p>
        )}
      </div>

      {/* Image (optionnelle) */}
      <div className="flex flex-col gap-2">
        <Label>Image (optionnel)</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          L'image sera affichée au-dessus du texte de la question.
        </p>
        <ImageUploader
          currentUrl={question.imageUrl}
          uploadAction={uploadQuestionImageAction}
          removeAction={removeQuestionImageAction}
          setFromUrlAction={setQuestionImageFromUrlAction}
          hiddenFields={{ quizId, questionId: question.id }}
          emptyLabel="Glisse une image ou clique pour parcourir"
          previewHeightClass="h-40"
          disabledMessage={
            allowImages
              ? null
              : `Les photos sur les questions ne sont pas incluses dans ton plan${planName ? " \"" + planName + "\"" : ""}. Passe à un plan supérieur pour les activer.`
          }
        />
      </div>

      {/* Texte de la question */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="text">Question</Label>
        <textarea
          id="text"
          name="text"
          required
          rows={2}
          maxLength={500}
          defaultValue={question.text}
          placeholder="ex : Quelle est la capitale de la France ?"
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 resize-none"
        />
        {state.errors?.text && (
          <p className="text-sm text-destructive">
            {state.errors.text.join(" ")}
          </p>
        )}
      </div>

      {/* Options selon le type */}
      <div className="flex flex-col gap-3">
        <Label>
          {type === "TEXT" ? "Réponse attendue" : "Réponses possibles"}
        </Label>

        {type === "TEXT" ? (
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              value={options[0]?.label ?? ""}
              onChange={(e) => updateOptionLabel(0, e.target.value)}
              placeholder="ex : Paris"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              La comparaison est insensible à la casse et aux accents.
            </p>
          </div>
        ) : (
          <>
            {options.map((opt, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border p-2"
                style={{
                  borderColor: opt.isCorrect
                    ? "var(--color-gold)"
                    : undefined,
                  backgroundColor: opt.isCorrect ? "#fffbeb" : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleOptionCorrect(index)}
                  className="w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: opt.isCorrect
                      ? "var(--color-gold)"
                      : "#d4d4d8",
                    backgroundColor: opt.isCorrect
                      ? "var(--color-gold)"
                      : "white",
                    color: opt.isCorrect ? "white" : "#71717a",
                  }}
                  aria-label={
                    opt.isCorrect
                      ? "Bonne réponse"
                      : "Marquer comme bonne réponse"
                  }
                  title={
                    type === "SINGLE_CHOICE" || type === "TRUE_FALSE"
                      ? "Une seule bonne réponse"
                      : "Plusieurs bonnes réponses possibles"
                  }
                >
                  {opt.isCorrect ? "✓" : ""}
                </button>
                <Input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOptionLabel(index, e.target.value)}
                  placeholder={`ex : Réponse ${String.fromCharCode(65 + index)}`}
                  maxLength={200}
                  disabled={type === "TRUE_FALSE"}
                  className="flex-1"
                />
                {type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE" ? (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded disabled:opacity-30"
                    title={
                      options.length <= 2
                        ? "Il faut au moins 2 réponses"
                        : "Supprimer"
                    }
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}

            {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") &&
              options.length < 8 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="rounded-lg border-2 border-dashed border-[var(--color-violet-light)] px-3 py-2 text-sm font-medium text-[var(--color-violet-primary)] hover:bg-[var(--color-lavender)]"
                >
                  + Ajouter une réponse
                </button>
              )}

            <p className="text-xs text-muted-foreground">
              {type === "SINGLE_CHOICE"
                ? "Clique sur le carré à gauche pour marquer la bonne réponse."
                : type === "MULTIPLE_CHOICE"
                ? "Clique sur les carrés à gauche pour marquer les bonnes réponses."
                : "Marque laquelle des deux réponses est correcte."}
            </p>
          </>
        )}
      </div>

      {/* Points + timer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            name="points"
            type="number"
            min={0}
            max={100}
            defaultValue={question.points}
          />
          {state.errors?.points && (
            <p className="text-sm text-destructive">
              {state.errors.points.join(" ")}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="timerSeconds">
            Timer (secondes, optionnel)
          </Label>
          <Input
            id="timerSeconds"
            name="timerSeconds"
            type="number"
            min={5}
            max={300}
            defaultValue={question.timerSeconds ?? ""}
            placeholder="ex : 30"
          />
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending || isBeyondPlanLimit}
          style={{
            backgroundColor: isBeyondPlanLimit
              ? "var(--color-muted, #94a3b8)"
              : "var(--color-violet-primary)",
            color: "white",
            cursor: isBeyondPlanLimit ? "not-allowed" : undefined,
          }}
          title={
            isBeyondPlanLimit
              ? "Question hors limite de ton plan — upgrade requis"
              : undefined
          }
        >
          {isBeyondPlanLimit
            ? "🔒 Hors limite plan"
            : isPending
            ? "Enregistrement…"
            : "Enregistrer la question ✨"}
        </Button>
      </div>
    </form>
  );
}
