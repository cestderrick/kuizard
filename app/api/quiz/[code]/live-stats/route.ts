// =============================================
// Stats live temps réel pour le pilote LIVE
// =============================================
//
// Endpoint réservé au propriétaire du quizz. Renvoie :
// - Nombre de participants connectés (= participations sans completedAt)
// - Détail des réponses à la question courante (anonymisé : que des compteurs)
//
// Polled toutes les ~2s côté pilote.

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseLiveState } from "@/lib/live/state";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      userId: true,
      status: true,
      liveState: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, options: true },
      },
    },
  });
  if (!quiz) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (quiz.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const live = parseLiveState(quiz.liveState);

  const [allParticipations, totalParticipants, completedParticipants] =
    await Promise.all([
      prisma.participation.findMany({
        where: { quizId: quiz.id },
        select: { answers: true, completedAt: true },
      }),
      prisma.participation.count({ where: { quizId: quiz.id } }),
      prisma.participation.count({
        where: { quizId: quiz.id, completedAt: { not: null } },
      }),
    ]);

  // Calcul de la répartition des réponses pour la question en cours
  let currentDistribution: {
    questionId: string | null;
    type: string | null;
    counts: { label: string; count: number; isCorrect: boolean }[];
    answeredCount: number;
  } = { questionId: null, type: null, counts: [], answeredCount: 0 };

  const currentIndex = live.currentQuestionIndex;
  if (currentIndex >= 0 && currentIndex < quiz.questions.length) {
    const q = quiz.questions[currentIndex];
    const opts = Array.isArray(q.options)
      ? (q.options as { label: string; isCorrect: boolean }[])
      : [];
    const counts = opts.map((o) => ({
      label: o.label,
      count: 0,
      isCorrect: o.isCorrect,
    }));
    let answered = 0;
    for (const p of allParticipations) {
      const ans = (p.answers as Record<string, unknown>) ?? {};
      const myAns = ans[q.id];
      if (!myAns) continue;
      answered++;
      if (
        typeof myAns === "object" &&
        myAns !== null &&
        "type" in myAns &&
        (myAns as { type: string }).type === "choice"
      ) {
        const sel = (myAns as { selectedIndices?: number[] }).selectedIndices;
        if (Array.isArray(sel)) {
          for (const i of sel) {
            if (i >= 0 && i < counts.length) counts[i].count++;
          }
        }
      }
    }
    currentDistribution = {
      questionId: q.id,
      type: q.type,
      counts,
      answeredCount: answered,
    };
  }

  return NextResponse.json(
    {
      status: quiz.status,
      currentQuestionIndex: live.currentQuestionIndex,
      totalQuestions: quiz.questions.length,
      totalParticipants,
      activeParticipants: totalParticipants - completedParticipants,
      completedParticipants,
      currentDistribution,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
