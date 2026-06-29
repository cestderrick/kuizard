import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminQuizDeleteButton } from "@/components/admin/admin-quiz-delete-button";
import { SeedFakeButton } from "@/components/admin/seed-fake-button";

export const metadata: Metadata = {
  title: "Admin · Quizz",
};

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const search = (sp.q ?? "").trim();

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search.toUpperCase() } },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }
    : {};

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      mode: true,
      plan: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { questions: true, participations: true } },
    },
  });

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  const statusLabel = (s: string) =>
    ({
      DRAFT: "Brouillon",
      PUBLISHED: "Publié",
      RUNNING: "En direct",
      FINISHED: "Terminé",
      ARCHIVED: "Archivé",
    })[s] ?? s;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🎩 Modération des quizz
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          {search ? (
            <>
              {quizzes.length} résultat{quizzes.length > 1 ? "s" : ""} pour «{" "}
              <strong>{search}</strong> »
            </>
          ) : (
            <>
              {quizzes.length} dernier{quizzes.length > 1 ? "s" : ""} créé
              {quizzes.length > 1 ? "s" : ""} (limite 200)
            </>
          )}
        </p>
      </header>

      <form
        action="/admin/quizzes"
        method="GET"
        className="flex gap-2 max-w-xl"
      >
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Rechercher par titre, code, email ou nom du propriétaire…"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.25)] text-[var(--color-lavender)] placeholder:text-[rgba(229,220,245,0.4)] focus:outline-none focus:border-[var(--color-gold)]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-bold transition hover:opacity-90"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          🔎 Chercher
        </button>
        {search && (
          <Link
            href="/admin/quizzes"
            className="px-3 py-2 rounded-lg text-xs text-[var(--color-lavender-2)] border border-[rgba(167,139,250,0.25)] hover:border-[var(--color-gold)] flex items-center"
          >
            ✕ Reset
          </Link>
        )}
      </form>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-3 py-3">Code</th>
                <th className="text-left px-3 py-3">Titre</th>
                <th className="text-left px-3 py-3">Propriétaire</th>
                <th className="text-left px-3 py-3">Mode</th>
                <th className="text-left px-3 py-3">Statut</th>
                <th className="text-right px-3 py-3">Q</th>
                <th className="text-right px-3 py-3">Part.</th>
                <th className="text-left px-3 py-3">Créé</th>
                <th className="text-center px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center opacity-70"
                  >
                    Aucun quizz trouvé.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr
                    key={q.id}
                    className="border-t border-[rgba(167,139,250,0.08)] hover:bg-[rgba(167,139,250,0.05)]"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs uppercase text-[var(--color-gold-light)]">
                      {q.code}
                    </td>
                    <td className="px-3 py-2.5 max-w-[220px] truncate">
                      {q.title}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="opacity-90">{q.user.name ?? "—"}</div>
                      <div className="opacity-60 font-mono">
                        {q.user.email}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {q.mode === "LIVE_MANUAL" ? "🎩 Live" : "⏰ Créneau"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs opacity-90">
                        {statusLabel(q.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {q._count.questions}
                    </td>
                    <td className="px-3 py-2.5 text-right font-display text-[var(--color-gold-light)]">
                      {q._count.participations}
                    </td>
                    <td className="px-3 py-2.5 text-xs opacity-70 whitespace-nowrap">
                      {fmtDate(q.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Link
                          href={`/q/${q.code}`}
                          target="_blank"
                          title="Voir le quizz comme un joueur"
                          className="text-xs px-2 py-1 rounded border border-[rgba(167,139,250,0.3)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                        >
                          👁
                        </Link>
                        <Link
                          href={`/q/${q.code}/classement`}
                          target="_blank"
                          title="Voir le classement"
                          className="text-xs px-2 py-1 rounded border border-[rgba(167,139,250,0.3)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                        >
                          🏆
                        </Link>
                        <Link
                          href={`/dashboard/quizzes/${q.id}/edit`}
                          title="Éditer (mode admin)"
                          className="text-xs px-2 py-1 rounded border font-bold"
                          style={{
                            borderColor: "var(--color-gold)",
                            color: "var(--color-gold)",
                          }}
                        >
                          ✏️
                        </Link>
                        <SeedFakeButton
                          quizId={q.id}
                          code={q.code}
                          title={q.title}
                        />
                        <AdminQuizDeleteButton
                          quizId={q.id}
                          code={q.code}
                          title={q.title}
                          owner={q.user.email}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[var(--color-lavender-2)] opacity-60 italic">
        ⚠️ La suppression est immédiate et irréversible (questions et
        participations sont aussi effacées). Toute action est tracée dans
        l&apos;audit log admin.
      </p>
    </div>
  );
}
