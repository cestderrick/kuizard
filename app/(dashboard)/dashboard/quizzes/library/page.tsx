import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DuplicateButton } from "@/components/library/duplicate-button";

export const metadata: Metadata = {
  title: "Banque de quizz",
};

export default async function LibraryBrowserPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; lang?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tag, lang } = await searchParams;

  // Lit les quizz library actifs (PUBLISHED ou RUNNING ou FINISHED — visibles)
  const where: Record<string, unknown> = {
    isLibrary: true,
    status: { in: ["PUBLISHED", "RUNNING", "FINISHED"] },
  };
  if (tag) {
    (where as { libraryTags?: { has: string } }).libraryTags = { has: tag };
  }
  if (lang) where.libraryLanguage = lang;

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      title: true,
      code: true,
      coverImageUrl: true,
      libraryDescription: true,
      libraryTags: true,
      libraryLanguage: true,
      _count: { select: { questions: true } },
    },
  });

  // Collecte tous les tags uniques pour le filtre
  const allTags = Array.from(
    new Set(
      (
        await prisma.quiz.findMany({
          where: { isLibrary: true, status: { in: ["PUBLISHED", "RUNNING", "FINISHED"] } },
          select: { libraryTags: true },
        })
      ).flatMap((q) => q.libraryTags)
    )
  ).sort();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header>
        <Link
          href="/dashboard/quizzes"
          className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
        >
          ← Mes quizz
        </Link>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mt-4 mb-2 font-semibold">
          📚 Banque de quizz
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Quizz tout faits, à dupliquer
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Des quizz complets prêts à l'emploi (questions, réponses, ambiance).
          Duplique-les dans ton compte pour les utiliser tels quels ou les
          adapter à ton événement.
        </p>
      </header>

      {/* Filtres tags */}
      {allTags.length > 0 && (
        <section className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-2">
            Filtrer :
          </span>
          <Link
            href="/dashboard/quizzes/library"
            className={`text-xs px-3 py-1 rounded-full transition ${
              !tag
                ? "bg-[var(--color-violet-primary)] text-white"
                : "bg-white border border-violet-100 hover:border-[var(--color-violet-primary)]"
            }`}
          >
            Tous
          </Link>
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/dashboard/quizzes/library?tag=${encodeURIComponent(t)}`}
              className={`text-xs px-3 py-1 rounded-full transition ${
                tag === t
                  ? "bg-[var(--color-violet-primary)] text-white"
                  : "bg-white border border-violet-100 hover:border-[var(--color-violet-primary)]"
              }`}
            >
              #{t}
            </Link>
          ))}
        </section>
      )}

      {/* Grille des quizz */}
      {quizzes.length === 0 ? (
        <div className="rounded-2xl bg-white border p-12 text-center">
          <p className="text-2xl mb-3">📚</p>
          <p className="font-semibold mb-2">La banque est vide pour l'instant</p>
          <p className="text-sm text-muted-foreground">
            {tag
              ? "Aucun quizz pour ce filtre. Essaie un autre tag."
              : "Reviens bientôt — l'équipe Kuizard ajoute régulièrement de nouveaux quizz prêts à l'emploi."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl bg-white border overflow-hidden flex flex-col"
            >
              {q.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.coverImageUrl}
                  alt={q.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div
                  className="w-full h-40 flex items-center justify-center text-6xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
                  }}
                >
                  🎩
                </div>
              )}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {q.libraryTags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-violet-50 text-[var(--color-violet-primary)] font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3
                  className="font-display text-lg font-bold tracking-wide"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {q.title}
                </h3>
                {q.libraryDescription && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {q.libraryDescription}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {q._count.questions} question
                  {q._count.questions > 1 ? "s" : ""}
                </p>
                <div className="mt-auto pt-3">
                  <DuplicateButton libraryQuizId={q.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
