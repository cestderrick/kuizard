import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DuplicateButton } from "@/components/library/duplicate-button";
import { getBillingContext } from "@/lib/billing/context";
import { getActiveWeeklyFeatured } from "@/lib/weekly/featured";
import { WeeklyFeaturedPill } from "@/components/weekly/weekly-featured-pill";

export const metadata: Metadata = {
  title: "Quizthèque",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function LibraryBrowserPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; lang?: string; access?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tag, lang, access } = await searchParams;
  const billing = await getBillingContext(session.user.id);
  const weeklyFeatured = await getActiveWeeklyFeatured();

  const where: Record<string, unknown> = {
    isLibrary: true,
    status: { in: ["PUBLISHED", "RUNNING", "FINISHED"] },
  };
  if (tag) {
    (where as { libraryTags?: { has: string } }).libraryTags = { has: tag };
  }
  if (lang) where.libraryLanguage = lang;
  if (access === "free") where.libraryIsPremium = false;
  if (access === "premium") where.libraryIsPremium = true;

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
      libraryIsPremium: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  // V26 : split nouveautés (< 30 jours) / reste
  const now = Date.now();
  const newQuizzes = quizzes.filter(
    (q) => now - q.createdAt.getTime() < THIRTY_DAYS_MS
  );
  const olderQuizzes = quizzes.filter(
    (q) => now - q.createdAt.getTime() >= THIRTY_DAYS_MS
  );

  // Tous les tags uniques pour le filtre
  const allTags = Array.from(
    new Set(
      (
        await prisma.quiz.findMany({
          where: {
            isLibrary: true,
            status: { in: ["PUBLISHED", "RUNNING", "FINISHED"] },
          },
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
          📚 Quizthèque
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Quizz tout faits, prêts à l'emploi
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Des quizz complets prêts à l'emploi (questions, réponses, ambiance).
          Duplique-les dans ton compte pour les utiliser ou les adapter.
        </p>
      </header>

      {/* V29.2 : Quizz de la semaine en évidence */}
      {weeklyFeatured && (
        <WeeklyFeaturedPill data={weeklyFeatured} variant="banner" />
      )}

      {/* V26 : Filtre accès gratuit / premium */}
      <section className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-2">
          Accès :
        </span>
        <Link
          href={`/dashboard/quizzes/library${tag ? `?tag=${encodeURIComponent(tag)}` : ""}`}
          className={`text-xs px-3 py-1 rounded-full transition ${
            !access
              ? "bg-[var(--color-violet-primary)] text-white"
              : "bg-white border border-violet-100 hover:border-[var(--color-violet-primary)]"
          }`}
        >
          Tous
        </Link>
        <Link
          href={`/dashboard/quizzes/library?access=free${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
          className={`text-xs px-3 py-1 rounded-full transition ${
            access === "free"
              ? "bg-green-600 text-white"
              : "bg-white border border-violet-100 hover:border-green-600"
          }`}
        >
          🆓 Gratuits
        </Link>
        <Link
          href={`/dashboard/quizzes/library?access=premium${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
          className={`text-xs px-3 py-1 rounded-full transition ${
            access === "premium"
              ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)]"
              : "bg-white border border-violet-100 hover:border-[var(--color-gold)]"
          }`}
        >
          🔒 Premium
        </Link>
      </section>

      {/* Filtres tags */}
      {allTags.length > 0 && (
        <section className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-2">
            Thème :
          </span>
          <Link
            href={`/dashboard/quizzes/library${access ? `?access=${access}` : ""}`}
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
              href={`/dashboard/quizzes/library?tag=${encodeURIComponent(t)}${access ? `&access=${access}` : ""}`}
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

      {/* V26 : Section Nouveautés du mois */}
      {newQuizzes.length > 0 && (
        <section>
          <h2
            className="font-display text-xl font-bold tracking-wide mb-3 flex items-center gap-2"
            style={{ color: "var(--color-violet-deep)" }}
          >
            ✨ Nouveautés du mois
            <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-normal">
              ({newQuizzes.length} ajouté{newQuizzes.length > 1 ? "s" : ""} récemment)
            </span>
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newQuizzes.map((q) => (
              <QuizCard
                key={q.id}
                q={q}
                isSubscriber={billing.hasActiveSubscription}
                showNewBadge
              />
            ))}
          </ul>
        </section>
      )}

      {/* Grille des autres quizz */}
      {olderQuizzes.length === 0 && newQuizzes.length === 0 ? (
        <div className="rounded-2xl bg-white border p-12 text-center">
          <p className="text-2xl mb-3">📚</p>
          <p className="font-semibold mb-2">La quizthèque est vide pour l'instant</p>
          <p className="text-sm text-muted-foreground">
            {tag || access
              ? "Aucun quizz pour ce filtre. Essaie un autre critère."
              : "Reviens bientôt — l'équipe Kuizard ajoute régulièrement de nouveaux quizz prêts à l'emploi."}
          </p>
        </div>
      ) : olderQuizzes.length > 0 ? (
        <section>
          {newQuizzes.length > 0 && (
            <h2
              className="font-display text-xl font-bold tracking-wide mb-3"
              style={{ color: "var(--color-violet-deep)" }}
            >
              📚 Toute la quizthèque
            </h2>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {olderQuizzes.map((q) => (
              <QuizCard
                key={q.id}
                q={q}
                isSubscriber={billing.hasActiveSubscription}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type QuizCardData = {
  id: string;
  title: string;
  code: string;
  coverImageUrl: string | null;
  libraryDescription: string | null;
  libraryTags: string[];
  libraryLanguage: string | null;
  libraryIsPremium: boolean;
  createdAt: Date;
  _count: { questions: number };
};

function QuizCard({
  q,
  isSubscriber,
  showNewBadge,
}: {
  q: QuizCardData;
  isSubscriber: boolean;
  showNewBadge?: boolean;
}) {
  const isLocked = q.libraryIsPremium && !isSubscriber;
  return (
    <li className="rounded-2xl bg-white border overflow-hidden flex flex-col relative">
      {/* Badges en haut à droite */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-end">
        {showNewBadge && (
          <span
            className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full font-bold shadow"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            ✨ Nouveau
          </span>
        )}
        {q.libraryIsPremium ? (
          <span
            className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full font-bold shadow"
            style={{
              backgroundColor: "rgba(85,35,187,0.95)",
              color: "white",
            }}
          >
            🔒 Premium
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full font-bold shadow bg-green-600 text-white">
            🆓 Gratuit
          </span>
        )}
      </div>

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
          {isLocked ? (
            <Link
              href="/tarifs#abonnements"
              className="inline-flex items-center justify-center w-full rounded-lg px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              🔒 S'abonner pour débloquer
            </Link>
          ) : (
            <DuplicateButton libraryQuizId={q.id} />
          )}
        </div>
      </div>
    </li>
  );
}
