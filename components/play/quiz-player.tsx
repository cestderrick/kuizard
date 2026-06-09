"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  saveProgressAction,
  startParticipationAction,
  submitAnswersAction,
} from "@/lib/actions/participation";
import { QuestionTimer } from "@/components/play/question-timer";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";

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
  timerSeconds: number | null;
  options: { label: string }[]; // sans isCorrect
  imageUrl: string | null;
};

type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string };

type Phase = "intro" | "playing" | "result";

type ResumeData = {
  participationId: string;
  nickname: string;
  answers: Record<string, Answer>;
  completedAt: Date | null;
  canModify: boolean;
};

type PlayerTexts = {
  badge: string;
  nickname_label: string;
  nickname_placeholder: string;
  nickname_hint: string;
  questions_count: string;
  start_button: string;
  connecting: string;
  instructions: string;
  can_modify_hint: string;
  saving: string;
  saved: string;
  question_number: string;
  points_label: string;
  text_answer_placeholder: string;
  multi_choice_hint: string;
  submit_button: string;
  submit_button_modify: string;
  calculating: string;
  bravo: string;
  score_correct: string;
  msg_excellent: string;
  msg_good: string;
  msg_ok: string;
  msg_low: string;
  modify_button: string;
  leaderboard_button: string;
  powered_by: string;
};

type Props = {
  code: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  questions: Question[];
  theme: Theme;
  /** Données pour reprendre une session existante (cookie kz_play_<quizId>) */
  resume?: ResumeData | null;
  /** Textes traduits — passés depuis le server component parent. */
  texts: PlayerTexts;
};

// Helper pluriel basique : "s" si count > 1 sinon "". Le placeholder {s} dans
// les chaînes traduites le devient via cette fonction.
function pluralize(text: string, count: number): string {
  return text
    .replace(/\{count\}/g, String(count))
    .replace(/\{n\}/g, String(count))
    .replace(/\{s\}/g, count > 1 ? "s" : "")
    .replace(/\{e\}/g, count > 1 ? "e" : "")
    .replace(/\{n\}/g, count > 1 ? "n" : "")
    .replace(/\{ов\}/g, count === 1 ? "" : count >= 2 && count <= 4 ? "а" : "ов");
}

