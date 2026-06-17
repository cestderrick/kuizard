"use server";

// =============================================
// Server Actions — Mode LIVE_MANUAL
// =============================================
// Le créateur du quizz pilote le déroulé question par question.

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { broadcast } from "@/lib/live/broadcaster";
import {
  INITIAL_LIVE_STATE,
  parseLiveState,
  type LiveBroadcast,
} from "@/lib/live/state";
import {
  scoreAnswer,
  isOptionArray,
  type Answer,
} from "@/lib/quiz/scoring";

async function getOwnedQuiz(quizId: string, userId: string) {
  return prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: {
      id: true,
      code: true,
      status: true,
      mode: true,
      liveState: true,
      _count: { select: { questions: true } },
    },
  });
}

/**
 * Revalidate les pages admin ET joueur. Le bug avant était d'utiliser
 * quizId au lieu de quizCode pour les pages /q/[code] côté joueur.
 */
function revalidateAllForQuiz(quizId: string, code: string) {
  revalidatePath(`/dashboard/quizzes/${quizId}/live`);
  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/q/${code}`);
  revalidatePath(`/q/${code}/classement`);
  revalidatePath(`/q/${code}/display`);
}

function broadcastState(
  quizId: string,
  status: string,
  currentQuestionIndex: number,
  isPaused: boolean,
  totalQuestions: number,
  questionStartedAtMs: number | null = null
) {
  const event: LiveBroadcast = {
    type: "state",
    status,
    currentQuestionIndex,
    isPaused,
    totalQuestions,
    questionStartedAtMs,
  };
  broadcast(quizId, event);
}

// -----------------------------------------------------
// START LIVE — passe le quizz en RUNNING et ouvre la 1ère question
// -----------------------------------------------------

export async function startLiveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string") throw new Error("Quizz manquant.");

  const quiz = await getOwnedQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");
  if (quiz._count.questions === 0)
    throw new Error("Le quizz n'a aucune question.");
  if (quiz.mode !== "LIVE_MANUAL")
    throw new Error("Action réservée au mode live.");

  const startedAt = new Date();
  const newState = {
    currentQuestionIndex: 0,
    questionOpenedAt: startedAt.toISOString(),
    isPaused: false,
  };

  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      status: "RUNNING",
      liveState: newState as unknown as Prisma.InputJsonValue,
    },
  });

  broadcastState(
    quizId,
    "RUNNING",
    0,
    false,
    quiz._count.questions,
    startedAt.getTime()
  );
  revalidateAllForQuiz(quizId, quiz.code);
}

// -----------------------------------------------------
// NEXT QUESTION — incrémente l'index
// -----------------------------------------------------

export async function nextQuestionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string") throw new Error("Quizz manquant.");

  const quiz = await getOwnedQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");
  if (quiz.status !== "RUNNING")
    throw new Error("Le quizz n'est pas en cours.");

  const current = parseLiveState(quiz.liveState);
  const nextIndex = current.currentQuestionIndex + 1;

  if (nextIndex >= quiz._count.questions) {
    // Plus de questions → on termine
    return finishLiveInternal(quizId, quiz._count.questions);
  }

  const startedAt = new Date();
  const newState = {
    currentQuestionIndex: nextIndex,
    questionOpenedAt: startedAt.toISOString(),
    isPaused: false,
  };

  await prisma.quiz.update({
    where: { id: quizId },
    data: { liveState: newState as unknown as Prisma.InputJsonValue },
  });

  broadcastState(
    quizId,
    "RUNNING",
    nextIndex,
    false,
    quiz._count.questions,
    startedAt.getTime()
  );
  revalidateAllForQuiz(quizId, quiz.code);
}

// -----------------------------------------------------
// PAUSE / RESUME — toggle isPaused
// -----------------------------------------------------

export async function togglePauseAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string") throw new Error("Quizz manquant.");

  const quiz = await getOwnedQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");
  if (quiz.status !== "RUNNING")
    throw new Error("Le quizz n'est pas en cours.");

  const current = parseLiveState(quiz.liveState);
  const newState = { ...current, isPaused: !current.isPaused };

  await prisma.quiz.update({
    where: { id: quizId },
    data: { liveState: newState as unknown as Prisma.InputJsonValue },
  });

  broadcastState(
    quizId,
    "RUNNING",
    current.currentQuestionIndex,
    newState.isPaused,
    quiz._count.questions
  );
  revalidateAllForQuiz(quizId, quiz.code);
}

// -----------------------------------------------------
// FINISH LIVE — passe le quizz en FINISHED
// -----------------------------------------------------

async function finishLiveInternal(quizId: string, totalQuestions: number) {
  // ===========================================================
  // BUGFIX V22 : on calcule TOUS les scores des participations
  // non terminées et on les marque completedAt. Sans ça, le
  // classement reste vide ("personne n'a terminé") après Terminer.
  // ===========================================================

  // 1. Récupérer les questions avec leurs options (correctIndices)
  const questions = await prisma.question.findMany({
    where: { quizId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      points: true,
      options: true,
    },
  });

  // 2. Récupérer toutes les participations non encore terminées
  const participations = await prisma.participation.findMany({
    where: { quizId, completedAt: null },
    select: { id: true, answers: true },
  });

  // 3. Pour chaque participation : score + completedAt
  const now = new Date();
  for (const p of participations) {
    const answers = (p.answers as Record<string, Answer>) ?? {};
    let score = 0;
    for (const q of questions) {
      const opts = isOptionArray(q.options) ? q.options : [];
      score += scoreAnswer(q.type, opts, answers[q.id], q.points);
    }
    await prisma.participation.update({
      where: { id: p.id },
      data: { score, completedAt: now },
    });
  }

  // 4. Marquer le quizz comme FINISHED
  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      status: "FINISHED",
      liveState: INITIAL_LIVE_STATE as unknown as Prisma.InputJsonValue,
    },
  });

  // 5. Broadcast aux clients SSE
  broadcastState(quizId, "FINISHED", -1, false, totalQuestions);

  // 6. Revalidate les pages côté admin ET joueur (utilise le helper qui
  // sait que la page joueur utilise le CODE, pas l'ID)
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { code: true },
  });
  if (quiz?.code) revalidateAllForQuiz(quizId, quiz.code);
}

export async function finishLiveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string") throw new Error("Quizz manquant.");

  const quiz = await getOwnedQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");

  await finishLiveInternal(quizId, quiz._count.questions);
}

// -----------------------------------------------------
// RESET (replonge en PUBLISHED, supprime les participations)
// -----------------------------------------------------

export async function resetLiveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string") throw new Error("Quizz manquant.");

  const quiz = await getOwnedQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");

  // Supprime toutes les participations + remet le quizz en PUBLISHED
  await prisma.$transaction([
    prisma.participation.deleteMany({ where: { quizId } }),
    prisma.quiz.update({
      where: { id: quizId },
      data: {
        status: "PUBLISHED",
        liveState: INITIAL_LIVE_STATE as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  broadcastState(quizId, "PUBLISHED", -1, false, quiz._count.questions);
  revalidateAllForQuiz(quizId, quiz.code);
}
