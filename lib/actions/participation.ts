"use server";

// =============================================
// Server Actions — Participation publique
// =============================================
// Pas d'auth requise : on identifie le joueur par un cookie qui pointe vers son
// Participation en BDD. Ça permet de revenir voir son score si on revient sur le
// lien plus tard.

import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

const COOKIE_PREFIX = "kz_play_"; // un cookie par quizId

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

/**
 * Normalise un texte pour comparaison "tolérante" : sans accents, en minuscule,
 * sans espaces de bordure.
 */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

type StoredOption = { label: string; isCorrect: boolean };

type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string };

function isOptionArray(v: unknown): v is StoredOption[] {
  return (
    Array.isArray(v) &&
    v.every(
      (o) =>
        typeof o === "object" &&
        o !== null &&
        typeof (o as StoredOption).label === "string" &&
        typeof (o as StoredOption).isCorrect === "boolean"
    )
  );
}

function scoreAnswer(
  type: string,
  options: StoredOption[],
  answer: Answer | undefined,
  points: number
): number {
  if (!answer) return 0;

  if (type === "TEXT") {
    if (answer.type !== "text") return 0;
    const expected = options[0]?.label ?? "";
    return normalize(answer.value) === normalize(expected) ? points : 0;
  }

  if (answer.type !== "choice") return 0;
  const selectedSet = new Set(answer.selectedIndices);
  const correctSet = new Set(
    options.map((o, i) => (o.isCorrect ? i : -1)).filter((i) => i >= 0)
  );

  if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
    if (selectedSet.size !== 1) return 0;
    const [picked] = selectedSet;
    return correctSet.has(picked) ? points : 0;
  }

  if (type === "MULTIPLE_CHOICE") {
    if (selectedSet.size !== correctSet.size) return 0;
    for (const i of selectedSet) {
      if (!correctSet.has(i)) return 0;
    }
    return points;
  }

  return 0;
}

// -----------------------------------------------------
// CREATE PARTICIPATION (entrée joueur)
// -----------------------------------------------------

export type StartState = {
  ok: boolean;
  message?: string;
  participationId?: string;
};

export async function startParticipationAction(
  _prev: StartState,
  formData: FormData
): Promise<StartState> {
  const code = formData.get("code");
  const nickname = formData.get("nickname");

  if (typeof code !== "string" || !code) {
    return { ok: false, message: "Code de quizz manquant." };
  }
  if (typeof nickname !== "string" || nickname.trim().length < 2) {
    return {
      ok: false,
      message: "Pseudo trop court (minimum 2 caractères).",
    };
  }
  if (nickname.length > 40) {
    return { ok: false, message: "Pseudo trop long (max 40 caractères)." };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true, status: true },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };
  if (quiz.status !== "PUBLISHED" && quiz.status !== "RUNNING") {
    return { ok: false, message: "Ce quizz n'est pas actif." };
  }

  const trimmedNickname = nickname.trim();
  const cookieStorePre = await cookies();
  const existingCookieParticipationId = cookieStorePre.get(
    COOKIE_PREFIX + quiz.id
  )?.value;

  // Vérifier l'unicité du pseudo (insensitive à la casse).
  // Si une participation existe avec ce pseudo MAIS qu'elle correspond au
  // cookie de cette session, on autorise (cas typique : l'utilisateur revient
  // sur le lien dans le même navigateur).
  const existingWithSameNickname = await prisma.participation.findFirst({
    where: {
      quizId: quiz.id,
      nickname: { equals: trimmedNickname, mode: "insensitive" },
    },
    select: { id: true, completedAt: true },
  });

  if (existingWithSameNickname) {
    if (existingWithSameNickname.id === existingCookieParticipationId) {
      // C'est lui/elle qui revient sur le même navigateur — on réutilise sa
      // participation existante au lieu d'en recréer une.
      return { ok: true, participationId: existingWithSameNickname.id };
    }
    return {
      ok: false,
      message:
        existingWithSameNickname.completedAt
          ? `Ce pseudo est déjà pris par quelqu'un qui a terminé le quizz. Choisis-en un autre.`
          : `Ce pseudo est en cours d'utilisation. Choisis-en un autre.`,
    };
  }

  const participation = await prisma.participation.create({
    data: {
      quizId: quiz.id,
      nickname: trimmedNickname,
      score: 0,
      answers: {},
    },
  });

  // Cookie de session participation (1 mois)
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_PREFIX + quiz.id, participation.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: "/",
  });

  return { ok: true, participationId: participation.id };
}

