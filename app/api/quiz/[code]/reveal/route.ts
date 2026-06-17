// =============================================
// Endpoint de révélation d'une réponse — mode LIVE_MANUAL
// =============================================
// Le joueur fetche cet endpoint pour savoir quelles options étaient
// correctes, soit :
//   - quand le timer de la question expire (côté client),
//   - soit quand l'admin passe à la question suivante,
//   - soit quand le quizz est FINISHED.
//
// Sécurité : on ne révèle JAMAIS si on est encore sur la question demandée
// et que son timer n'est pas écoulé (sinon triche possible).

import { prisma } from "@/lib/db";
import { parseLiveState } from "@/lib/live/state";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const url = new URL(request.url);
  const indexRaw = url.searchParams.get("index");
  const index = indexRaw ? parseInt(indexRaw, 10) : NaN;
  if (!Number.isFinite(index) || index < 0) {
    return Response.json({ error: "bad_index" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      mode: true,
      liveState: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, options: true },
      },
    },
  });
  if (!quiz) return Response.json({ error: "not_found" }, { status: 404 });

  const q = quiz.questions[index];
  if (!q) return Response.json({ error: "out_of_range" }, { status: 404 });

  // Gating : on autorise la révélation si...
  const live = parseLiveState(quiz.liveState);
  const allowed =
    quiz.status === "FINISHED" ||
    // L'admin a déjà passé à une question ultérieure
    (quiz.status === "RUNNING" && live.currentQuestionIndex > index) ||
    // On est encore sur cette question MAIS le timer (si défini) est écoulé.
    // Le timer côté serveur : on lit la question pour son timerSeconds et on
    // calcule l'expiration à partir de questionOpenedAt.
    (quiz.status === "RUNNING" &&
      live.currentQuestionIndex === index &&
      (await isCurrentTimerExpired(quiz.id, index, live.questionOpenedAt)));

  if (!allowed) {
    return Response.json({ revealed: false }, { status: 200 });
  }

  const opts = Array.isArray(q.options) ? q.options : [];
  const correctIndices: number[] = [];
  let correctText: string | null = null;
  opts.forEach((o, i) => {
    if (
      typeof o === "object" &&
      o !== null &&
      "isCorrect" in o &&
      (o as { isCorrect?: boolean }).isCorrect
    ) {
      correctIndices.push(i);
    }
  });
  if (q.type === "TEXT" && opts[0] && typeof opts[0] === "object" && "label" in opts[0]) {
    correctText = (opts[0] as { label: string }).label;
  }
  return Response.json({
    revealed: true,
    correctIndices,
    correctText,
  });
}

async function isCurrentTimerExpired(
  quizId: string,
  index: number,
  openedAtIso: string | null
): Promise<boolean> {
  if (!openedAtIso) return false;
  const question = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { order: "asc" },
    skip: index,
    take: 1,
    select: { timerSeconds: true },
  });
  const timer = question?.timerSeconds;
  if (!timer || timer <= 0) return false; // pas de timer = jamais "expiré"
  const startedAt = new Date(openedAtIso).getTime();
  const endAt = startedAt + timer * 1000;
  return Date.now() >= endAt;
}
