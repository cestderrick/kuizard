"use client";

import { useEffect, useRef, useState } from "react";

type Theme = {
  primaryColor: string;
  background: "night" | "light";
};

type Question = {
  id: string;
  order: number;
  type: string;
  text: string;
  points: number;
  options: { label: string }[];
};

type LiveState = {
  status: string;
  currentQuestionIndex: number;
  isPaused: boolean;
  totalQuestions: number;
};

type Props = {
  code: string;
  title: string;
  description: string | null;
  mode: string;
  questions: Question[];
  theme: Theme;
  playUrl: string;
  qrSvg: string;
  initialState: LiveState;
};

/**
 * Affichage destiné aux TVs des bars : grosses polices, fort contraste,
 * QR code permanent dans un coin pour les arrivants tardifs, état temps réel
 * synchro avec le panel admin.
 */
export function TvDisplay({
  code,
  title,
  description,
  mode,
  questions,
  theme,
  playUrl,
  qrSvg,
  initialState,
}: Props) {
  const [liveState, setLiveState] = useState<LiveState>(initialState);
  const [connectedCount, setConnectedCount] = useState<number>(0);

  // SSE pour suivre l'état live
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    if (mode !== "LIVE_MANUAL") return;
    const es = new EventSource(`/api/quiz/${code}/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === "state") {
          setLiveState({
            status: payload.status,
            currentQuestionIndex: payload.currentQuestionIndex,
            isPaused: payload.isPaused,
            totalQuestions: payload.totalQuestions,
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [code, mode]);

  // Polling fallback toutes les 3s (au cas où le SSE meurt)
  useEffect(() => {
    if (mode !== "LIVE_MANUAL") return;
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch(`/api/quiz/${code}/state`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setLiveState((prev) =>
              prev.status === data.status &&
              prev.currentQuestionIndex === data.currentQuestionIndex &&
              prev.isPaused === data.isPaused
                ? prev
                : {
                    status: data.status,
                    currentQuestionIndex: data.currentQuestionIndex,
                    isPaused: data.isPaused,
                    totalQuestions: data.totalQuestions,
                  }
            );
          }
        }
      } catch {}
      if (!cancelled) setTimeout(tick, 3000);
    }
    tick();
    return () => {
      cancelled = true;
    };
  }, [code, mode]);

  // Compte de participants connectés
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

  const idx = liveState.currentQuestionIndex;
  const currentQuestion = idx >= 0 ? questions[idx] : null;
  const isLive =
    mode === "LIVE_MANUAL" && liveState.status === "RUNNING" && !!currentQuestion;

  return (
    <main
      className="min-h-screen w-full flex flex-col p-6 sm:p-10"
      style={{
        background: `linear-gradient(160deg, var(--color-night) 0%, ${theme.primaryColor}40 100%)`,
        color: "var(--color-lavender)",
      }}
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p
            className="text-xs uppercase tracking-[5px] font-semibold"
            style={{ color: theme.primaryColor }}
          >
            ✨ Kuizard ✨
          </p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-2">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[3px] opacity-70">
              Participants
            </p>
            <p className="font-display text-5xl font-bold text-[var(--color-gold)]">
              {connectedCount}
            </p>
          </div>
          {isLive && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[3px] opacity-70">
                Question
              </p>
              <p className="font-display text-5xl font-bold">
                {idx + 1}
                <span className="text-2xl opacity-50">
                  /{liveState.totalQuestions}
                </span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Zone principale */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Question / état */}
        <div className="rounded-3xl bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.25)] p-8 sm:p-12 flex flex-col items-center justify-center text-center">
          {liveState.status === "PUBLISHED" && (
            <>
              <div className="text-9xl mb-6" aria-hidden>
                🎩
              </div>
              <h2 className="font-display text-4xl sm:text-5xl mb-4 tracking-wide">
                Le quizz commence bientôt
              </h2>
              {description && (
                <p className="text-xl text-[var(--color-lavender-2)] opacity-80 max-w-2xl">
                  {description}
                </p>
              )}
              <p className="mt-6 text-2xl text-[var(--color-gold)] font-display">
                Scanne le QR code →
              </p>
            </>
          )}

          {liveState.status === "RUNNING" && liveState.isPaused && (
            <>
              <div className="text-9xl mb-6" aria-hidden>
                ⏸️
              </div>
              <h2 className="font-display text-5xl tracking-wide">Pause</h2>
              <p className="mt-4 text-xl opacity-80">
                Le quizz reprendra dans un instant…
              </p>
            </>
          )}

          {isLive && !liveState.isPaused && currentQuestion && (
            <>
              <p
                className="text-sm uppercase tracking-[5px] font-bold mb-4"
                style={{ color: theme.primaryColor }}
              >
                Question {idx + 1} / {liveState.totalQuestions} · {currentQuestion.points} pt
                {currentQuestion.points > 1 ? "s" : ""}
              </p>
              <h2 className="font-display text-4xl sm:text-6xl leading-tight mb-8 max-w-4xl">
                {currentQuestion.text}
              </h2>
              {currentQuestion.type !== "TEXT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
                  {currentQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-6 text-xl sm:text-2xl flex items-center gap-4 text-left"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "2px solid rgba(167,139,250,0.3)",
                      }}
                    >
                      <span
                        className="font-display text-3xl font-bold w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: theme.primaryColor,
                          color: "white",
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {currentQuestion.type === "TEXT" && (
                <p className="mt-2 text-xl text-[var(--color-gold)] italic">
                  Réponse libre — tape ta réponse sur ton téléphone ✨
                </p>
              )}
            </>
          )}

          {liveState.status === "FINISHED" && (
            <>
              <div className="text-9xl mb-6" aria-hidden>
                🏆
              </div>
              <h2 className="font-display text-5xl mb-4 tracking-wide">
                Quizz terminé !
              </h2>
              <p className="text-xl opacity-80 max-w-xl">
                Le classement final est en train d'arriver sur les téléphones
                des joueurs.
              </p>
            </>
          )}

          {mode === "SCHEDULED" && (
            <>
              <div className="text-9xl mb-6" aria-hidden>
                ⏰
              </div>
              <h2 className="font-display text-4xl sm:text-5xl mb-4 tracking-wide">
                Quizz en mode créneau horaire
              </h2>
              <p className="text-xl opacity-80 max-w-2xl">
                Les joueurs jouent à leur rythme. Scannez le QR code pour
                rejoindre, le classement sera dévoilé à la fin du créneau.
              </p>
            </>
          )}
        </div>

        {/* QR code + code court */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 flex flex-col items-center gap-3">
            <p
              className="text-xs uppercase tracking-[3px] font-bold"
              style={{ color: theme.primaryColor }}
            >
              Rejoignez le quizz
            </p>
            <div
              className="w-full aspect-square max-w-[300px]"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-black text-sm font-medium text-center">
              {playUrl}
            </p>
          </div>

          <div
            className="rounded-3xl p-6 text-center"
            style={{
              backgroundColor: theme.primaryColor,
              color: "white",
            }}
          >
            <p className="text-xs uppercase tracking-[3px] opacity-90 mb-2">
              Ou tape le code sur kuizard.fr
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "64px", letterSpacing: "10px" }}
            >
              {code}
            </p>
          </div>
        </aside>
      </section>

      {/* Footer fin */}
      <footer className="mt-8 text-center text-sm opacity-50">
        Propulsé par{" "}
        <span className="font-display tracking-wide">Kuizard ✨</span> · pour un
        moment magique
      </footer>
    </main>
  );
}
