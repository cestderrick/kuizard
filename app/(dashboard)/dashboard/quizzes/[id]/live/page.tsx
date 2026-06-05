import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseLiveState } from "@/lib/live/state";
import { Button } from "@/components/ui/button";
import { LiveAdminPanel } from "@/components/quiz/live-admin-panel";

export const metadata: Metadata = {
  title: "Pilotage live",
};

export default async function LiveAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const quiz = await prisma.quiz.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      code: true,
      title: true,
      mode: true,
      status: true,
      liveState: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, order: true, text: true, type: true },
      },
    },
  });

  if (!quiz) notFound();

  if (quiz.mode !== "LIVE_MANUAL") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center flex flex-col gap-4">
        <h1 className="font-display text-2xl">Pas de pilotage live</h1>
        <p className="text-muted-foreground">
          Ce quizz est en mode <strong>créneau horaire</strong>. Pour piloter
          live, repasse le mode sur <em>« 🎩 Pilotage live »</em> dans les
          paramètres.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
            ← Retour à l'édition
          </Link>
        </Button>
      </div>
    );
  }

  if (quiz.status === "DRAFT") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center flex flex-col gap-4">
        <h1 className="font-display text-2xl">Quizz pas encore publié</h1>
        <p className="text-muted-foreground">
          Publie d'abord le quizz pour pouvoir le piloter en live.
        </p>
        <Button asChild>
          <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
            ← Aller à l'édition
          </Link>
        </Button>
      </div>
    );
  }

  const liveState = parseLiveState(quiz.liveState);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <Link
          href={`/dashboard/quizzes/${quiz.id}/edit`}
          className="hover:text-[var(--color-violet-primary)] truncate"
        >
          {quiz.title}
        </Link>
        <span>›</span>
        <span>Pilotage live</span>
      </div>

      <LiveAdminPanel
        quizId={quiz.id}
        code={quiz.code}
        title={quiz.title}
        questions={quiz.questions}
        initialState={{
          status: quiz.status,
          currentQuestionIndex: liveState.currentQuestionIndex,
          isPaused: liveState.isPaused,
          totalQuestions: quiz.questions.length,
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/q/${quiz.code}/classement`} target="_blank">
            🏆 Voir le classement
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
            ← Retour à l'édition
          </Link>
        </Button>
      </div>
    </div>
  );
}
