import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { QuizPlayer } from "@/components/play/quiz-player";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { title: true, description: true },
  });
  if (!quiz) return { title: "Quizz introuvable" };
  return {
    title: quiz.title,
    description: quiz.description ?? `Joue au quizz ${quiz.title} sur Kuizard !`,
  };
}

export default async function PlayPage({
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
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          options: true,
          points: true,
        },
      },
    },
  });

  if (!quiz) notFound();

  // Pour le MVP : seuls les quizz PUBLISHED ou RUNNING sont jouables
  if (quiz.status !== "PUBLISHED" && quiz.status !== "RUNNING") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)]">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4" aria-hidden>
            🎩
          </div>
          <h1 className="font-display text-2xl mb-2 tracking-wide">
            Ce quizz n'est pas encore actif
          </h1>
          <p className="text-[var(--color-lavender-2)] opacity-80">
            Reviens plus tard, ou demande au créateur du quizz s'il l'a bien
            publié.
          </p>
        </div>
      </main>
    );
  }

  // Sanitize les options envoyées au client : on enlève le flag isCorrect
  const sanitizedQuestions = quiz.questions.map((q) => {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const opts: { label: string }[] = rawOptions
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
      .filter((o): o is { label: string } => o !== null);

    return {
      id: q.id,
      order: q.order,
      type: q.type,
      text: q.text,
      points: q.points,
      // Pour TEXT, on n'envoie pas la réponse attendue (sinon c'est trichable)
      options: q.type === "TEXT" ? [] : opts,
    };
  });

  return (
    <QuizPlayer
      code={quiz.code}
      title={quiz.title}
      description={quiz.description}
      questions={sanitizedQuestions}
    />
  );
}