// -----------------------------------------------------
// SUBMIT ANSWERS (envoi de toutes les réponses + calcul score)
// -----------------------------------------------------

export type SubmitState = {
  ok: boolean;
  message?: string;
  score?: number;
  total?: number;
};

export async function submitAnswersAction(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const code = formData.get("code");
  const participationId = formData.get("participationId");
  const answersJson = formData.get("answersJson");

  if (typeof code !== "string" || !code) {
    return { ok: false, message: "Code manquant." };
  }
  if (typeof participationId !== "string" || !participationId) {
    return { ok: false, message: "Participation introuvable." };
  }
  if (typeof answersJson !== "string") {
    return { ok: false, message: "Réponses invalides." };
  }

  let answers: Record<string, Answer>;
  try {
    answers = JSON.parse(answersJson);
  } catch {
    return { ok: false, message: "Réponses corrompues." };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          points: true,
          options: true,
        },
      },
    },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };
  if (quiz.status !== "PUBLISHED" && quiz.status !== "RUNNING") {
    return { ok: false, message: "Quizz inactif." };
  }

  // Calcul du score
  let score = 0;
  let total = 0;
  for (const q of quiz.questions) {
    total += q.points;
    const opts = isOptionArray(q.options) ? q.options : [];
    score += scoreAnswer(q.type, opts, answers[q.id], q.points);
  }

  await prisma.participation.updateMany({
    where: { id: participationId, quizId: quiz.id },
    data: {
      // Cast vers le type Prisma JSON.
      // Nos Answers sont JSON-serializables par construction (number, string, array).
      answers: answers as unknown as Prisma.InputJsonValue,
      score,
      completedAt: new Date(),
    },
  });

  return { ok: true, score, total };
}

// -----------------------------------------------------
// SAVE PROGRESS (autosave silencieux pour reprise multi-session)
// -----------------------------------------------------
//
// Appelée à intervalles réguliers ou sur changement par le QuizPlayer.
// Ne calcule pas le score, ne marque pas completedAt — on persiste juste
// l'état d'avancement pour pouvoir reprendre après fermeture du navigateur.
// En mode SCHEDULED, tant que le créneau est ouvert, on autorise même la
// modification après "soumission" (completedAt non-null mais SCHEDULED open).

export type SaveProgressState = {
  ok: boolean;
  message?: string;
};

export async function saveProgressAction(
  _prev: SaveProgressState,
  formData: FormData
): Promise<SaveProgressState> {
  const code = formData.get("code");
  const participationId = formData.get("participationId");
  const answersJson = formData.get("answersJson");
  const currentIndexRaw = formData.get("currentQuestionIndex");

  if (typeof code !== "string" || !code) {
    return { ok: false, message: "Code manquant." };
  }
  if (typeof participationId !== "string" || !participationId) {
    return { ok: false, message: "Participation introuvable." };
  }
  if (typeof answersJson !== "string") {
    return { ok: false, message: "Réponses invalides." };
  }

  let answers: Record<string, Answer>;
  try {
    answers = JSON.parse(answersJson);
  } catch {
    return { ok: false, message: "Réponses corrompues." };
  }

  const currentQuestionIndex =
    typeof currentIndexRaw === "string"
      ? Math.max(0, parseInt(currentIndexRaw, 10) || 0)
      : 0;

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      mode: true,
      scheduledCloseAt: true,
    },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };

  // Si SCHEDULED fermé, on bloque l'écriture
  if (
    quiz.mode === "SCHEDULED" &&
    quiz.scheduledCloseAt &&
    new Date() > quiz.scheduledCloseAt
  ) {
    return { ok: false, message: "Le créneau est terminé." };
  }

  await prisma.participation.updateMany({
    where: { id: participationId, quizId: quiz.id },
    data: {
      answers: answers as unknown as Prisma.InputJsonValue,
      currentQuestionIndex,
    },
  });

  return { ok: true };
}

// Note : canModifyAnswers() a été déplacée dans `lib/quiz/can-modify.ts`
// car Next 16 exige que tous les exports d'un fichier "use server" soient
// async — or cette fonction est synchrone.
