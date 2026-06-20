import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createQuestionAction } from "@/lib/actions/question";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionForm } from "@/components/quiz/question-form";
import { getEffectivePlan } from "@/lib/plans/gating";

export const metadata: Metadata = {
  title: "Éditer une question",
};

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id: quizId, qid: questionId } = await params;

  const session = await auth();
  if (!session?.user?.id) notFound();

  // Récupérer le quizz + la question courante + total questions
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: {
      id: true,
      title: true,
      _count: { select: { questions: true } },
      questions: {
        where: { id: questionId },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          points: true,
          timerSeconds: true,
          options: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) notFound();
  const question = quiz.questions[0];

  // V43 : on charge le plan effectif pour griser/débloquer l'upload d'image
  const plan = await getEffectivePlan(quizId);
  const allowImages = plan.limits.questionImages !== false;
  // V47.4 : verrouille les questions au-delà de maxQuestions du plan
  const maxQuestions = plan.limits.maxQuestions ?? 5;
  const isBeyondPlanLimit = question.order > maxQuestions;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <Link
          href={`/dashboard/quizzes/${quizId}/edit`}
          className="hover:text-[var(--color-violet-primary)] truncate max-w-[200px]"
        >
          {quiz.title}
        </Link>
        <span>›</span>
        <span>
          Question {question.order} / {quiz._count.questions}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl tracking-wide">
            Question {question.order}
          </CardTitle>
          <CardDescription>
            Configure le type, les options et le scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionForm
            quizId={quizId}
            question={question}
            allowImages={allowImages}
            planName={plan.name}
            isBeyondPlanLimit={isBeyondPlanLimit}
            maxQuestions={maxQuestions}
          />
        </CardContent>
      </Card>

      {/* Actions de continuité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Continuer ?</CardTitle>
          <CardDescription>
            Crée une nouvelle question ou reviens à la liste.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <form action={createQuestionAction}>
            <input type="hidden" name="quizId" value={quizId} />
            <Button asChild variant="outline">
              <Link href={`/dashboard/quizzes/${quizId}/edit`}>
              ← Voir toutes les questions
              </Link>
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              + Nouvelle question
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
