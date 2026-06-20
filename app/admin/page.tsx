import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { SendDigestNowButton } from "@/components/admin/send-digest-now-button";
import { EmailDebugButton } from "@/components/admin/email-debug-button";

export const metadata: Metadata = {
  title: "Admin · Tableau de bord",
};

export default async function AdminDashboardPage() {
  // Stats globales en parallèle (Promise.all)
  const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers7d,
    totalQuizzes,
    quizzesByMode,
    quizzesByStatus,
    totalQuestions,
    totalParticipations,
    completedParticipations,
    pendingSuggestions,
    totalSuggestions,
    recentSuggestions,
    unreadConvos,
    totalConvos,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: SEVEN_DAYS_AGO } } }),
    prisma.quiz.count(),
    prisma.quiz.groupBy({ by: ["mode"], _count: true }),
    prisma.quiz.groupBy({ by: ["status"], _count: true }),
    prisma.question.count(),
    prisma.participation.count(),
    prisma.participation.count({ where: { completedAt: { not: null } } }),
    prisma.suggestion.count({ where: { status: "new" } }),
    prisma.suggestion.count(),
    prisma.suggestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        category: true,
        message: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.conversation.count({
      where: { unreadByAdmin: true, status: "open" },
    }),
    prisma.conversation.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
            📊 Tableau de bord global
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
            Vue d'ensemble de l'activité Kuizard
          </p>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <SendDigestNowButton />
          <EmailDebugButton />
        </div>
      </header>

      {/* Cartes de stats */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Utilisateurs" value={totalUsers} sub={`+${newUsers7d} cette semaine`} icon="👥" />
        <StatCard label="Quizz créés" value={totalQuizzes} sub={`${totalQuestions} questions`} icon="🎩" />
        <StatCard
          label="Participations"
          value={totalParticipations}
          sub={`${completedParticipations} terminées`}
          icon="🎮"
        />
        <StatCard
          label="Suggestions"
          value={totalSuggestions}
          sub={`${pendingSuggestions} en attente`}
          icon="💬"
          highlight={pendingSuggestions > 0}
        />
        <StatCard
          label="Messagerie"
          value={totalConvos}
          sub={`${unreadConvos} à traiter`}
          icon="✉️"
          highlight={unreadConvos > 0}
        />
      </section>

      {/* Répartition quizz */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
          <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold mb-3">
            Par mode
          </p>
          {quizzesByMode.length === 0 ? (
            <p className="text-sm text-[var(--color-lavender-2)] opacity-70">
              Pas encore de quizz.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {quizzesByMode.map((m) => (
                <li
                  key={m.mode}
                  className="flex items-center justify-between"
                >
                  <span>
                    {m.mode === "LIVE_MANUAL"
                      ? "🎩 Pilotage live"
                      : "⏰ Créneau horaire"}
                  </span>
                  <span className="font-display text-xl text-[var(--color-gold-light)]">
                    {m._count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
          <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold mb-3">
            Par statut
          </p>
          {quizzesByStatus.length === 0 ? (
            <p className="text-sm text-[var(--color-lavender-2)] opacity-70">
              Pas encore de quizz.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {quizzesByStatus.map((s) => (
                <li
                  key={s.status}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{statusLabel(s.status)}</span>
                  <span className="font-display text-xl text-[var(--color-gold-light)]">
                    {s._count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Dernières suggestions */}
      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
            Dernières suggestions
          </p>
          <Link
            href="/admin/suggestions"
            className="text-xs underline text-[var(--color-lavender-2)] hover:text-[var(--color-gold)]"
          >
            Tout voir →
          </Link>
        </div>
        {recentSuggestions.length === 0 ? (
          <p className="text-sm text-[var(--color-lavender-2)] opacity-70">
            Aucune suggestion pour l'instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentSuggestions.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[rgba(0,0,0,0.2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] uppercase tracking-wide font-semibold">
                      {s.category ?? "other"}
                    </span>
                    <span className="text-xs opacity-60">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(s.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm truncate">{s.message}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${statusBadgeClass(s.status)}`}
                >
                  {statusLabel(s.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ============================================
// Sous-composants
// ============================================

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        highlight
          ? "bg-[rgba(245,158,11,0.12)] border-[var(--color-gold)]"
          : "bg-[var(--color-night-2)] border-[rgba(167,139,250,0.15)]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-[2px] opacity-70">{label}</p>
        <span className="text-xl" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="font-display text-4xl font-bold text-[var(--color-gold-light)]">
        {value}
      </p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  );
}

function statusLabel(s: string): string {
  return (
    {
      DRAFT: "Brouillon",
      PUBLISHED: "Publié",
      RUNNING: "En direct",
      FINISHED: "Terminé",
      ARCHIVED: "Archivé",
      new: "Nouveau",
      seen: "Vu",
      done: "Traité",
      wont_fix: "Ignoré",
    }[s] ?? s
  );
}

function statusBadgeClass(s: string): string {
  return (
    {
      new: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
      seen: "bg-blue-500/20 text-blue-200 border border-blue-500/40",
      done: "bg-green-500/20 text-green-200 border border-green-500/40",
      wont_fix: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/40",
    }[s] ?? "bg-zinc-500/20 text-zinc-300"
  );
}
