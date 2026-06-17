"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  startLiveAction,
  nextQuestionAction,
  togglePauseAction,
  finishLiveAction,
  resetLiveAction,
} from "@/lib/actions/live";

type OptionCount = { label: string; count: number; isCorrect: boolean };
type LiveStats = {
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  currentDistribution: {
    questionId: string | null;
    type: string | null;
    counts: OptionCount[];
    answeredCount: number;
  };
};

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
  const router = useRouter();
  const [state, setState] = useState<LiveState>(initialState);
  const [connectedCount, setConnectedCount] = useState<number>(0);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [, startTransition] = useTransition();
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

  // 🛟 FALLBACK polling sur /state pour blinder contre nginx qui couperait le
  // SSE — sans ça, après "Démarrer" ou "Suivante", l'admin devait F5.
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch(`/api/quiz/${code}/state`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setState((prev) => {
              if (
                prev.status === data.status &&
                prev.currentQuestionIndex === data.currentQuestionIndex &&
                prev.isPaused === data.isPaused
              ) {
                return prev;
              }
              return {
                status: data.status,
                currentQuestionIndex: data.currentQuestionIndex,
                isPaused: data.isPaused,
                totalQuestions: data.totalQuestions,
              };
            });
          }
        }
      } catch {}
      if (!cancelled) setTimeout(tick, 1500);
    }
    tick();
    return () => {
      cancelled = true;
    };
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

  // Résultats en direct (distribution des réponses) — poll toutes les 2s
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/quiz/${code}/live-stats`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setLiveStats({
              totalParticipants: data.totalParticipants ?? 0,
              activeParticipants: data.activeParticipants ?? 0,
              completedParticipants: data.completedParticipants ?? 0,
              currentDistribution: data.currentDistribution ?? {
                questionId: null,
                type: null,
                counts: [],
                answeredCount: 0,
              },
            });
          }
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 2000);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [code]);

  /**
   * Wrap les server actions : après le succès, on force un router.refresh()
   * pour que le panel se re-rende avec les données serveur fraîches en plus
   * du SSE/polling client.
   */
  function withRefresh(action: (fd: FormData) => Promise<unknown>) {
    return async (fd: FormData) => {
      await action(fd);
      startTransition(() => router.refresh());
    };
  }

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

      {/* Résultats en direct (distribution des réponses) */}
      {isRunning && liveStats && liveStats.currentDistribution.counts.length > 0 && (
        <div className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
              📊 Résultats en direct
            </p>
            <p className="text-xs opacity-70">
              {liveStats.currentDistribution.answeredCount} /{" "}
              {liveStats.totalParticipants} ont répondu
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {liveStats.currentDistribution.counts.map((c, i) => {
              const total = Math.max(
                1,
                liveStats.currentDistribution.answeredCount
              );
              const pct = Math.round((c.count / total) * 100);
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-bold">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{c.label}</span>
                      {c.isCorrect && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: "rgba(16,185,129,0.2)",
                            color: "#34d399",
                          }}
                        >
                          ✓ correcte
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs opacity-80">
                      {c.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: c.isCorrect ? "#10B981" : "#a78bfa",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div className="flex flex-wrap gap-2">
        {isWaiting && (
          <form action={withRefresh(startLiveAction)}>
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
            <form action={withRefresh(togglePauseAction)}>
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
              <form action={withRefresh(nextQuestionAction)}>
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
              <form action={withRefresh(finishLiveAction)}>
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

            <form action={withRefresh(finishLiveAction)}>
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
          <form action={withRefresh(resetLiveAction)}>
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
