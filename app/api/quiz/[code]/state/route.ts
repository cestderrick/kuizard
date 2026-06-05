// =============================================
// Endpoint d'état du quizz (fallback du SSE)
// =============================================
// Polled toutes les ~3s par le LivePlayer en complément du SSE, au cas où
// la connexion EventSource est filtrée par un proxy (nginx mal configuré,
// pare-feu d'entreprise, etc.).

import { prisma } from "@/lib/db";
import { parseLiveState } from "@/lib/live/state";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      liveState: true,
      _count: { select: { questions: true } },
    },
  });
  if (!quiz) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const live = parseLiveState(quiz.liveState);
  return new Response(
    JSON.stringify({
      status: quiz.status,
      currentQuestionIndex: live.currentQuestionIndex,
      isPaused: live.isPaused,
      totalQuestions: quiz._count.questions,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}
