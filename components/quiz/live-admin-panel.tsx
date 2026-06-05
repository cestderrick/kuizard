"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  startLiveAction,
  nextQuestionAction,
  togglePauseAction,
  finishLiveAction,
  resetLiveAction,
} from "@/lib/actions/live";

type Question = {
  id: string;
  order: number;
  text: string;
  type: string;
};

type LiveState = {
  status: string;
  currentQuestionIndex: number;
  isPaused: boolean;
  totalQuestions: number;
};

type Props = {
  quizId: string;
  code: string;
  title: string;
  questions: Question[];
  initialState: LiveState;
};

export function LiveAdminPanel({
  quizId,
  code,
  title,
  questions,
  initialState,
}: Props) {
  const [state, setState] = useState<LiveState>(initialState);
  const [connectedCount, setConnectedCount] = useState<number>(0);
  const esRef = useRef<EventSource | null>(null);

  // Pour le panel admin on s'abonne aussi au SSE pour voir les changements
  // d'état (utile si plusieurs onglets ouverts ou si on reset depuis ailleurs).
  useEffect(() => {
    const es = new EventSource(`/api/quiz/${code}/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === "state") {
          setState({
            status: payload.status,
            currentQuestionIndex: payload.currentQuestionIndex,
            isPaused: payload.isPaused,
            totalQuestions: payload.totalQuestions,
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [code]);

  // Compte de participants connectés (best effort via polling léger sur l'API)
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/quiz/${code}/connected`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setConnectedCount(data.count ?? 0);
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 4000);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const isWaiting = state.status === "PUBLISHED";
  const isRunning = state.status === "RUNNING";
  const isFinished = state.status === "FINISHED";

  const currentQuestion =
    isRunning && state.currentQuestionIndex >= 0
      ? questions[state.currentQuestionIndex]
      : null;

  const isLastQuestion =
    state.currentQuestionIndex === questions.length - 1;

  return (
    <div className="rounded-2xl bg-[var(--color-night)] text-[var(--color-lavender)] p-6 flex flex-col gap-6">
      {/* Header live */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg tracking-wide">
            🎩 Panel live
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              EN DIRECT
            </span>
          )}
          {isFinished && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-500/30 text-zinc-200 text-xs font-semibold">
              TERMINÉ
            </span>
          )}
          {isWaiting && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
              EN ATTENTE
            </span>
          )}
        </div>
        <div className="text-sm">
          👥 <strong>{connectedCount}</strong> participant
          {connectedCount > 1 ? "s" : ""} connecté{connectedCount > 1 ? "s" : ""}
        </div>
      </div>

      <div className="text-sm opacity-80">
        <p>
          Code public :{" "}
          <code className="font-mono bg-white/10 px-2 py-0.5 rounded">{code}</code>
        </p>
      </div>

      {/* Question courante */}
      <div className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-4 min-h-[120px]">
        {isWaiting && (
          <p className="text-center text-[var(--color-lavender-2)] opacity-70">
            En attente — clique sur <strong>Démarrer</strong> quand tous les
            joueurs sont connectés.
          </p>
        )}
        {isFinished && (
          <p className="text-center text-[var(--color-lavender-2)] opacity-70">
            Quizz terminé. Tu peux le réinitialiser pour le relancer.
          </p>
        )}
        {isRunning && currentQuestion && (
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
              Question {state.currentQuestionIndex + 1} / {questions.length}
            </p>
            <p className="font-display text-lg leading-snug">
              {currentQuestion.text}
            </p>
            {state.isPaused && (
              <p className="text-amber-300 text-sm">⏸️ Pause active</p>
            )}
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap gap-2">
        {isWaiting && (
          <form action={startLiveAction}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              size="lg"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-bold"
            >
              ▶ Démarrer le quizz
            </Button>
          </form>
        )}

        {isRunning && (
          <>
            <form action={togglePauseAction}>
              <input type="hidden" name="quizId" value={quizId} />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                {state.isPaused ? "▶ Reprendre" : "⏸ Pause"}
              </Button>
            </form>

            {!isLastQuestion ? (
              <form action={nextQuestionAction}>
                <input type="hidden" name="quizId" value={quizId} />
                <Button
                  type="submit"
                  size="lg"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                  className="font-bold"
                >
                  ➡ Question suivante
                </Button>
              </form>
            ) : (
              <form action={finishLiveAction}>
                <input type="hidden" name="quizId" value={quizId} />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  🏁 Terminer le quizz
                </Button>
              </form>
            )}

            <form action={finishLiveAction}>
              <input type="hidden" name="quizId" value={quizId} />
              <Button
                type="submit"
                variant="ghost"
                size="lg"
                className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
              >
                ⏹ Terminer maintenant
              </Button>
            </form>
          </>
        )}

        {isFinished && (
          <form action={resetLiveAction}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              ♻️ Réinitialiser (supprime les participations)
            </Button>
          </form>
        )}
      </div>

      <p className="text-xs text-[var(--color-lavender-2)] opacity-60">
        Garde cet onglet ouvert pendant la session live. Les participants
        scannent <code>kuizard.fr/q/{code}</code>.
      </p>
    </div>
  );
}
