import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { PublicNavbar } from "@/components/nav/public-navbar";
import { SiteFooter } from "@/components/legal/site-footer";
import { KuizardLogo } from "@/components/brand/kuizard-logo";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizthèque — Des quizz prêts à l\'emploi",
  description:
    "Explore la quizthèque Kuizard : des quizz tout prêts (Star Wars, Friends, Harry Potter, cuisine, mode, et plus) à dupliquer dans ton compte.",
  alternates: { canonical: `${BASE_URL}/quiztheque` },
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function PublicQuizthequePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; access?: string }>;
}) {
  const { tag, access } = await searchParams;
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  const where: Record<string, unknown> = {
    isLibrary: true,
    status: { in: ["PUBLISHED", "RUNNING", "FINISHED"] },
  };
  if (tag) (where as { libraryTags?: { has: string } }).libraryTags = { has: tag };
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
      libraryIsPremium: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  const now = Date.now();
  const newQuizzes = quizzes.filter(
    (q) => now - q.createdAt.getTime() < THIRTY_DAYS_MS
  );
  const olderQuizzes = quizzes.filter(
    (q) => now - q.createdAt.getTime() >= THIRTY_DAYS_MS
  );

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
    <main className="min-h-screen bg-[var(--color-lavender)]">
      <PublicNavbar />
      <TopLocaleBar variant="light" />

      {/* HERO */}
      <section className="px-4 pt-12 pb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6"
          style={{ color: "var(--color-violet-deep)" }}
        >
          <KuizardLogo size={36} />
          <span className="font-display text-xl font-bold tracking-[3px]">
            Kuizard
          </span>
        </Link>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
          📚 Quizthèque
        </p>
        <h1
          className="font-display text-3xl md:text-5xl font-bold tracking-wide mb-3"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Des quizz prêts à l\'emploi
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Explore la quizthèque : Star Wars, Harry Potter, Tarantino, cuisine,
          tueurs célèbres et bien plus. Duplique-les dans ton compte pour les
          jouer en live ou sur créneau horaire.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16 flex flex-col gap-6">
        {/* Filtre accès */}
        <section className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-2">
            Accès :
          </span>
          <Link
            href={`/quiztheque${tag ? `?tag=${encodeURIComponent(tag)}` : ""}`}
            className={`text-xs px-3 py-1 rounded-full transition ${
              !access
                ? "bg-[var(--color-violet-primary)] text-white"
                : "bg-white border border-violet-100 hover:border-[var(--color-violet-primary)]"
            }`}
          >
            Tous
          </Link>
          <Link
            href={`/quiztheque?access=free${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
            className={`text-xs px-3 py-1 rounded-full transition ${
              access === "free"
                ? "bg-green-600 text-white"
                : "bg-white border border-violet-100 hover:border-green-600"
            }`}
          >
            🆓 Gratuits
          </Link>
          <Link
            href={`/quiztheque?access=premium${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
            className={`text-xs px-3 py-1 rounded-full transition ${
              access === "premium"
                ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)]"
                : "bg-white border border-violet-100 hover:border-[var(--color-gold)]"
            }`}
          >
            🔒 Premium
          </Link>
        </section>

        {/* Tags */}
        {allTags.length > 0 && (
          <section className="flex flex-wrap gap-2 items-center justify-center">
            <Link
              href={`/quiztheque${access ? `?access=${access}` : ""}`}
              className={`text-xs px-3 py-1 rounded-full transition ${
                !tag
                  ? "bg-[var(--color-violet-primary)] text-white"
                  : "bg-white border border-violet-100"
              }`}
            >
              Tous thèmes
            </Link>
            {allTags.slice(0, 20).map((t) => (
              <Link
                key={t}
                href={`/quiztheque?tag=${encodeURIComponent(t)}${access ? `&access=${access}` : ""}`}
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

        {/* Nouveautés du mois */}
        {newQuizzes.length > 0 && (
          <section>
            <h2
              className="font-display text-xl font-bold tracking-wide mb-3 flex items-center gap-2"
              style={{ color: "var(--color-violet-deep)" }}
            >
              ✨ Nouveautés du mois
              <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-normal">
                ({newQuizzes.length})
              </span>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newQuizzes.map((q) => (
                <QuiztequeCard key={q.id} q={q} isLoggedIn={isLoggedIn} showNewBadge />
              ))}
            </ul>
          </section>
        )}

        {olderQuizzes.length === 0 && newQuizzes.length === 0 ? (
          <div className="rounded-2xl bg-white border p-12 text-center">
            <p className="text-2xl mb-3">📚</p>
            <p className="font-semibold mb-2">La quizthèque est vide pour ce filtre</p>
            <p className="text-sm text-muted-foreground">
              Essaie un autre tag ou reviens bientôt — l\'équipe Kuizard ajoute
              régulièrement de nouveaux quizz.
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
                <QuiztequeCard key={q.id} q={q} isLoggedIn={isLoggedIn} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}

type CardData = {
  id: string;
  title: string;
  code: string;
  coverImageUrl: string | null;
  libraryDescription: string | null;
  libraryTags: string[];
  libraryIsPremium: boolean;
  createdAt: Date;
  _count: { questions: number };
};

function QuiztequeCard({
  q,
  isLoggedIn,
  showNewBadge,
}: {
  q: CardData;
  isLoggedIn: boolean;
  showNewBadge?: boolean;
}) {
  // CTA selon contexte :
  // - Premium → bouton "S\'abonner pour débloquer" → /tarifs#abonnements
  // - Gratuit + connecté → "Ajouter à mes quizz" (duplicate, page dashboard)
  // - Gratuit + visiteur → "Créer un compte gratuit pour l\'utiliser"
  const ctaHref = q.libraryIsPremium
    ? "/tarifs#abonnements"
    : isLoggedIn
    ? "/dashboard/quizzes/library"
    : `/signup?next=${encodeURIComponent("/dashboard/quizzes/library")}`;
  const ctaLabel = q.libraryIsPremium
    ? "🔒 S\'abonner pour débloquer"
    : isLoggedIn
    ? "+ Ajouter à mes quizz"
    : "🆓 Créer un compte gratuit";

  return (
    <li className="rounded-2xl bg-white border overflow-hidden flex flex-col relative">
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
        <img src={q.coverImageUrl} alt={q.title} className="w-full h-40 object-cover" />
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
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center w-full rounded-lg px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
            style={{
              backgroundColor: q.libraryIsPremium
                ? "var(--color-gold)"
                : "var(--color-violet-primary)",
              color: q.libraryIsPremium ? "var(--color-violet-deep)" : "white",
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </li>
  );
}
