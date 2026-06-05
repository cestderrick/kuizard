"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  startParticipationAction,
  submitAnswersAction,
} from "@/lib/actions/participation";

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
  imageUrl: string | null;
};

type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string };

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
  coverImageUrl: string | null;
  questions: Question[];
  theme: Theme;
  initialState: LiveState;
};

export function LivePlayer({
  code,
  title,
  description,
  coverImageUrl,
  questions,
  theme,
  initialState,
}: Props) {
  const [nickname, setNickname] = useState("");
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [liveState, setLiveState] = useState<LiveState>(initialState);
  const [submitted, setSubmitted] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Abonnement SSE pour recevoir les changements d'état
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
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
      } catch {
        // ignore les payloads non-JSON (heartbeat)
      }
    };
    es.onerror = () => {
      // EventSource gère la reconnexion automatiquement.
    };
    return () => {
      es.close();
    };
  }, [code]);

  // Soumission auto des réponses dès que le quizz passe FINISHED
  useEffect(() => {
    if (
      liveState.status === "FINISHED" &&
      participationId &&
      submitted === null
    ) {
      startTransition(async () => {
        const fd = new FormData();
        fd.set("code", code);
        fd.set("participationId", participationId);
        fd.set("answersJson", JSON.stringify(answers));
        const result = await submitAnswersAction({ ok: false }, fd);
        if (!result.ok) {
          setError(result.message ?? "Erreur d'envoi.");
          return;
        }
        setSubmitted({
          score: result.score ?? 0,
          total: result.total ?? 0,
        });
      });
    }
  }, [liveState.status, participationId, submitted, code, answers]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", code);
      fd.set("nickname", nickname);
      const result = await startParticipationAction({ ok: false }, fd);
      if (!result.ok || !result.participationId) {
        setError(result.message ?? "Erreur de connexion.");
        return;
      }
      setParticipationId(result.participationId);
    });
  }

  function toggleChoice(qid: string, index: number, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[qid];
      const sel =
        current?.type === "choice"
          ? new Set(current.selectedIndices)
          : new Set<number>();
      if (multi) {
        if (sel.has(index)) sel.delete(index);
        else sel.add(index);
      } else {
        sel.clear();
        sel.add(index);
      }
      return {
        ...prev,
        [qid]: { type: "choice", selectedIndices: Array.from(sel) },
      };
    });
  }

  function setTextAnswer(qid: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { type: "text", value },
    }));
  }

  const isLight = theme.background === "light";
  const mainStyle = {
    backgroundColor: isLight
      ? "var(--color-lavender)"
      : "var(--color-night)",
    color: isLight ? "var(--color-foreground)" : "var(--color-lavender)",
    ["--quiz-primary" as string]: theme.primaryColor,
  };

  // ===== UI conditionnelle selon l'état =====

  // Étape 1 : entrer le pseudo (avant de rejoindre)
  if (!participationId) {
    return (
      <main
        className="min-h-screen flex flex-col items-center px-4 py-10"
        style={mainStyle}
      >
        <div className="w-full max-w-md">
          <JoinCard
            title={title}
            description={description}
            coverImageUrl={coverImageUrl}
            nickname={nickname}
            setNickname={setNickname}
            onSubmit={handleJoin}
            isPending={isPending}
            error={error}
            totalQuestions={liveState.totalQuestions}
            quizStatus={liveState.status}
          />
        </div>
      </main>
    );
  }

  // Étape 2 : connecté, on attend que l'admin démarre
  if (liveState.status !== "RUNNING" && liveState.status !== "FINISHED") {
    return (
      <CenterScreen style={mainStyle}>
        <div className="text-6xl mb-4" aria-hidden>
          🎩
        </div>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
          Connecté en tant que {nickname}
        </p>
        <h1 className="font-display text-2xl tracking-wide mb-2">{title}</h1>
        <p className="text-sm opacity-80">
          Le maître du jeu lance bientôt la magie ✨
        </p>
        <Spinner />
      </CenterScreen>
    );
  }

  // Étape 3 : RUNNING — on affiche la question courante (et seulement elle)
  if (liveState.status === "RUNNING") {
    if (liveState.isPaused) {
      return (
        <CenterScreen style={mainStyle}>
          <div className="text-6xl mb-4" aria-hidden>
            ⏸️
          </div>
          <h1 className="font-display text-2xl tracking-wide">Pause</h1>
          <p className="text-sm opacity-80 mt-2">
            Le quizz reprendra dans un instant…
          </p>
        </CenterScreen>
      );
    }

    const idx = liveState.currentQuestionIndex;
    const question = questions[idx];
    if (!question) {
      return (
        <CenterScreen style={mainStyle}>
          <p>Question introuvable.</p>
        </CenterScreen>
      );
    }

    return (
      <main
        className="min-h-screen flex flex-col items-center px-4 py-10"
        style={mainStyle}
      >
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
              Question {idx + 1} / {liveState.totalQuestions}
            </p>
          </header>

          <LiveQuestionBlock
            question={question}
            answer={answers[question.id]}
            onToggleChoice={(i, multi) => toggleChoice(question.id, i, multi)}
            onSetText={(v) => setTextAnswer(question.id, v)}
          />

          <p className="text-center text-xs opacity-70 italic">
            Tu peux changer ta réponse tant que le maître du jeu n'a pas lancé
            la suivante.
          </p>
        </div>
      </main>
    );
  }

  // Étape 4 : FINISHED — soit en train d'envoyer, soit le score
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={mainStyle}
    >
      <div className="w-full max-w-md">
        {submitted ? (
          <FinalScoreCard
            code={code}
            title={title}
            nickname={nickname}
            score={submitted.score}
            total={submitted.total}
          />
        ) : (
          <CenterContent>
            <div className="text-6xl mb-3" aria-hidden>
              ✨
            </div>
            <h1 className="font-display text-2xl tracking-wide mb-2">
              Calcul du score…
            </h1>
            <Spinner />
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CenterContent>
        )}
      </div>
    </main>
  );
}

