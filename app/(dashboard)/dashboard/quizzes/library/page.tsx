import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DuplicateButton } from "@/components/library/duplicate-button";
import { getBillingContext } from "@/lib/billing/context";
import { getActiveWeeklyFeatured } from "@/lib/weekly/featured";
import { WeeklyFeaturedPill } from "@/components/weekly/weekly-featured-pill";
import { InstantSearchInput } from "@/components/search/instant-search-input";

export const metadata: Metadata = {
  title: "Quizthèque",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 9;

export default async function LibraryBrowserPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    lang?: string;
    access?: string;
    used?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const sp = await searchParams;
  const search = (sp.q ?? "").trim();
  const tag = sp.tag ?? "";
  const lang = sp.lang ?? "";
  const access = sp.access ?? ""; // "free" | "premium" | ""
  const usedFilter = sp.used ?? ""; // "done" | "todo" | ""
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const billing = await getBillingContext(userId);
  const weeklyFeatured = await getActiveWeeklyFeatured();
  const weeklyQuizId = weeklyFeatured?.quizId ?? null;

  // V30 : participations du user (pour filtre "déjà utilisé" / "non utilisé"
  // ET pour l'historique en haut de page).
  const cookieStore = await cookies();
  // On récupère toutes les participations du user — soit par cookie (kz_play_X)
  // si c'est un quizz joué hors compte, soit par userId (via duplicate).
  // Le plus simple : on liste les Quiz library auxquels il a une Participation
  // avec son nickname OU dont l'ID est dans ses cookies kz_play_.
  const myCookiePartIds = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("kz_play_"))
    .map((c) => c.value);
  const myParticipations = myCookiePartIds.length
    ? await prisma.participation.findMany({
        where: { id: { in: myCookiePartIds } },
        select: { quizId: true },
      })
    : [];
  const myPlayedQuizIds = new Set(myParticipations.map((p) => p.quizId));

  // Construction du where
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
  if (access === "new") {
    where.createdAt = { gte: new Date(Date.now() - THIRTY_DAYS_MS) };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { libraryDescription: { contains: search, mode: "insensitive" } },
    ];
  }
  if (usedFilter === "done" && myPlayedQuizIds.size > 0) {
    where.id = { in: Array.from(myPlayedQuizIds) };
  }
  if (usedFilter === "todo" && myPlayedQuizIds.size > 0) {
    where.id = { notIn: Array.from(myPlayedQuizIds) };
  }
  if (usedFilter === "done" && myPlayedQuizIds.size === 0) {
    // aucun quizz joué → liste vide
    where.id = "__no_match__";
  }

  // Total pour pagination
  const total = await prisma.quiz.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
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

  // Helper : construit une URL en gardant les query params
  function buildUrl(overrides: Record<string, string | null>): string {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (tag) params.set("tag", tag);
    if (lang) params.set("lang", lang);
    if (access) params.set("access", access);
    if (usedFilter) params.set("used", usedFilter);
    if (currentPage > 1) params.set("page", String(currentPage));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    const q = params.toString();
    return q ? `/dashboard/quizzes/library?${q}` : "/dashboard/quizzes/library";
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <header>
        <Link
          href="/dashboard/quizzes"
          className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
        >
          ← Mes quizz
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mt-4 mb-2">
          <div>
            <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-1">
              📚 Quizthèque
            </p>
            <h1
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Quizz tout faits, prêts à l\'emploi
            </h1>
          </div>
          <Link
            href="/dashboard/mes-participations"
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--color-violet-primary)" }}
          >
            🕘 Historique de mes quizz répondus →
          </Link>
        </div>
      </header>

      {/* Quizz de la semaine */}
      {weeklyFeatured && (
        <WeeklyFeaturedPill data={weeklyFeatured} variant="banner" />
      )}

      {/* V39 : Barre de recherche LIVE (debounce 300ms, pas de submit) */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border p-3">
        <span className="text-lg shrink-0" aria-hidden>🔍</span>
        <InstantSearchInput
          placeholder="Rechercher un quizz par titre ou description…"
          className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
      </div>

      {/* Filtres rapides */}
      <section className="flex flex-wrap gap-2 items-center">
        {/* Accès */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-1">
            Accès :
          </span>
          <Link
            href={buildUrl({ access: null, page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              !access
                ? "bg-[var(--color-violet-primary)] text-white"
                : "bg-white border border-violet-100 hover:border-[var(--color-violet-primary)]"
            }`}
          >
            Tous
          </Link>
          <Link
            href={buildUrl({ access: "free", page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              access === "free"
                ? "bg-green-600 text-white"
                : "bg-white border border-violet-100 hover:border-green-600"
            }`}
          >
            🆓 Gratuits
          </Link>
          <Link
            href={buildUrl({ access: "premium", page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              access === "premium"
                ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)]"
                : "bg-white border border-violet-100 hover:border-[var(--color-gold)]"
            }`}
          >
            🔒 Premium
          </Link>
          <Link
            href={buildUrl({ access: "new", page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              access === "new"
                ? "bg-[var(--color-violet-deep)] text-white"
                : "bg-white border border-violet-100 hover:border-[var(--color-violet-deep)]"
            }`}
          >
            ✨ Nouveau
          </Link>
        </div>

        {/* Déjà utilisé / non utilisé */}
        <div className="flex flex-wrap gap-1.5 items-center sm:ml-4">
          <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mr-1">
            Statut :
          </span>
          <Link
            href={buildUrl({ used: null, page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              !usedFilter
                ? "bg-[var(--color-violet-primary)] text-white"
                : "bg-white border border-violet-100"
            }`}
          >
            Tous
          </Link>
          <Link
            href={buildUrl({ used: "todo", page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              usedFilter === "todo"
                ? "bg-blue-600 text-white"
                : "bg-white border border-violet-100 hover:border-blue-600"
            }`}
          >
            ✨ Non utilisés
          </Link>
          <Link
            href={buildUrl({ used: "done", page: null })}
            className={`text-xs px-3 py-1 rounded-full transition ${
              usedFilter === "done"
                ? "bg-zinc-700 text-white"
                : "bg-white border border-violet-100 hover:border-zinc-700"
            }`}
          >
            ✓ Déjà répondus
          </Link>
        </div>

        {tag && (
          <Link
            href={buildUrl({ tag: null, page: null })}
            className="text-xs px-3 py-1 rounded-full bg-[var(--color-violet-primary)] text-white"
          >
            #{tag} ✕
          </Link>
        )}
      </section>

      {/* Compteur + page actuelle */}
      <p className="text-xs text-muted-foreground">
        {total} quizz trouvé{total > 1 ? "s" : ""}
        {totalPages > 1 && (
          <>
            {" "}
            · Page {currentPage} / {totalPages}
          </>
        )}
      </p>

      {/* Grille des quizz */}
      {total === 0 ? (
        <div className="rounded-2xl bg-white border p-12 text-center">
          <p className="text-2xl mb-3">📚</p>
          <p className="font-semibold mb-2">Aucun quizz pour ce filtre</p>
          <p className="text-sm text-muted-foreground">
            Essaie d\'effacer la recherche ou de changer les filtres.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => {
            const isNew = Date.now() - q.createdAt.getTime() < THIRTY_DAYS_MS;
            const alreadyPlayed = myPlayedQuizIds.has(q.id);
            return (
              <QuizCard
                key={q.id}
                q={q}
                isSubscriber={billing.hasActiveSubscription}
                isNew={isNew}
                alreadyPlayed={alreadyPlayed}
                isWeeklyFeatured={q.id === weeklyQuizId}
              />
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-4">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border hover:border-[var(--color-violet-primary)]"
            >
              ← Précédent
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ page: String(currentPage + 1) })}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-[var(--color-violet-primary)] text-white"
            >
              Suivant →
            </Link>
          )}
        </nav>
      )}
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
  isNew,
  alreadyPlayed,
  isWeeklyFeatured,
}: {
  q: QuizCardData;
  isSubscriber: boolean;
  isNew?: boolean;
  alreadyPlayed?: boolean;
  isWeeklyFeatured?: boolean;
}) {
  const isLocked = q.libraryIsPremium && !isSubscriber;
  // V33 : si le quiz est actuellement le featured de la semaine, on le grise
  // pendant tout l'event (l'admin ne doit pas le dupliquer pendant ce temps).
  const isFeatured = !!isWeeklyFeatured;
  // V33 : date de publication formattée
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(q.createdAt);

  return (
    <li
      className="rounded-2xl bg-white border overflow-hidden flex flex-col relative"
      style={{
        opacity: isFeatured ? 0.55 : 1,
        pointerEvents: isFeatured ? "none" : "auto",
      }}
    >
      {isFeatured && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto"
          style={{ background: "rgba(31, 27, 58, 0.7)" }}
        >
          <div
            className="rounded-xl px-4 py-3 text-center max-w-[80%]"
            style={{
              background: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            <p className="text-xs uppercase tracking-[2px] font-bold">
              🎁 Quizz de la semaine
            </p>
            <p className="text-[10px] mt-1">
              Indisponible pendant l'event en cours
            </p>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-end">
        {isNew && (
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
        {alreadyPlayed && (
          <span className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full font-bold shadow bg-zinc-700 text-white">
            ✓ Déjà répondu
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
            <Link
              key={t}
              href={`/dashboard/quizzes/library?tag=${encodeURIComponent(t)}`}
              className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-violet-50 text-[var(--color-violet-primary)] font-semibold hover:bg-violet-100"
            >
              {t}
            </Link>
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
          {q._count.questions > 1 ? "s" : ""} · 📅 publié le {dateStr}
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
              🔒 S\'abonner pour débloquer
            </Link>
          ) : (
            <DuplicateButton libraryQuizId={q.id} />
          )}
        </div>
      </div>
    </li>
  );
}
