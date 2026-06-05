import type { Metadata } from "next";
import Link from "next/link";

import { QUIZ_TEMPLATES } from "@/lib/quiz/templates";
import { createFromTemplateAction } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Templates de quizz",
};

export default function TemplatesPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <span>Templates</span>
      </div>

      <header>
        <h1
          className="font-display text-3xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          ✨ Templates de quizz
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Choisis un template pour démarrer rapidement. Tu pourras tout
          modifier après création (titre, questions, photos, lots, couleurs,
          etc.).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUIZ_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.slug}
            className="flex flex-col hover:shadow-lg transition-shadow"
            style={{
              borderTopWidth: 4,
              borderTopColor: tpl.themeColor,
              borderTopStyle: "solid",
            }}
          >
            <CardHeader>
              <div className="text-4xl mb-2" aria-hidden>
                {tpl.emoji}
              </div>
              <CardTitle className="font-display tracking-wide">
                {tpl.title}
              </CardTitle>
              <CardDescription>{tpl.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                  {tpl.questions.length} questions incluses
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 line-clamp-4">
                  {tpl.questions.slice(0, 3).map((q, i) => (
                    <li key={i} className="truncate">
                      · {q.text}
                    </li>
                  ))}
                  {tpl.questions.length > 3 && (
                    <li className="text-xs italic">
                      … et {tpl.questions.length - 3} de plus
                    </li>
                  )}
                </ul>
              </div>
              <form action={createFromTemplateAction}>
                <input type="hidden" name="slug" value={tpl.slug} />
                <Button
                  type="submit"
                  className="w-full font-bold"
                  style={{
                    backgroundColor: tpl.themeColor,
                    color: "white",
                  }}
                >
                  ✨ Utiliser ce template
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/dashboard/quizzes/new">
            Créer un quizz vierge à la place
          </Link>
        </Button>
      </div>
    </div>
  );
}
