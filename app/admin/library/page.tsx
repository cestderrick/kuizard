import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { InstantSearchInput } from "@/components/search/instant-search-input";

export const metadata: Metadata = {
  title: "Admin · Banque de quizz",
};

export default async function AdminLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  await requireAdmin();

  const sp = searchParams ? await searchParams : {};
  const search = (sp.q ?? "").trim();

  // V32 : filtre par recherche sur titre/description/tags
  const where: Record<string, unknown> = { isLibrary: true };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { libraryDescription: { contains: search, mode: "insensitive" } },
      { libraryTags: { has: search.toLowerCase() } },
    ];
  }

  const libraryQuizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const ownQuizzes = await prisma.quiz.findMany({
    where: { status: { in: ["DRAFT", "PUBLISHED"] }, isLibrary: false },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, title: true, code: true, status: true },
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
            📚 Banque de quizz
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1 max-w-2xl">
            Quizz <strong>complets</strong> (questions, réponses, ambiance) mis
            à disposition des users pour duplication. Distinct des{" "}
            <Link href="/admin/templates" className="underline">
              Templates
            </Link>{" "}
            qui ne sont que des structures vides.
          </p>
        </div>
        <Link
          href="/admin/library/import"
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-semibold text-sm hover:opacity-90"
        >
          📥 Import CSV
        </Link>
      </header>

      {/* V39 : Barre de recherche LIVE (debounce 300ms) */}
      <div className="flex gap-2 items-center">
        <span className="text-lg shrink-0" aria-hidden>🔍</span>
        <InstantSearchInput
          placeholder="Rechercher dans la banque (titre, description, tag)…"
          className="w-full rounded-lg px-3 py-2 pr-10 text-sm bg-[var(--color-night-2)] border border-[var(--color-gold)]/20 text-[var(--color-lavender)] placeholder:text-[var(--color-lavender-2)]/50 focus:outline-none focus:border-[var(--color-gold)]"
        />
      </div>
      {search && (
        <p className="text-xs text-[var(--color-lavender-2)] opacity-80 -mt-2">
          {libraryQuizzes.length} résultat{libraryQuizzes.length > 1 ? "s" : ""}{" "}
          pour <strong>{search}</strong>
        </p>
      )}

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[var(--color-gold)]/30 p-5">
        <h2 className="font-display text-lg tracking-wide text-[var(--color-lavender)] mb-3">
          🪄 Comment alimenter la banque ?
        </h2>
        <ol className="text-sm space-y-2 list-decimal list-inside opacity-90">
          <li>
            Va dans{" "}
            <Link
              href="/dashboard/quizzes/new"
              className="underline text-[var(--color-gold)]"
            >
              Créer un nouveau quizz
            </Link>{" "}
            (côté user/dashboard) — c'est le même éditeur que pour tes propres
            quizz, avec boutons et formulaires.
          </li>
          <li>Remplis ton quizz : titre, description, questions, réponses, lots, etc.</li>
          <li>Publie-le (statut PUBLISHED).</li>
          <li>
            Ouvre-le en édition → tout en bas, le panneau ⚡{" "}
            <strong>« 📚 Banque de quizz » (Admin only)</strong> apparaît →
            coche « Ajouter à la banque », mets une description, des tags, et
            une langue → enregistre.
          </li>
          <li>Le quizz est désormais visible et duplicable par les autres users.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-3">
          Quizz actuellement dans la banque ({libraryQuizzes.length})
        </h2>
        {libraryQuizzes.length === 0 ? (
          <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-8 text-center">
            <p className="opacity-70">
              Aucun quizz dans la banque pour l'instant. Suis les 5 étapes
              ci-dessus pour en ajouter.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {libraryQuizzes.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/quizzes/${q.id}/edit`}
                className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4 hover:border-[var(--color-gold)]/50 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{q.title}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {q._count.questions} questions · code{" "}
                    <span className="font-mono">{q.code}</span> · par{" "}
                    {q.user.name ?? q.user.email}
                  </p>
                  {q.libraryDescription && (
                    <p className="text-xs opacity-60 mt-1 italic line-clamp-2">
                      {q.libraryDescription}
                    </p>
                  )}
                  {q.libraryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.libraryTags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold-light)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs opacity-50 shrink-0">→ éditer</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-3">
          🎯 Ajouter un de mes quizz à la banque
        </h2>
        <p className="text-sm opacity-70 mb-3">
          Mes quizz non encore dans la banque. Clique pour ouvrir l'éditeur
          et activer le panneau Banque tout en bas.
        </p>
        {ownQuizzes.length === 0 ? (
          <p className="text-sm italic opacity-60">
            Aucun de tes quizz hors banque pour l'instant.
          </p>
        ) : (
          <div className="grid gap-2">
            {ownQuizzes.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/quizzes/${q.id}/edit`}
                className="rounded-lg bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.1)] p-3 text-sm flex items-center justify-between hover:border-[var(--color-violet-primary)]/50 transition"
              >
                <span>
                  {q.title}{" "}
                  <span className="text-xs opacity-60 ml-2">
                    {q.status === "PUBLISHED" ? "✓ publié" : "📝 brouillon"}
                  </span>
                </span>
                <span className="text-xs opacity-50">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
