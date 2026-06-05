"use client";

import { useState, useTransition } from "react";

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
  options: { label: string }[]; // sans isCorrect
};

type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string };

type Phase = "intro" | "playing" | "result";

type Props = {
  code: string;
  title: string;
  description: string | null;
  questions: Question[];
  theme: Theme;
};

export function QuizPlayer({ code, title, description, questions, theme }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [nickname, setNickname] = useState("");
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // --- Intro : démarrer la participation
  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", code);
      fd.set("nickname", nickname);
      const result = await startParticipationAction({ ok: false }, fd);
      if (!result.ok || !result.participationId) {
        setError(result.message ?? "Une erreur est survenue.");
        return;
      }
      setParticipationId(result.participationId);
      setPhase("playing");
    });
  }

  // --- Mise à jour d'une réponse
  function toggleChoice(qid: string, index: number, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[qid];
      const sel =
        current?.type === "choice" ? new Set(current.selectedIndices) : new Set<number>();
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

  // --- Soumission finale
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participationId) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", code);
      fd.set("participationId", participationId);
      fd.set("answersJson", JSON.stringify(answers));
      const result = await submitAnswersAction({ ok: false }, fd);
      if (!result.ok) {
        setError(result.message ?? "Erreur à l'envoi.");
        return;
      }
      setScore(result.score ?? 0);
      setTotal(result.total ?? 0);
      setPhase("result");
    });
  }

  // ============================================================
  // RENDER
  // ============================================================

  const isLight = theme.background === "light";

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{
        backgroundColor: isLight
          ? "var(--color-lavender)"
          : "var(--color-night)",
        color: isLight ? "var(--color-foreground)" : "var(--color-lavender)",
        // CSS custom property utilisable par tous les enfants : var(--quiz-primary)
        ["--quiz-primary" as string]: theme.primaryColor,
      }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {phase === "intro" && (
          <IntroCard
            title={title}
            description={description}
            nickname={nickname}
            setNickname={setNickname}
            onSubmit={handleStart}
            isPending={isPending}
            error={error}
            questionCount={questions.length}
          />
        )}

        {phase === "playing" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <header className="text-center mb-2">
              <h1 className="font-display text-2xl md:text-3xl tracking-wide">
                {title}
              </h1>
              <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
                {questions.length} question{questions.length > 1 ? "s" : ""} ·{" "}
                Réponds à toutes puis valide en bas de page
              </p>
            </header>

            {questions.map((q, idx) => (
              <QuestionBlock
                key={q.id}
                index={idx}
                question={q}
                answer={answers[q.id]}
                onToggleChoice={(i, multi) => toggleChoice(q.id, i, multi)}
                onSetText={(v) => setTextAnswer(q.id, v)}
              />
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-violet-deep)",
                }}
                className="font-bold"
              >
                {isPending ? "Calcul…" : "Voir mon score ✨"}
              </Button>
            </div>
          </form>
        )}

        {phase === "result" && score !== null && total !== null && (
          <ResultCard
            code={code}
            title={title}
            nickname={nickname}
            score={score}
            total={total}
          />
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-[var(--color-lavender-2)] opacity-50">
        Propulsé par <span className="font-display tracking-wide">Kuizard</span>
      </footer>
    </main>
  );
}

// ============================================================
// Sous-composants
// ============================================================

function IntroCard({
  title,
  description,
  nickname,
  setNickname,
  onSubmit,
  isPending,
  error,
  questionCount,
}: {
  title: string;
  description: string | null;
  nickname: string;
  setNickname: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  questionCount: number;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-8 flex flex-col gap-5 text-center"
    >
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
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="text-xs text-muted-foreground">
        {questionCount} question{questionCount > 1 ? "s" : ""} à venir
      </div>

      <div className="flex flex-col gap-2 text-left">
        <Label htmlFor="nickname">Ton pseudo</Label>
        <Input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={40}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ex : Marie, La sorcière, Le mage..."
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
        {isPending ? "Connexion…" : "Commencer le quizz ✨"}
      </Button>
    </form>
  );
}

function QuestionBlock({
  index,
  question,
  answer,
  onToggleChoice,
  onSetText,
}: {
  index: number;
  question: Question;
  answer: Answer | undefined;
  onToggleChoice: (i: number, multi: boolean) => void;
  onSetText: (v: string) => void;
}) {
  const selectedSet =
    answer?.type === "choice" ? new Set(answer.selectedIndices) : new Set();
  const isMulti = question.type === "MULTIPLE_CHOICE";

  return (
    <div className="bg-[var(--color-night-2)] rounded-xl p-5 flex flex-col gap-4 border border-[rgba(167,139,250,0.2)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
          Question {index + 1}
        </p>
        <p className="text-xs text-[var(--color-lavender-2)] opacity-70">
          {question.points} pt{question.points > 1 ? "s" : ""}
        </p>
      </div>

      <h2 className="font-display text-lg leading-snug">{question.text}</h2>

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
  );
}

function ResultCard({
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
  const message =
    ratio >= 80
      ? "Un vrai magicien 🪄"
      : ratio >= 50
      ? "Pas mal du tout ✨"
      : ratio >= 25
      ? "Tu as quelques tours dans ta manche 🎩"
      : "C'est pas grave, l'essentiel est de participer 💜";

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

      <p className="italic">{message}</p>

      <div className="flex flex-col gap-2 pt-2">
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
    </div>
  );
}
