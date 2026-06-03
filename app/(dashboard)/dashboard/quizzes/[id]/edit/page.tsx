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

export const metadata: Metadata = {
  title: "Éditer un quizz",
};

export default async function EditQuizPage({
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
      title: true,
      description: true,
      code: true,
      mode: true,
      status: true,
    },
  });

  if (!quiz) notFound();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <span>{quiz.title}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle
            className="font-display text-2xl tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {quiz.title}
          </CardTitle>
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="font-mono px-2 py-1 bg-zinc-50 rounded">
              {quiz.code}
            </span>
            <span>·</span>
            <span>{quiz.mode === "LIVE_MANUAL" ? "Pilotage live" : "Créneau horaire"}</span>
            <span>·</span>
            <span className="capitalize">{quiz.status.toLowerCase()}</span>
          </div>

          <div className="rounded-xl border-2 border-dashed border-[var(--color-violet-light)] p-6 text-center">
            <div className="text-5xl mb-3" aria-hidden>
              🚧
            </div>
            <p className="font-medium">L'éditeur de questions arrive au Sprint 2.2</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pour l'instant, ton quizz est créé et son code{" "}
              <code className="font-mono">{quiz.code}</code> est réservé.
            </p>
          </div>

          <div className="flex justify-start">
            <Button asChild variant="ghost">
              <Link href="/dashboard/quizzes">← Retour à mes quizz</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
