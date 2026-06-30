"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  updateQuizMetaAction,
  type UpdateQuizMetaState,
} from "@/lib/actions/quiz";
// V56 — Suggestion IA pour la description du quiz
import { suggestQuizDescriptionAction } from "@/lib/actions/ai/suggest-quiz-description";
import { useActionToast } from "@/lib/hooks/use-action-toast";

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
 * (format : "YYYY-MM-DDTHH:mm", heure locale du navigateur).
 */
function toDatetimeLocalValue(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Convertit une string datetime-local (interprétée en heure locale du
 * navigateur) en ISO UTC pour envoi au server.
 * ⚠️ Sans ça, le serveur en UTC interprète "15:15" comme 15:15 UTC = 17:15
 * heure de Paris → décalage de +2 h.
 */
function localStringToIso(local: string): string {
  if (!local) return "";
  return new Date(local).toISOString();
}

export function QuizMetaForm({
  quizId,
  defaultTitle,
  defaultDescription,
  defaultMode,
  defaultOpenAt,
  defaultCloseAt,
}: Props) {
  // V56 — On rend le titre et la description controles pour pouvoir
  // (a) envoyer le draft du titre a l'IA, (b) injecter le texte suggere.
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription ?? "");
  const titleRef = useRef(defaultTitle);
  titleRef.current = title;
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSuggesting, startSuggest] = useTransition();

  const [mode, setMode] = useState<"LIVE_MANUAL" | "SCHEDULED">(defaultMode);
  const [openLocal, setOpenLocal] = useState(
    toDatetimeLocalValue(defaultOpenAt)
  );
  const [closeLocal, setCloseLocal] = useState(
    toDatetimeLocalValue(defaultCloseAt)
  );

  // 🔄 Sync avec les nouvelles props quand la page revalide après save.
  // Sans ça, après modif des dates, le mode revenait sur "live" en affichage
  // alors qu'il était bien SCHEDULED en BDD.
  // V56 : resync title/description si les props changent (apres save)
  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);
  useEffect(() => {
    setDescription(defaultDescription ?? "");
  }, [defaultDescription]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);
  useEffect(() => {
    setOpenLocal(toDatetimeLocalValue(defaultOpenAt));
  }, [defaultOpenAt]);
  useEffect(() => {
    setCloseLocal(toDatetimeLocalValue(defaultCloseAt));
  }, [defaultCloseAt]);

  const [state, formAction, isPending] = useActionState(
    updateQuizMetaAction,
    initialState
  );

  // V30.3 : router.refresh() après save ok pour forcer le re-render serveur
  // (sinon defaultMode reste figé et le useEffect remet le mode local à l'ancien)
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="quizId" value={quizId} />
      {/* Hidden inputs des dates au format ISO (UTC) — c'est ce que le server
          reçoit. Les <input type="datetime-local"> ci-dessous sont juste pour
          l'UX (affichage en heure locale). */}
      <input
        type="hidden"
        name="scheduledOpenAt"
        value={mode === "SCHEDULED" ? localStringToIso(openLocal) : ""}
      />
      <input
        type="hidden"
        name="scheduledCloseAt"
        value={mode === "SCHEDULED" ? localStringToIso(closeLocal) : ""}
      />

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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">
            {state.errors.title.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          {/* V56 — Bouton de suggestion IA. Le clic envoie titre+quizId a
              une server action Groq et remplace le contenu du textarea. */}
          <button
            type="button"
            disabled={isSuggesting || title.trim().length < 3}
            onClick={() => {
              setAiError(null);
              startSuggest(async () => {
                const fd = new FormData();
                fd.set("quizId", quizId);
                fd.set("draftTitle", titleRef.current);
                const res = await suggestQuizDescriptionAction(
                  { ok: false, error: "" },
                  fd
                );
                if (res.ok) {
                  setDescription(res.description);
                } else {
                  setAiError(res.error);
                }
              });
            }}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #5523bb, #f59e0b)",
              color: "white",
            }}
            title={
              title.trim().length < 3
                ? "Renseigne d'abord un titre pour activer la suggestion"
                : "Generer une description avec l'IA (a partir du titre + premieres questions)"
            }
          >
            {isSuggesting ? "Generation…" : "✨ Suggérer avec IA"}
          </button>
        </div>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quelques mots pour annoncer le quizz aux participants…"
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 resize-none"
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          {state.errors?.description ? (
            <p className="text-destructive">
              {state.errors.description.join(" ")}
            </p>
          ) : aiError ? (
            <p className="text-destructive">{aiError}</p>
          ) : (
            <span className="text-muted-foreground opacity-70">
              💡 L'IA peut t'aider — clique sur « Suggérer avec IA » au-dessus.
            </span>
          )}
          <span className="text-muted-foreground opacity-60">
            {description.length}/500
          </span>
        </div>
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
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-violet-deep)" }}
          >
            ⏰ Créneau d'ouverture
          </p>
          <p className="text-xs text-muted-foreground">
            Le quizz sera accessible aux participants uniquement entre ces deux
            dates. Avant : compte à rebours. Après : classement final figé.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="scheduledOpenAtLocal" className="text-xs">
                Ouverture
              </Label>
              <Input
                id="scheduledOpenAtLocal"
                type="datetime-local"
                value={openLocal}
                onChange={(e) => setOpenLocal(e.target.value)}
                required={mode === "SCHEDULED"}
              />
              {state.errors?.scheduledOpenAt && (
                <p className="text-xs text-destructive">
                  {state.errors.scheduledOpenAt.join(" ")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="scheduledCloseAtLocal" className="text-xs">
                Fermeture
              </Label>
              <Input
                id="scheduledCloseAtLocal"
                type="datetime-local"
                value={closeLocal}
                onChange={(e) => setCloseLocal(e.target.value)}
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
