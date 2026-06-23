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

type TopEntry = { rank: number; nickname: string; score: number };

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
 * V34 — Affichage TV bar/restos : grosses polices, fort contraste, QR
 * permanent, état temps réel via SSE, podium live des top 5 quand le quiz
 * est FINISHED.
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
  const [top5, setTop5] = useState<TopEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);

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

  useEffect(() => {
    if (mode !== "LIVE_MANUAL") return;
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch(`/api/quiz/${code}/state`, { cache: "no-store" });
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

  // V34 : polling top 5 leaderboard (uniquement quand FINISHED)
  useEffect(() => {
    if (liveState.status !== "FINISHED") return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/quiz/${code}/top-leaderboard`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setTop5(data.top ?? []);
            setTotalEntries(data.totalEntries ?? 0);
          }
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 5000);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [code, liveState.status]);

  const idx = liveState.currentQuestionIndex;
  const currentQuestion = idx >= 0 ? questions[idx] : null;
  const isLive =
    mode === "LIVE_MANUAL" && liveState.status === "RUNNING" && !!currentQuestion;
  const isWaiting = liveState.status === "PUBLISHED";
  const isFinished = liveState.status === "FINISHED";

  return (
    <main
      className="min-h-screen w-full flex flex-col p-6 sm:p-10"
      style={{
        background: `linear-gradient(160deg, var(--color-night) 0%, ${theme.primaryColor}40 100%)`,
        color: "var(--color-lavender)",
      }}
    >
      {/* Header — V45 : bien visible pour TV vue de loin */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="min-w-0">
          <p
            className="text-sm sm:text-lg uppercase tracking-[6px] font-bold mb-1"
            style={{
              color: "var(--color-gold)",
              WebkitTextFillColor: "var(--color-gold)",
            }}
          >
            ✨ KUIZARD ✨
          </p>
          <h1
            className="text-3xl sm:text-5xl tracking-wide font-bold truncate"
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-8 sm:gap-12 shrink-0">
          <div className="text-center">
            <p className="text-xs sm:text-sm uppercase tracking-[3px] opacity-80 font-bold mb-1" style={{ color: "var(--color-lavender)" }}>
              👥 Participants
            </p>
            <p
              className="text-5xl sm:text-7xl font-bold leading-none"
              style={{
                color: "var(--color-gold)",
                WebkitTextFillColor: "var(--color-gold)",
                fontFamily: "var(--font-display, inherit)",
              }}
            >
              {connectedCount}
            </p>
          </div>
          {isLive && (
            <div className="text-center">
              <p className="text-xs sm:text-sm uppercase tracking-[3px] opacity-80 font-bold mb-1" style={{ color: "var(--color-lavender)" }}>
                Question
              </p>
              <p
                className="text-5xl sm:text-7xl font-bold leading-none"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  fontFamily: "var(--font-display, inherit)",
                }}
              >
                {idx + 1}
                <span className="text-2xl sm:text-3xl opacity-50">
                  /{liveState.totalQuestions}
                </span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* V34 — Layout adaptatif selon l'état */}
      {isWaiting && (
        /* QR géant centré pour pré-quiz */
        <section className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p
              className="text-sm sm:text-base uppercase tracking-[5px] font-bold mb-2"
              style={{ color: theme.primaryColor }}
            >
              🎩 Scannez pour rejoindre
            </p>
            <h2 className="font-display text-3xl sm:text-5xl tracking-wide">
              Le quizz commence bientôt
            </h2>
            {description && (
              <p className="mt-3 text-lg sm:text-xl text-[var(--color-lavender-2)] opacity-80 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* QR GÉANT */}
          <div className="rounded-3xl bg-white p-8 shadow-2xl">
            <div
              className="w-[min(70vh,500px)] aspect-square"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>

          {/* Code court ENORME */}
          <div
            className="rounded-3xl px-12 py-6 text-center shadow-2xl"
            style={{
              backgroundColor: theme.primaryColor,
              color: "white",
            }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-[3px] opacity-90 mb-1">
              Ou tape sur kuizard.fr
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "min(12vw, 96px)", letterSpacing: "14px" }}
            >
              {code}
            </p>
          </div>
        </section>
      )}

      {isFinished && (
        /* Podium géant top 5 pour fin de quiz */
        <section className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-6xl sm:text-8xl mb-2" aria-hidden>
              🏆
            </p>
            <h2 className="font-display text-4xl sm:text-6xl tracking-wide mb-2">
              Classement final
            </h2>
            <p className="text-base opacity-70">
              {totalEntries} participant{totalEntries > 1 ? "s" : ""} ·
              Bravo à tous !
            </p>
          </div>

          {top5.length === 0 ? (
            <p className="text-xl opacity-70">Calcul des résultats…</p>
          ) : (
            <ol className="w-full max-w-3xl flex flex-col gap-2">
              {top5.map((e) => {
                const isFirst = e.rank === 1;
                const isPodium = e.rank <= 3;
                const medal =
                  e.rank === 1
                    ? "🏆"
                    : e.rank === 2
                    ? "🥈"
                    : e.rank === 3
                    ? "🥉"
                    : "✨";
                return (
                  <li
                    key={e.rank}
                    className="rounded-2xl flex items-center justify-between gap-4 px-6 py-4 sm:px-8 sm:py-5"
                    style={{
                      background: isFirst
                        ? `linear-gradient(135deg, ${theme.primaryColor}, var(--color-gold))`
                        : isPodium
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                      border: isPodium
                        ? `2px solid ${isFirst ? "var(--color-gold)" : "rgba(255,255,255,0.2)"}`
                        : "1px solid rgba(255,255,255,0.1)",
                      transform: isFirst ? "scale(1.04)" : "scale(1)",
                    }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <span className="text-5xl sm:text-7xl" aria-hidden>
                        {medal}
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          color: isFirst ? "white" : "var(--color-lavender)",
                          WebkitTextFillColor: isFirst ? "white" : "var(--color-lavender)",
                          fontFamily: "var(--font-display, inherit)",
                          fontSize: isFirst ? "3rem" : "2.5rem",
                          minWidth: "4rem",
                          lineHeight: 1,
                        }}
                      >
                        #{e.rank}
                      </span>
                      <span
                        className="truncate font-bold"
                        style={{
                          color: isFirst ? "white" : "var(--color-lavender)",
                          WebkitTextFillColor: isFirst ? "white" : "var(--color-lavender)",
                          fontFamily: "var(--font-display, inherit)",
                          fontSize: isFirst ? "3.5rem" : "2.75rem",
                          lineHeight: 1.1,
                        }}
                      >
                        {e.nickname}
                      </span>
                    </div>
                    <span
                      className="font-bold whitespace-nowrap"
                      style={{
                        color: isFirst ? "white" : "var(--color-gold)",
                        WebkitTextFillColor: isFirst ? "white" : "var(--color-gold)",
                        fontFamily: "var(--font-display, inherit)",
                        fontSize: isFirst ? "4rem" : "3rem",
                        lineHeight: 1,
                      }}
                    >
                      {e.score}
                      <span className="text-2xl sm:text-3xl opacity-70 ml-1">pts</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="text-sm opacity-50 mt-4">
            🎁 Récompenses à venir — bravo aux gagnants !
          </p>
        </section>
      )}

      {!isWaiting && !isFinished && (
        /* Layout question + QR (live ou scheduled) */
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="rounded-3xl bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.25)] p-8 sm:p-12 flex flex-col items-center justify-center text-center">
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
                  Question {idx + 1} / {liveState.totalQuestions} ·{" "}
                  {currentQuestion.points} pt
                  {currentQuestion.points > 1 ? "s" : ""}
                </p>
                <h2
                  className="font-display text-4xl sm:text-6xl leading-tight mb-8 max-w-4xl"
                  style={{
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                    background: "none",
                  }}
                >
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
                            color: "#ffffff",
                            WebkitTextFillColor: "#ffffff",
                            background: theme.primaryColor,
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

          {/* QR code + code court (sidebar live) */}
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
      )}

      <footer className="mt-8 text-center text-sm opacity-50">
        Propulsé par{" "}
        <span className="font-display tracking-wide">Kuizard ✨</span> · pour
        un moment magique
      </footer>
    </main>
  );
}
