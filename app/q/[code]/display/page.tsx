import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseTheme } from "@/lib/quiz/theme";
import { parseLiveState } from "@/lib/live/state";
import { generateQrSvg, buildQuizPlayUrl } from "@/lib/quiz/qrcode";
import { TvDisplay } from "@/components/play/tv-display";

export const metadata: Metadata = {
  title: "Affichage TV",
};

export default async function DisplayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      status: true,
      mode: true,
      theme: true,
      liveState: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          points: true,
          options: true,
        },
      },
    },
  });

  if (!quiz) notFound();

  const theme = parseTheme(quiz.theme);
  const liveState = parseLiveState(quiz.liveState);

  // QR code + URL pour l'affichage TV (les joueurs scannent depuis leur place)
  const playUrl = buildQuizPlayUrl(quiz.code);
  const qrSvg = await generateQrSvg(playUrl, {
    color: "#FFFFFF",
    backgroundColor: theme.primaryColor,
    margin: 1,
  });

  // Sanitize : on garde options.label uniquement (pas de isCorrect)
  const sanitizedQuestions = quiz.questions.map((q) => {
    const raw = Array.isArray(q.options) ? q.options : [];
    return {
      id: q.id,
      order: q.order,
      type: q.type,
      text: q.text,
      points: q.points,
      options: raw
        .map((o) => {
          if (
            typeof o === "object" &&
            o !== null &&
            "label" in o &&
            typeof (o as { label: unknown }).label === "string"
          ) {
            return { label: (o as { label: string }).label };
          }
          return null;
        })
        .filter((o): o is { label: string } => o !== null),
    };
  });

  return (
    <TvDisplay
      code={quiz.code}
      title={quiz.title}
      description={quiz.description}
      mode={quiz.mode}
      questions={sanitizedQuestions}
      theme={theme}
      playUrl={playUrl}
      qrSvg={qrSvg}
      initialState={{
        status: quiz.status,
        currentQuestionIndex: liveState.currentQuestionIndex,
        isPaused: liveState.isPaused,
        totalQuestions: sanitizedQuestions.length,
      }}
    />
  );
}
