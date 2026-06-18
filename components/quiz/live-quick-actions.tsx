"use client";

// =============================================
// LiveQuickActions — version compacte du panel live
// =============================================
// Intégrée directement dans les cards de la liste "Mes quizz". Permet de
// démarrer/avancer/terminer un quizz LIVE_MANUAL sans avoir à aller sur la
// page de pilotage. Synchronisée via SSE + polling /state.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  startLiveAction,
  nextQuestionAction,
  finishLiveAction,
  resetLiveAction,
} from "@/lib/actions/live";

type LiveState = {
  status: string;
  currentQuestionIndex: number;
  isPaused: boolean;
  totalQuestions: number;
};

type Props = {
  quizId: string;
  code: string;
  initialState: LiveState;
};

export function LiveQuickActions({ quizId, code, initialState }: Props) {
  const router = useRouter();
  const [state, setState] = useState<LiveState>(initialState);
  const [, startTransition] = useTransition();
  const esRef = useRef<EventSource | null>(null);

  // SSE pour la sync temps réel
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

  // Polling /state toutes les 3s (fallback si SSE coupé)
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
      if (!cancelled) setTimeout(tick, 3000);
    }
    tick();
    return () => {
      cancelled = true;
    };
  }, [code]);

  function withRefresh(action: (fd: FormData) => Promise<unknown>) {
    return async (fd: FormData) => {
      await action(fd);
      startTransition(() => router.refresh());
    };
  }

  const isWaiting = state.status === "PUBLISHED" || state.status === "DRAFT";
  const isRunning = state.status === "RUNNING";
  const isFinished = state.status === "FINISHED";
  const isLastQuestion =
    state.currentQuestionIndex === state.totalQuestions - 1;

  return (
    <div className="rounded-lg border border-[var(--color-gold)]/30 bg-gradient-to-br from-[rgba(85,35,187,0.06)] to-[rgba(245,158,11,0.06)] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[2px] font-bold flex items-center gap-1.5"
           style={{ color: "var(--color-violet-deep)" }}>
          🎩 Panel live
        </p>
        {isRunning && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            EN DIRECT
            {state.currentQuestionIndex >= 0 && (
              <span> · Q{state.currentQuestionIndex + 1}/{state.totalQuestions}</span>
            )}
          </span>
        )}
        {isFinished && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
            TERMINÉ
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isWaiting && (
          <form action={withRefresh(startLiveAction)}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              size="sm"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-bold"
            >
              ▶ Démarrer
            </Button>
          </form>
        )}

        {isRunning && !isLastQuestion && (
          <form action={withRefresh(nextQuestionAction)}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              size="sm"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-bold"
            >
              ➡ Suivante
            </Button>
          </form>
        )}

        {isRunning && isLastQuestion && (
          <form action={withRefresh(finishLiveAction)}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              🏁 Terminer
            </Button>
          </form>
        )}

        {isRunning && (
          <form action={withRefresh(finishLiveAction)}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              ⏹ Stop
            </Button>
          </form>
        )}

        {isFinished && (
          <form action={withRefresh(resetLiveAction)}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button type="submit" size="sm" variant="outline">
              ♻️ Réinitialiser
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
