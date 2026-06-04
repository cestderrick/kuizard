import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionForm } from "@/components/quiz/question-form";

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

  // Récupérer le quizz + sa question, en vérifiant que tout appartient à l'utilisateur
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: {
      id: true,
      title: true,
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
        },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) notFound();
  const question = quiz.questions[0];

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
        <span>Question {question.order}</span>
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
          <QuestionForm quizId={quizId} question={question} />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="ghost">
          <Link href={`/dashboard/quizzes/${quizId}/edit`}>
            ← Retour à l'éditeur de quizz
          </Link>
        </Button>
      </div>
    </div>
  );
}