export function QuizPlayer({
  code,
  title,
  description,
  coverImageUrl,
  questions,
  theme,
  resume,
  texts,
}: Props) {
  // Si on a une session reprise terminée et modifiable (SCHEDULED), on
  // l'amène directement en phase "playing" en pré-remplissant tout.
  const initialPhase: Phase = resume
    ? resume.completedAt && !resume.canModify
      ? "result"
      : "playing"
    : "intro";

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [nickname, setNickname] = useState(resume?.nickname ?? "");
  const [participationId, setParticipationId] = useState<string | null>(
    resume?.participationId ?? null
  );
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    resume?.answers ?? {}
  );
  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  const [isPending, startTransition] = useTransition();

  // ----------------------------------------------------------------
  // AUTOSAVE — debounced à chaque changement de answers
  // (utile en mode SCHEDULED pour reprendre après fermeture nav)
  // ----------------------------------------------------------------
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!participationId || phase !== "playing") return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setAutosaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      const fd = new FormData();
      fd.set("code", code);
      fd.set("participationId", participationId);
      fd.set("answersJson", JSON.stringify(answers));
      fd.set("currentQuestionIndex", "0");
      await saveProgressAction({ ok: false }, fd);
      setAutosaveStatus("saved");
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [answers, participationId, phase, code]);

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
      className="min-h-screen flex flex-col items-center px-4 py-10 relative"
      style={{
        backgroundColor: isLight
          ? "var(--color-lavender)"
          : "var(--color-night)",
        color: isLight ? "var(--color-foreground)" : "var(--color-lavender)",
        // CSS custom property utilisable par tous les enfants : var(--quiz-primary)
        ["--quiz-primary" as string]: theme.primaryColor,
      }}
    >
      <TopLocaleBar variant={isLight ? "light" : "night"} />

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {phase === "intro" && (
          <IntroCard
            title={title}
            description={description}
            coverImageUrl={coverImageUrl}
            nickname={nickname}
            setNickname={setNickname}
            onSubmit={handleStart}
            isPending={isPending}
            error={error}
            questionCount={questions.length}
            texts={texts}
          />
        )}

        {phase === "playing" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <header className="text-center mb-2">
              <h1 className="font-display text-2xl md:text-3xl tracking-wide">
                {title}
              </h1>
              <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
                {pluralize(texts.questions_count, questions.length)} ·{" "}
                {texts.instructions}
              </p>
              {resume?.completedAt && resume.canModify && (
                <p className="mt-3 inline-block text-xs px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.15)] border border-[var(--color-gold)] text-[var(--color-gold)]">
                  {texts.can_modify_hint}
                </p>
              )}
              {participationId && autosaveStatus !== "idle" && (
                <p className="mt-2 text-[10px] uppercase tracking-wider opacity-50">
                  {autosaveStatus === "saving" ? texts.saving : texts.saved}
                </p>
              )}
            </header>

            {questions.map((q, idx) => (
              <QuestionBlock
                key={q.id}
                index={idx}
                question={q}
                answer={answers[q.id]}
                onToggleChoice={(i, multi) => toggleChoice(q.id, i, multi)}
                onSetText={(v) => setTextAnswer(q.id, v)}
                texts={texts}
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
                {isPending
                  ? texts.calculating
                  : resume?.completedAt && resume.canModify
                  ? texts.submit_button_modify
                  : texts.submit_button}
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
            canModify={resume?.canModify ?? false}
            onModify={() => setPhase("playing")}
            texts={texts}
          />
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-[var(--color-lavender-2)] opacity-50">
        {texts.powered_by}
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
  coverImageUrl,
  nickname,
  setNickname,
  onSubmit,
  isPending,
  error,
  questionCount,
  texts,
}: {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  nickname: string;
  setNickname: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  questionCount: number;
  texts: PlayerTexts;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-center"
    >
      {coverImageUrl ? (
        <div className="w-full aspect-[16/9] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-8 flex flex-col gap-5">
      <div className="text-5xl" aria-hidden>
        🎩
      </div>
      <div>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-1">
          {texts.badge}
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
        {pluralize(texts.questions_count, questionCount)}
      </div>

      <div className="flex flex-col gap-2 text-left">
        <Label htmlFor="nickname">{texts.nickname_label}</Label>
        <Input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={40}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={texts.nickname_placeholder}
        />
        <p className="text-xs text-muted-foreground">
          {texts.nickname_hint}
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
        {isPending ? texts.connecting : texts.start_button}
      </Button>
      </div>
    </form>
  );
}

function QuestionBlock({
  index,
  question,
  answer,
  onToggleChoice,
  onSetText,
  texts,
}: {
  index: number;
  question: Question;
  answer: Answer | undefined;
  onToggleChoice: (i: number, multi: boolean) => void;
  onSetText: (v: string) => void;
  texts: PlayerTexts;
}) {
  const selectedSet =
    answer?.type === "choice" ? new Set(answer.selectedIndices) : new Set();
  const isMulti = question.type === "MULTIPLE_CHOICE";

  return (
    <div className="bg-[var(--color-night-2)] rounded-xl overflow-hidden flex flex-col border border-[rgba(167,139,250,0.2)]">
      {question.imageUrl ? (
        <div className="w-full aspect-[16/9] bg-black overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
          {texts.question_number.replace("{n}", String(index + 1))}
        </p>
        <div className="flex items-center gap-3">
          {question.timerSeconds && question.timerSeconds > 0 && (
            <QuestionTimer
              durationSeconds={question.timerSeconds}
              mode="scheduled"
            />
          )}
          <p className="text-xs text-[var(--color-lavender-2)] opacity-70">
            {pluralize(texts.points_label, question.points)}
          </p>
        </div>
      </div>

      <h2 className="font-display text-lg leading-snug">{question.text}</h2>

      {question.type === "TEXT" ? (
        <Input
          type="text"
          value={answer?.type === "text" ? answer.value : ""}
          onChange={(e) => onSetText(e.target.value)}
          placeholder={texts.text_answer_placeholder}
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
              {texts.multi_choice_hint}
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function ResultCard({
  code,
  title,
  nickname,
  score,
  total,
  canModify,
  onModify,
  texts,
}: {
  code: string;
  title: string;
  nickname: string;
  score: number;
  total: number;
  canModify: boolean;
  onModify: () => void;
  texts: PlayerTexts;
}) {
  const ratio = total > 0 ? Math.round((score / total) * 100) : 0;
  const message =
    ratio >= 80
      ? texts.msg_excellent
      : ratio >= 50
      ? texts.msg_good
      : ratio >= 25
      ? texts.msg_ok
      : texts.msg_low;

  return (
    <div className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-8 flex flex-col gap-5 text-center">
      <div className="text-5xl" aria-hidden>
        ✨
      </div>
      <p className="text-sm uppercase tracking-[3px] font-semibold" style={{ color: "var(--quiz-primary, var(--color-violet-primary))" }}>
        {texts.bravo.replace("{nickname}", nickname)}
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
          {texts.score_correct.replace("{ratio}", String(ratio))}
        </p>
      </div>

      <p className="italic">{message}</p>

      <div className="flex flex-col gap-2 pt-2">
        {canModify && (
          <button
            type="button"
            onClick={onModify}
            className="inline-block px-5 py-2.5 rounded-md font-semibold border-2"
            style={{
              borderColor: "var(--color-violet-primary)",
              color: "var(--color-violet-primary)",
              backgroundColor: "transparent",
            }}
          >
            {texts.modify_button}
          </button>
        )}
        <a
          href={`/q/${code}/classement`}
          className="inline-block px-5 py-2.5 rounded-md font-semibold"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          {texts.leaderboard_button}
        </a>
      </div>
    </div>
  );
}