// ===========================================
// Sous-composants
// ===========================================

function CenterScreen({
  children,
  style,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 text-center"
      style={style}
    >
      <div className="max-w-md flex flex-col items-center">{children}</div>
    </main>
  );
}

function CenterContent({ children }: { children: React.ReactNode }) {
  return <div className="text-center flex flex-col items-center">{children}</div>;
}

function Spinner() {
  return (
    <div className="mt-6 inline-block w-8 h-8 rounded-full border-2 border-[var(--color-lavender-2)] border-t-[var(--color-gold)] animate-spin" />
  );
}

function JoinCard({
  title,
  description,
  coverImageUrl,
  nickname,
  setNickname,
  onSubmit,
  isPending,
  error,
  totalQuestions,
  quizStatus,
}: {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  nickname: string;
  setNickname: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  totalQuestions: number;
  quizStatus: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center"
    >
      {coverImageUrl && (
        <div className="w-full aspect-[16/9] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-8 flex flex-col gap-5">
        <div className="text-5xl" aria-hidden>
          🎩
        </div>
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-1">
            ✨ Quizz Kuizard ✨
          </p>
          <h1
            className="font-display text-3xl tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Mode <strong>live</strong> · {totalQuestions} question
            {totalQuestions > 1 ? "s" : ""}
          </p>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {quizStatus === "FINISHED" && (
          <Alert variant="destructive">
            <AlertDescription>
              Le quizz est déjà terminé. Tu peux quand même rejoindre pour voir
              le classement.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2 text-left">
          <Label htmlFor="nickname">Ton pseudo</Label>
          <Input
            id="nickname"
            type="text"
            required
            minLength={2}
            maxLength={40}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ex : Sophie, La sorcière..."
          />
          <p className="text-xs text-muted-foreground">
            Il apparaîtra sur le classement.
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          style={{
            backgroundColor: "var(--quiz-primary, var(--color-violet-primary))",
            color: "white",
          }}
        >
          {isPending ? "Connexion…" : "Rejoindre le quizz ✨"}
        </Button>
      </div>
    </form>
  );
}

function LiveQuestionBlock({
  question,
  answer,
  onToggleChoice,
  onSetText,
}: {
  question: Question;
  answer: Answer | undefined;
  onToggleChoice: (i: number, multi: boolean) => void;
  onSetText: (v: string) => void;
}) {
  const selectedSet =
    answer?.type === "choice" ? new Set(answer.selectedIndices) : new Set();
  const isMulti = question.type === "MULTIPLE_CHOICE";

  return (
    <div className="bg-[var(--color-night-2)] rounded-xl overflow-hidden flex flex-col border border-[rgba(167,139,250,0.2)]">
      {question.imageUrl && (
        <div className="w-full aspect-[16/9] bg-black overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
            Question
          </p>
          <p className="text-xs text-[var(--color-lavender-2)] opacity-70">
            {question.points} pt{question.points > 1 ? "s" : ""}
          </p>
        </div>
        <h2 className="font-display text-xl leading-snug">{question.text}</h2>

        {question.type === "TEXT" ? (
          <Input
            type="text"
            value={answer?.type === "text" ? answer.value : ""}
            onChange={(e) => onSetText(e.target.value)}
            placeholder="Tape ta réponse…"
            className="bg-white text-[var(--color-foreground)]"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => {
              const selected = selectedSet.has(i);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => onToggleChoice(i, isMulti)}
                  className="text-left rounded-lg px-4 py-3 transition-colors border"
                  style={{
                    borderColor: selected
                      ? "var(--color-gold)"
                      : "rgba(167,139,250,0.3)",
                    backgroundColor: selected
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(255,255,255,0.05)",
                    color: "var(--color-lavender)",
                  }}
                >
                  <span className="font-bold mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt.label}
                </button>
              );
            })}
            {isMulti && (
              <p className="text-xs text-[var(--color-lavender-2)] opacity-70 italic">
                Plusieurs réponses possibles
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FinalScoreCard({
  code,
  title,
  nickname,
  score,
  total,
}: {
  code: string;
  title: string;
  nickname: string;
  score: number;
  total: number;
}) {
  const ratio = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <div className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-8 flex flex-col gap-5 text-center">
      <div className="text-5xl" aria-hidden>
        ✨
      </div>
      <p className="text-sm uppercase tracking-[3px] font-semibold" style={{ color: "var(--quiz-primary, var(--color-violet-primary))" }}>
        Bravo {nickname} !
      </p>
      <h1
        className="font-display text-2xl tracking-wide"
        style={{ color: "var(--color-violet-deep)" }}
      >
        {title}
      </h1>
      <div className="my-2">
        <p
          className="font-display text-6xl font-bold"
          style={{ color: "var(--quiz-primary, var(--color-violet-primary))" }}
        >
          {score}
          <span className="text-2xl text-muted-foreground"> / {total}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {ratio}% de bonnes réponses
        </p>
      </div>
      <a
        href={`/q/${code}/classement`}
        className="inline-block px-5 py-2.5 rounded-md font-semibold"
        style={{
          backgroundColor: "var(--color-gold)",
          color: "var(--color-violet-deep)",
        }}
      >
        🏆 Voir le classement
      </a>
    </div>
  );
}
