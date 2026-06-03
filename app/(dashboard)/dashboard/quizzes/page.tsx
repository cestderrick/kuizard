import type { Metadata } from "next";
import Link from "next/link";

import { listMyQuizzes, deleteQuizAction } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mes quizz",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  RUNNING: "En direct",
  FINISHED: "Terminé",
  ARCHIVED: "Archivé",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  PUBLISHED: "bg-violet-100 text-violet-700",
  RUNNING: "bg-green-100 text-green-700",
  FINISHED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-zinc-200 text-zinc-500",
};

const MODE_LABEL: Record<string, string> = {
  LIVE_MANUAL: "Pilotage live",
  SCHEDULED: "Créneau horaire",
};

export default async function QuizzesPage() {
  const quizzes = await listMyQuizzes();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display text-3xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Mes quizz
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {quizzes.length === 0
              ? "Tu n'as pas encore créé de quizz."
              : `${quizzes.length} quizz dans ta collection.`}
          </p>
        </div>

        <Button
          asChild
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          <Link href="/dashboard/quizzes/new">+ Nouveau quizz</Link>
        </Button>
      </div>

      {/* Liste ou état vide */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="text-6xl" aria-hidden>
              🎩
            </div>
            <p className="text-center text-muted-foreground max-w-sm">
              Crée ton premier quizz en quelques minutes — titre, questions,
              thème — et partage-le avec un lien et un QR code.
            </p>
            <Button
              asChild
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              <Link href="/dashboard/quizzes/new">
                Créer mon premier quizz ✨
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-display text-lg tracking-wide truncate">
                      {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium ${
                      STATUS_COLOR[quiz.status] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {STATUS_LABEL[quiz.status] ?? quiz.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono px-2 py-1 bg-zinc-50 rounded">
                    {quiz.code}
                  </span>
                  <span>·</span>
                  <span>{MODE_LABEL[quiz.mode] ?? quiz.mode}</span>
                  <span>·</span>
                  <span>{quiz._count.questions} questions</span>
                  <span>·</span>
                  <span>{quiz._count.participations} joueurs</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                      Éditer
                    </Link>
                  </Button>
                  <form action={deleteQuizAction}>
                    <input type="hidden" name="quizId" value={quiz.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Supprimer
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
