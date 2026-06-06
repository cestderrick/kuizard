import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Quizz",
};

export default async function AdminQuizzesPage() {
  await requireAdmin();

  const quizzes = await prisma.quiz.findMany({
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
      user: { select: { email: true, name: true } },
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
          🎩 Tous les quizz
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          {quizzes.length} dernier{quizzes.length > 1 ? "s" : ""} créé
          {quizzes.length > 1 ? "s" : ""} (limite 200)
        </p>
      </header>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Titre</th>
                <th className="text-left px-4 py-3">Propriétaire</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Q</th>
                <th className="text-right px-4 py-3">Part.</th>
                <th className="text-left px-4 py-3">Créé le</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center opacity-70"
                  >
                    Aucun quizz.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr
                    key={q.id}
                    className="border-t border-[rgba(167,139,250,0.08)] hover:bg-[rgba(167,139,250,0.05)]"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs uppercase text-[var(--color-gold-light)]">
                      {q.code}
                    </td>
                    <td className="px-4 py-2.5 max-w-[260px] truncate">
                      {q.title}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <div className="opacity-90">
                        {q.user.name ?? "—"}
                      </div>
                      <div className="opacity-60 font-mono">
                        {q.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {q.mode === "LIVE_MANUAL" ? "🎩 Live" : "⏰ Créneau"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs opacity-90">
                        {statusLabel(q.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {q._count.questions}
                    </td>
                    <td className="px-4 py-2.5 text-right font-display text-[var(--color-gold-light)]">
                      {q._count.participations}
                    </td>
                    <td className="px-4 py-2.5 text-xs opacity-70 whitespace-nowrap">
                      {fmtDate(q.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/q/${q.code}`}
                        target="_blank"
                        className="text-xs underline text-[var(--color-lavender-2)] hover:text-[var(--color-gold)]"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
