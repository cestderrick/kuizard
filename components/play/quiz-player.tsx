"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGuessPlayer } from "@/components/play/score-guess-player";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  saveProgressAction,
  startParticipationAction,
  submitAnswersAction,
} from "@/lib/actions/participation";
import { QuestionTimer } from "@/components/play/question-timer";
import { TopLocaleBarClient } from "@/components/i18n/top-locale-bar-client";
import { MyAnswersPanel } from "@/components/play/my-answers-panel";

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
  // V50 : config brute pour SCORE_GUESS (envoyee non sanitizee depuis la page)
  rawOptions?: unknown;
};

type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string }
  | { type: "score"; home: number; away: number };

type Phase = "intro" | "playing" | "recap" | "result";

type ResumeData = {
  participationId: string;
  nickname: string;
  answers: Record<string, Answer>;
  completedAt: Date | null;
  canModify: boolean;
};

// V23 : ISO string de scheduledCloseAt, transmis pour gating de modification
type ScheduledWindow = {
  closeAtIso: string | null;
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
  /** V23 : créneau pour gating modification post-fermeture */
  scheduled?: ScheduledWindow;
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
  scheduled,
}: Props) {
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
  // V23 : index de la question affichée
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // V23 : moment où chaque question a été vue pour la première fois
  const [questionStartedAt, setQuestionStartedAt] = useState<
    Record<string, number>
  >(() => {
    const init: Record<string, number> = {};
    if (resume?.answers) {
      const now = Date.now();
      for (const q of questions) {
        if (resume.answers[q.id]) init[q.id] = now;
      }
    }
    return init;
  });
  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  // V23 : tick pour re-render à intervalle régulier (pour lock auto)
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [isPending, startTransition] = useTransition();

  // V23 : helpers de lock
  const closeAtMs = scheduled?.closeAtIso
    ? new Date(scheduled.closeAtIso).getTime()
    : null;
  const isQuizClosed = closeAtMs ? Date.now() > closeAtMs : false;

  function isQuestionLocked(q: Question): boolean {
    if (isQuizClosed) return true;
    if (!q.timerSeconds || q.timerSeconds <= 0) return false;
    const startedAt = questionStartedAt[q.id];
    if (!startedAt) return false;
    return Date.now() - startedAt >= q.timerSeconds * 1000;
  }

  function isAnswered(q: Question): boolean {
    const a = answers[q.id];
    if (!a) return false;
    if (a.type === "text") return a.value.trim().length > 0;
    return a.selectedIndices.length > 0;
  }

  // V23 : enregistre startedAt à l'entrée d'une question avec timer
  useEffect(() => {
    if (phase !== "playing") return;
    const q = questions[currentIndex];
    if (!q) return;
    if (!q.timerSeconds || q.timerSeconds <= 0) return;
    setQuestionStartedAt((prev) => {
      if (prev[q.id]) return prev;
      return { ...prev, [q.id]: Date.now() };
    });
  }, [phase, currentIndex, questions]);

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

  function setScoreAnswer(qid: string, home: number, away: number) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { type: "score", home, away },
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
      <TopLocaleBarClient variant={isLight ? "light" : "night"} />

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

        {phase === "playing" && (() => {
          const q = questions[currentIndex];
          if (!q) return null;
          const locked = isQuestionLocked(q);
          const answered = isAnswered(q);
          const canGoNext = answered || locked;
          const startedAt = questionStartedAt[q.id] ?? null;

          function goNext() {
            if (!canGoNext) {
              setError("Réponds à la question avant de continuer.");
              return;
            }
            setError(null);
            if (currentIndex >= questions.length - 1) {
              setPhase("recap");
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }

          function goBack() {
            if (currentIndex <= 0) return;
            setError(null);
            setCurrentIndex((i) => i - 1);
          }

          return (
            <div className="flex flex-col gap-6">
              <header className="text-center mb-2">
                <h1 className="font-display text-2xl md:text-3xl tracking-wide">
                  {title}
                </h1>
                <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
                  Question {currentIndex + 1} / {questions.length}
                </p>
                {isQuizClosed && (
                  <p className="mt-3 inline-block text-xs px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.15)] border border-[var(--color-gold)] text-[var(--color-gold)]">
                    Créneau fermé — tes réponses sont figées
                  </p>
                )}
                {participationId && autosaveStatus !== "idle" && (
                  <p className="mt-2 text-[10px] uppercase tracking-wider opacity-50">
                    {autosaveStatus === "saving" ? texts.saving : texts.saved}
                  </p>
                )}
              </header>

              <QuestionBlock
                key={q.id}
                index={currentIndex}
                question={q}
                answer={answers[q.id]}
                onToggleChoice={(i, multi) =>
                  !locked && toggleChoice(q.id, i, multi)
                }
                onSetText={(v) => !locked && setTextAnswer(q.id, v)}
                onSetScore={(home, away) =>
                  !locked && setScoreAnswer(q.id, home, away)
                }
                texts={texts}
                locked={locked}
                startedAtMs={startedAt}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nav Retour / Suivant */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={currentIndex === 0}
                  style={{ color: "var(--color-lavender)" }}
                >
                  ← Retour
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={goNext}
                  disabled={!canGoNext}
                  style={{
                    backgroundColor: canGoNext
                      ? "var(--color-gold)"
                      : "rgba(167,139,250,0.2)",
                    color: canGoNext
                      ? "var(--color-violet-deep)"
                      : "var(--color-lavender)",
                    opacity: canGoNext ? 1 : 0.6,
                  }}
                  className="font-bold"
                >
                  {currentIndex >= questions.length - 1
                    ? "Voir le récap →"
                    : "Suivant →"}
                </Button>
              </div>
            </div>
          );
        })()}

        {phase === "recap" && (
          <RecapCard
            title={title}
            questions={questions}
            answers={answers}
            isQuestionLocked={isQuestionLocked}
            onJumpTo={(idx) => {
              setCurrentIndex(idx);
              setPhase("playing");
            }}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
            isQuizClosed={isQuizClosed}
            texts={texts}
          />
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
            participationId={participationId}
            // V47.20 : si SCHEDULED + créneau encore ouvert → cache le score
            hideScore={
              !!scheduled?.closeAtIso &&
              new Date(scheduled.closeAtIso).getTime() > Date.now()
            }
            closeAtLabel={
              scheduled?.closeAtIso
                ? new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  }).format(new Date(scheduled.closeAtIso))
                : null
            }
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
  onSetScore,
  texts,
  locked,
  startedAtMs,
}: {
  index: number;
  question: Question;
  answer: Answer | undefined;
  onToggleChoice: (i: number, multi: boolean) => void;
  onSetText: (v: string) => void;
  onSetScore?: (home: number, away: number) => void;
  texts: PlayerTexts;
  locked?: boolean;
  startedAtMs?: number | null;
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
              startedAtMs={startedAtMs ?? undefined}
            />
          )}
          <p className="text-xs text-[var(--color-lavender-2)] opacity-70">
            {pluralize(texts.points_label, question.points)}
          </p>
        </div>
      </div>

      {/* Couleur forcée pour éviter cascade magic-show */}
      <h2
        className="text-lg leading-snug font-bold"
        style={{
          color: "#ffffff",
          WebkitTextFillColor: "#ffffff",
          fontFamily: "var(--font-display, inherit)",
        }}
      >
        {question.text}
      </h2>

      {locked && (
        <p
          className="text-xs font-semibold rounded-md px-3 py-2"
          style={{
            backgroundColor: "rgba(245,158,11,0.15)",
            color: "var(--color-gold)",
            border: "1px solid rgba(245,158,11,0.4)",
          }}
        >
          ⏱ Cette question est verrouillée — tu ne peux plus la modifier.
        </p>
      )}

      {question.type === "SCORE_GUESS" ? (
        <ScoreGuessPlayer
          rawConfig={question.rawOptions ?? null}
          initialAnswer={
            answer?.type === "score"
              ? { type: "score", home: answer.home, away: answer.away }
              : null
          }
          onChange={(a) => onSetScore?.(a.home, a.away)}
          locked={locked}
        />
      ) : question.type === "TEXT" ? (
        <Input
          type="text"
          value={answer?.type === "text" ? answer.value : ""}
          onChange={(e) => onSetText(e.target.value)}
          placeholder={texts.text_answer_placeholder}
          className="bg-white text-[var(--color-foreground)]"
          disabled={locked}
          style={{ opacity: locked ? 0.7 : 1 }}
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
                disabled={locked}
                className="text-left rounded-lg px-4 py-3 transition-colors border"
                style={{
                  borderColor: selected
                    ? "var(--color-gold)"
                    : "rgba(167,139,250,0.3)",
                  backgroundColor: selected
                    ? "rgba(245,158,11,0.15)"
                    : "rgba(255,255,255,0.05)",
                  color: "var(--color-lavender)",
                  opacity: locked && !selected ? 0.55 : 1,
                  cursor: locked ? "default" : "pointer",
                }}
              >
                <span className="font-bold mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt.label}
              </button>
            );
          })}
          {isMulti && !locked && (
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

/**
 * V23 : Page récap finale.
 */
function RecapCard({
  title,
  questions,
  answers,
  isQuestionLocked,
  onJumpTo,
  onSubmit,
  isPending,
  error,
  isQuizClosed,
  texts,
}: {
  title: string;
  questions: Question[];
  answers: Record<string, Answer>;
  isQuestionLocked: (q: Question) => boolean;
  onJumpTo: (idx: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  isQuizClosed: boolean;
  texts: PlayerTexts;
}) {
  function summarize(q: Question): string {
    const a = answers[q.id];
    if (!a) return "— Pas de réponse —";
    if (a.type === "text") return a.value.trim() || "— Pas de réponse —";
    if (a.selectedIndices.length === 0) return "— Pas de réponse —";
    return a.selectedIndices
      .sort((x, y) => x - y)
      .map((i) => {
        const letter = String.fromCharCode(65 + i);
        const label = q.options[i]?.label ?? "";
        return `${letter}. ${label}`;
      })
      .join(" / ");
  }

  const unanswered = questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return true;
    if (a.type === "text") return !a.value.trim();
    return a.selectedIndices.length === 0;
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <header className="text-center">
        <h1 className="font-display text-2xl md:text-3xl tracking-wide">
          📋 Récapitulatif
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          {title} · {questions.length} questions
        </p>
        {isQuizClosed && (
          <p className="mt-3 inline-block text-xs px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.15)] border border-[var(--color-gold)] text-[var(--color-gold)]">
            Créneau fermé — modifications désactivées
          </p>
        )}
      </header>

      <ol className="flex flex-col gap-2">
        {questions.map((q, idx) => {
          const locked = isQuestionLocked(q);
          const a = answers[q.id];
          const hasAnswer = a
            ? a.type === "text"
              ? !!a.value.trim()
              : a.selectedIndices.length > 0
            : false;
          return (
            <li
              key={q.id}
              className="rounded-lg border p-3 flex flex-col gap-2"
              style={{
                borderColor: hasAnswer
                  ? "rgba(167,139,250,0.3)"
                  : "rgba(239,68,68,0.4)",
                backgroundColor: hasAnswer
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(239,68,68,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-gold)] font-semibold">
                    Question {idx + 1}
                    {locked && (
                      <span className="ml-2 text-[var(--color-lavender-2)] opacity-70 normal-case">
                        🔒 verrouillée
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-semibold mt-1">{q.text}</p>
                  <p className="text-sm mt-1 opacity-90">
                    <strong>Ta réponse :</strong> {summarize(q)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpTo(idx)}
                  className="text-xs underline whitespace-nowrap"
                  style={{ color: "var(--color-gold)" }}
                >
                  {locked || isQuizClosed ? "Voir" : "Modifier"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {unanswered.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Il te reste {unanswered.length} question
            {unanswered.length > 1 ? "s" : ""} sans réponse.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onJumpTo(0)}
          style={{ color: "var(--color-lavender)" }}
        >
          ← Revenir aux questions
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isPending || isQuizClosed}
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
          className="font-bold"
        >
          {isPending
            ? texts.calculating
            : isQuizClosed
            ? "Quiz fermé"
            : "✨ Soumettre définitivement"}
        </Button>
      </div>
    </form>
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
  participationId,
  hideScore,
  closeAtLabel,
}: {
  code: string;
  title: string;
  nickname: string;
  score: number;
  total: number;
  canModify: boolean;
  onModify: () => void;
  texts: PlayerTexts;
  participationId: string | null;
  /** V47.20 : true en SCHEDULED ouvert → on cache le score chiffré */
  hideScore?: boolean;
  /** Date FR formatée de clôture pour le message d'attente */
  closeAtLabel?: string | null;
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
        {hideScore ? (
          // V47.20 : SCHEDULED ouvert → score scellé (suspense préservé,
          // même pour le joueur lui-même)
          <>
            <p
              className="font-display text-6xl"
              style={{ color: "var(--quiz-primary, var(--color-violet-primary))" }}
              aria-hidden
            >
              🤫
            </p>
            <p className="text-sm font-bold mt-3" style={{ color: "var(--color-violet-deep)" }}>
              Score scellé
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ton score et le classement seront dévoilés à tous à la clôture
              du créneau
              {closeAtLabel ? <> ({closeAtLabel})</> : null}.
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {!hideScore && <p className="italic">{message}</p>}

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

      {/* Historique des réponses — visible uniquement quand le quizz
          est clôturé (l'API gating renvoie un message d'attente sinon) */}
      {participationId && (
        <MyAnswersPanel code={code} participationId={participationId} />
      )}
    </div>
  );
}
