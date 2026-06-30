"use server";

// =============================================
// V55 — Saisir le score reel d'une question SCORE_GUESS apres le match
// =============================================
// L'organisateur cree son quiz pronostic AVANT que le score soit connu.
// Une fois le match termine, il vient saisir le score reel via cette action.
// Le scoring de TOUTES les participations existantes est alors recalcule
// retroactivement pour cette question.

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEditableQuizWhere } from "@/lib/auth/can-edit-quiz";
import {
  parseScoreGuessConfig,
  type ScoreGuessConfig,
} from "@/lib/quiz/score-guess";
import { scoreAnswer, type Answer } from "@/lib/quiz/scoring";

const schema = z.object({
  quizId: z.string().min(1),
  questionId: z.string().min(1),
  // V55 : "" = effacer le score (revenir a "en attente"), sinon entier >= 0
  home: z.string(),
  away: z.string(),
});

export type SetScoreGuessResultState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  /** Nombre de participations dont le score a ete recalcule */
  recalculated?: number;
};

function parseScoreInput(v: string): number | null {
  const trimmed = v.trim();
  if (trimmed === "") return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export async function setScoreGuessResultAction(
  _prev: SetScoreGuessResultState,
  formData: FormData
): Promise<SetScoreGuessResultState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifie." };
  }

  const parsed = schema.safeParse({
    quizId: formData.get("quizId"),
    questionId: formData.get("questionId"),
    home: formData.get("home") ?? "",
    away: formData.get("away") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { quizId, questionId, home, away } = parsed.data;
  const homeVal = parseScoreInput(home);
  const awayVal = parseScoreInput(away);

  // Verifier autorisation (proprietaire ou admin pour moderation)
  const editWhere = await getEditableQuizWhere(quizId, session.user.id);
  if (!editWhere) {
    return { ok: false, message: "Quizz introuvable ou non autorise." };
  }
  const quiz = await prisma.quiz.findFirst({
    where: editWhere,
    select: { id: true, code: true },
  });
  if (!quiz) {
    return { ok: false, message: "Quizz introuvable ou non autorise." };
  }

  // Recuperer la question + verifier qu'elle est bien SCORE_GUESS
  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId: quiz.id },
    select: { id: true, type: true, options: true },
  });
  if (!question) {
    return { ok: false, message: "Question introuvable." };
  }
  if (question.type !== "SCORE_GUESS") {
    return {
      ok: false,
      message: "Cette action est reservee aux questions Find the score.",
    };
  }

  const config = parseScoreGuessConfig(question.options);
  if (!config) {
    return {
      ok: false,
      message: "Configuration SCORE_GUESS invalide pour cette question.",
    };
  }

  // Si les DEUX scores sont vides : on efface le resultat ("retour en attente")
  // Sinon les DEUX doivent etre renseignes
  if ((homeVal === null) !== (awayVal === null)) {
    return {
      ok: false,
      message:
        "Saisis les DEUX scores (ou laisse les deux vides pour revenir en attente).",
    };
  }

  const newConfig: ScoreGuessConfig = {
    ...config,
    expectedHome: homeVal,
    expectedAway: awayVal,
  };

  // 1) Persister la nouvelle config
  await prisma.question.update({
    where: { id: question.id },
    data: { options: newConfig as unknown as object },
  });

  // 2) Recalculer toutes les participations du quiz
  //    On recalcule LE SCORE TOTAL (pas juste cette question) pour rester
  //    coherent meme si d'autres questions avaient un scoring qui depend du
  //    contexte. Charge complete des questions du quiz pour le recompute.
  const allQuestions = await prisma.question.findMany({
    where: { quizId: quiz.id },
    select: { id: true, type: true, options: true, points: true },
    orderBy: { order: "asc" },
  });

  const participations = await prisma.participation.findMany({
    where: { quizId: quiz.id },
    select: { id: true, answers: true, score: true },
  });

  let recalculated = 0;
  for (const p of participations) {
    const userAnswers = (p.answers ?? {}) as Record<string, Answer>;
    let newTotal = 0;
    for (const q of allQuestions) {
      const ans = userAnswers[q.id];
      if (!ans) continue;
      const opts = Array.isArray(q.options)
        ? (q.options as { label: string; isCorrect: boolean }[]).filter(
            (o) =>
              typeof o === "object" &&
              o !== null &&
              typeof o.label === "string" &&
              typeof o.isCorrect === "boolean"
          )
        : [];
      newTotal += scoreAnswer(q.type, opts, ans, q.points, q.options);
    }
    if (newTotal !== p.score) {
      await prisma.participation.update({
        where: { id: p.id },
        data: { score: newTotal },
      });
    }
    recalculated++;
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);
  revalidatePath(`/q/${quiz.code}/classement`);

  const cleared = homeVal === null && awayVal === null;
  return {
    ok: true,
    recalculated,
    message: cleared
      ? `Resultat efface. ${recalculated} participation${recalculated > 1 ? "s" : ""} remise${recalculated > 1 ? "s" : ""} a 0 sur cette question.`
      : `🏆 Score final saisi (${homeVal} - ${awayVal}). ${recalculated} participation${recalculated > 1 ? "s" : ""} recalculee${recalculated > 1 ? "s" : ""}.`,
  };
}
