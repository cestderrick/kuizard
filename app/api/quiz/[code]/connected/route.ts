// =============================================
// Endpoint — Nombre de participants connectés au flux SSE
// =============================================
// GET /api/quiz/[code]/connected → { count: number }
// Utilisé par le panel admin pour afficher en temps réel le nombre de
// participants présents.

import { prisma } from "@/lib/db";
import { activeSubscriberCount } from "@/lib/live/broadcaster";

export const dynamic = "force-dynamic";

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
  return new Response(
    JSON.stringify({ count: activeSubscriberCount(quiz.id) }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
