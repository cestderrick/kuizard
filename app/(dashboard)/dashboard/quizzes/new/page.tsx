import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizCreateForm } from "@/components/quiz/quiz-create-form";

export const metadata: Metadata = {
  title: "Nouveau quizz",
};

export default function NewQuizPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <span>Nouveau</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle
            className="font-display text-2xl tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Créer un nouveau quizz
          </CardTitle>
          <CardDescription>
            Donne-lui un titre et choisis le mode. Tu ajouteras les questions
            juste après.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizCreateForm />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="ghost">
          <Link href="/dashboard/quizzes">← Retour à mes quizz</Link>
        </Button>
      </div>
    </div>
  );
}
