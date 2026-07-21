"use client";

// V60.3 — Escape player public
// Gere le jeu cote joueur : affichage etape, submit reponse, unlock indices,
// chrono live, ecran de victoire.

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  submitEscapeAnswerAction,
  unlockHintAction,
  type SubmitEscapeAnswerState,
  type UnlockHintState,
} from "@/lib/actions/escape-play";

type Step = {
  id: string;
  order: number;
  type: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
  audioUrl: string | null;
  options: { label: string }[]; // sans isCorrect
  hintsCount: number;
  points: number;
};

type Props = {
  escapeId: string;
  escapeCode: string;
  escapeTitle: string;
  hintCostPoints: number;
  timerMinutes: number | null;
  startedAtIso: string | null; // startedAt de l'escape (ou team)
  totalSteps: number;
  currentStep: Step | null;   // null si termine
  team: {
    id: string;
    name: string;
    score: number;
    hintsUsed: number;
    currentStepOrder: number;
    finishedAt: string | null;
    /** Indices deja debloques sur l'etape courante */
    unlockedHintsCurrent: string[];
  };
};

const INITIAL_SUBMIT: SubmitEscapeAnswerState = { ok: false };
const INITIAL_HINT: UnlockHintState = { ok: false };

export function EscapePlayer(props: Props) {
  const { escapeId, escapeTitle, hintCostPoints, timerMinutes, startedAtIso, totalSteps, currentStep, team } = props;

  // -------- CHRONO --------
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedMs = startedAtIso
    ? Math.max(0, now - new Date(startedAtIso).getTime())
    : 0;
  const remainingMs = timerMinutes
    ? Math.max(0, timerMinutes * 60_000 - elapsedMs)
    : null;
  const timeExpired = remainingMs !== null && remainingMs === 0;

  function fmtTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // -------- SUBMIT REPONSE --------
  const [submitState, submitFormAction, submitPending] = useActionState(
    submitEscapeAnswerAction,
    INITIAL_SUBMIT
  );
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // Reset les inputs a chaque changement d'etape
  useEffect(() => {
    setTextAnswer("");
    setSelectedChoice(null);
  }, [currentStep?.id]);

  // Refresh apres bonne reponse (pour passer a l'etape suivante)
  useEffect(() => {
    if (submitState.ok && submitState.correct && !submitPending) {
      // On force un refresh de la page (server component re-render)
      setTimeout(() => window.location.reload(), 700);
    }
  }, [submitState, submitPending]);

  // -------- UNLOCK HINT --------
  const [hintState, hintFormAction, hintPending] = useActionState(
    unlockHintAction,
    INITIAL_HINT
  );

  useEffect(() => {
    if (hintState.ok && !hintPending) {
      setTimeout(() => window.location.reload(), 500);
    }
  }, [hintState, hintPending]);

  // -------- VICTOIRE --------
  if (team.finishedAt || !currentStep) {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-5 text-center py-10">
        <div className="text-6xl">🏆</div>
        <h1 className="font-display text-3xl">Escape termine !</h1>
        <p className="text-lg">
          Equipe <strong>{team.name}</strong>
        </p>
        <div className="rounded-2xl border p-6 bg-white">
          <p className="text-sm opacity-70 mb-1">Score final</p>
          <p className="font-display text-5xl" style={{ color: "var(--color-violet-primary)" }}>
            {team.score} pts
          </p>
          {team.hintsUsed > 0 && (
            <p className="text-xs opacity-60 mt-2">
              ({team.hintsUsed} indice{team.hintsUsed > 1 ? "s" : ""} utilise{team.hintsUsed > 1 ? "s" : ""})
            </p>
          )}
        </div>
        {startedAtIso && team.finishedAt && (
          <p className="text-sm opacity-70">
            Temps :{" "}
            <strong>
              {fmtTime(new Date(team.finishedAt).getTime() - new Date(startedAtIso).getTime())}
            </strong>
          </p>
        )}
        <a
          href={`/e/${props.escapeCode}/classement`}
          className="text-sm font-bold underline underline-offset-2"
          style={{ color: "var(--color-violet-primary)" }}
        >
          🏅 Voir le classement des equipes
        </a>
      </div>
    );
  }

  // -------- JEU EN COURS --------
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      {/* Header : titre + progression + chrono + score */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 backdrop-blur border p-3">
        <div className="min-w-0">
          <p className="text-xs opacity-70 truncate">{escapeTitle}</p>
          <p className="font-bold">
            Etape {currentStep.order} / {totalSteps}{" "}
            <span className="opacity-60 font-normal text-sm">
              · Equipe {team.name}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          {remainingMs !== null && (
            <p
              className={`font-mono text-lg font-bold ${timeExpired ? "text-red-600" : ""}`}
            >
              ⏱ {fmtTime(remainingMs)}
            </p>
          )}
          <p className="text-xs opacity-70">
            Score :{" "}
            <strong style={{ color: "var(--color-violet-primary)" }}>
              {team.score} pts
            </strong>
          </p>
        </div>
      </div>

      {timeExpired && (
        <div className="rounded-lg p-3 bg-red-50 border border-red-200 text-red-900 text-sm">
          ⏱ Temps ecoule ! Tu peux toujours tenter les etapes restantes, mais
          l&apos;organisateur decidera si le score est valide.
        </div>
      )}

      {/* Enonce de l'etape */}
      <div className="rounded-2xl bg-white border p-5 flex flex-col gap-3">
        {currentStep.title && (
          <h2 className="font-display text-xl" style={{ color: "var(--color-violet-primary)" }}>
            {currentStep.title}
          </h2>
        )}
        {currentStep.imageUrl && (
          <img
            src={currentStep.imageUrl}
            alt=""
            className="rounded-lg max-h-72 object-contain mx-auto"
          />
        )}
        {currentStep.audioUrl && (
          <audio controls src={currentStep.audioUrl} className="w-full" />
        )}
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {currentStep.body}
        </p>
      </div>

      {/* Feedback derniere reponse */}
      {submitState.message && (
        <div
          className={`rounded-lg p-3 text-sm font-semibold ${
            submitState.correct
              ? "bg-green-50 border border-green-300 text-green-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          {submitState.correct ? "✅ " : "❌ "}
          {submitState.message}
        </div>
      )}

      {/* Form reponse */}
      <form action={submitFormAction} className="flex flex-col gap-3">
        <input type="hidden" name="escapeId" value={escapeId} />
        <input type="hidden" name="stepId" value={currentStep.id} />
        {selectedChoice !== null && (
          <input type="hidden" name="selectedIndex" value={selectedChoice} />
        )}

        {currentStep.type === "CHOICE" ? (
          <div className="flex flex-col gap-2">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedChoice(i)}
                className={`text-left rounded-lg border-2 p-3 transition ${
                  selectedChoice === i
                    ? "border-violet-500 bg-violet-50"
                    : "border-zinc-200 bg-white hover:border-violet-300"
                }`}
              >
                <span className="font-bold mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="userAnswer" className="text-sm font-semibold">
              Ta reponse
            </label>
            <Input
              id="userAnswer"
              name="userAnswer"
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Tape ta reponse..."
              required
              maxLength={500}
              autoComplete="off"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              submitPending ||
              (currentStep.type === "CHOICE" && selectedChoice === null) ||
              (currentStep.type !== "CHOICE" && textAnswer.trim().length === 0)
            }
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            {submitPending ? "Envoi..." : "Valider la reponse"}
          </Button>
        </div>
      </form>

      {/* Indices */}
      {currentStep.hintsCount > 0 && (
        <div className="rounded-2xl border p-4 bg-amber-50/50">
          <p className="font-semibold text-sm mb-2">
            💡 Indices ({team.unlockedHintsCurrent.length}/{currentStep.hintsCount})
          </p>
          {team.unlockedHintsCurrent.map((h, i) => (
            <p
              key={i}
              className="text-sm italic mb-1.5 pl-3 border-l-2 border-amber-400"
            >
              {h}
            </p>
          ))}
          {team.unlockedHintsCurrent.length < currentStep.hintsCount && (
            <form action={hintFormAction} className="mt-2">
              <input type="hidden" name="escapeId" value={escapeId} />
              <input type="hidden" name="stepId" value={currentStep.id} />
              <button
                type="submit"
                disabled={hintPending}
                className="text-xs font-bold px-3 py-1.5 rounded-md border-2 border-amber-400 hover:bg-amber-100 transition disabled:opacity-50"
              >
                {hintPending
                  ? "..."
                  : `🔓 Debloquer indice ${team.unlockedHintsCurrent.length + 1} (-${hintCostPoints} pts)`}
              </button>
            </form>
          )}
          {hintState.message && !hintState.ok && (
            <p className="text-xs text-red-700 mt-2">{hintState.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
