// =============================================
// Endpoint SSE — état temps réel d'un quizz live
// =============================================
// GET /api/quiz/[code]/stream
// Renvoie un flux Server-Sent Events qui pousse l'état du quizz :
//   data: {"type":"state","status":"RUNNING","currentQuestionIndex":2,...}
//
// Côté client :
//   const es = new EventSource("/api/quiz/CODE/stream")
//   es.onmessage = (e) => { const state = JSON.parse(e.data); ... }

import type { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { subscribe } from "@/lib/live/broadcaster";
import { parseLiveState, type LiveBroadcast } from "@/lib/live/state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Node runtime requis (pas Edge) pour les streams longue durée

export async function GET(
  request: NextRequest,
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
    return new Response("Quizz introuvable", { status: 404 });
  }

  const encoder = new TextEncoder();
  let heartbeat: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let isClosed = false;
      const safeEnqueue = (chunk: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          isClosed = true;
        }
      };

      // 1. Envoyer immédiatement l'état actuel
      const liveState = parseLiveState(quiz.liveState);
      const initial: LiveBroadcast = {
        type: "state",
        status: quiz.status,
        currentQuestionIndex: liveState.currentQuestionIndex,
        isPaused: liveState.isPaused,
        totalQuestions: quiz._count.questions,
      };
      safeEnqueue(`retry: 3000\n\n`);
      safeEnqueue(`data: ${JSON.stringify(initial)}\n\n`);

      // 2. S'abonner aux broadcasts
      const { unsubscribe } = subscribe(quiz.id, safeEnqueue);

      // 3. Heartbeat toutes les 25 secondes (au cas où nginx ferme les
      // connexions idles, et pour détecter les déco côté serveur).
      heartbeat = setInterval(() => {
        safeEnqueue(`: heartbeat\n\n`);
      }, 25000);

      // 4. Cleanup à la déconnexion du client
      request.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe();
        isClosed = true;
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // dit à nginx de ne pas buffer (proxy)
    },
  });
}
