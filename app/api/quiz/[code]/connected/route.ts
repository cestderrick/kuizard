// V31 : Endpoint nombre de participants connectés au flux SSE
// GET /api/quiz/[code]/connected → { count: number }
// Compte les VRAIS participants (Participation actifs) et non plus les
// SSE subscribers (ce qui incluait les admins ouvrant /edit ou /live).

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Fenêtre d'activité considérée comme "connecté" (en ms)
const ACTIVITY_WINDOW_MS = 60 * 1000;

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true },
  });
  if (!quiz) {
    return new Response(JSON.stringify({ count: 0 }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cutoff = new Date(Date.now() - ACTIVITY_WINDOW_MS);
  const count = await prisma.participation.count({
    where: {
      quizId: quiz.id,
      lastActivityAt: { gte: cutoff },
    },
  });
  return new Response(JSON.stringify({ count }), {
    headers: { "Content-Type": "application/json" },
  });
}
