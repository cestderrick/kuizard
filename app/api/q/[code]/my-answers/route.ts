import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Option = { label: string; isCorrect?: boolean };
type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string };

/**
 * GET /api/q/[code]/my-answers?participationId=xxx
 *
 * Retourne le détail des réponses du participant + les bonnes réponses,
 * UNIQUEMENT si la participation est marquée comme terminée (completedAt).
 * Avant la fin du quiz, on n'expose pas les solutions.
 *
 * Pour mode LIVE_MANUAL : la participation devient "completedAt" quand
 * l'admin clique "Terminer" sur le panel live. Pour SCHEDULED : quand le
 * créneau est passé (vérifié par cron + à la fin de chaque participation).
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const url = new URL(req.url);
  const participationId = url.searchParams.get("participationId");

  if (!participationId) {
    return NextResponse.json(
      { ok: false, error: "Missing participationId" },
      { status: 400 }
    );
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      status: true,
      mode: true,
      scheduledCloseAt: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          points: true,
          options: true,
          // V54 — explication facultative pour le panneau "Mes reponses"
          explanation: true,
        },
      },
    },
  });
  if (!quiz) {
    return NextResponse.json(
      { ok: false, error: "Quiz introuvable" },
      { status: 404 }
    );
  }

  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    select: {
      id: true,
      quizId: true,
      nickname: true,
      answers: true,
      completedAt: true,
      score: true,
    },
  });
  if (!participation || participation.quizId !== quiz.id) {
    return NextResponse.json(
      { ok: false, error: "Participation introuvable" },
      { status: 404 }
    );
  }

  // Gating : on ne révèle les bonnes réponses QUE si la participation est
  // terminée ET que le quiz a été clôturé (LIVE_MANUAL FINISHED ou SCHEDULED
  // dont la date de clôture est passée).
  const now = new Date();
  const quizFinished =
    quiz.status === "FINISHED" ||
    (quiz.mode === "SCHEDULED" &&
      quiz.scheduledCloseAt !== null &&
      quiz.scheduledCloseAt < now);
  if (!participation.completedAt || !quizFinished) {
    return NextResponse.json(
      {
        ok: false,
        error: "Les réponses ne seront révélées qu'à la fin du quizz.",
        waiting: true,
      },
      { status: 403 }
    );
  }

  // Cast des answers (stockés en Json)
  const userAnswers = (participation.answers ?? {}) as Record<string, Answer>;

  const breakdown = quiz.questions.map((q) => {
    const options = (q.options as Option[]) ?? [];
    const correctIndices = options
      .map((o, i) => (o.isCorrect ? i : -1))
      .filter((i) => i >= 0);
    const userAns = userAnswers[q.id];

    let userSelectedIndices: number[] = [];
    let userText: string | null = null;
    let isCorrect = false;

    if (userAns) {
      if (userAns.type === "choice") {
        userSelectedIndices = userAns.selectedIndices ?? [];
        // Pour SINGLE/MULTIPLE/TRUE_FALSE : correct si l'ensemble matche
        // exactement les correctIndices
        const sortedUser = [...userSelectedIndices].sort();
        const sortedCorrect = [...correctIndices].sort();
        isCorrect =
          sortedUser.length === sortedCorrect.length &&
          sortedUser.every((v, i) => v === sortedCorrect[i]);
      } else if (userAns.type === "text") {
        userText = userAns.value;
        // Pour TEXT, on n'a pas de "bonne réponse" stricte côté schema
        // donc on laisse isCorrect à null (= manuel / pas de check auto)
        isCorrect = false;
      }
    }

    return {
      id: q.id,
      order: q.order,
      type: q.type,
      text: q.text,
      points: q.points,
      options: options.map((o) => o.label),
      correctIndices,
      userSelectedIndices,
      userText,
      isCorrect,
      answered: !!userAns,
      // V54 — explication facultative
      explanation: q.explanation ?? null,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      participation: {
        nickname: participation.nickname,
        score: participation.score,
        completedAt: participation.completedAt,
      },
      breakdown,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
