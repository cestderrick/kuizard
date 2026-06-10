import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatStripeAmount } from "@/lib/stripe/client";
import { getLocale, getMessages } from "@/lib/i18n/get-locale";
import { interp } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Mes stats",
};

const LOCALE_TAGS: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
  it: "it-IT",
  de: "de-DE",
  pt: "pt-PT",
  ru: "ru-RU",
  zh: "zh-CN",
};

export default async function MyStatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const NOW = new Date();
  const SEVEN_DAYS_AGO = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
  const THIRTY_DAYS_AGO = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalQuizzes,
    publishedQuizzes,
    totalQuestions,
    totalParticipations,
    completedParticipations,
    last7dParticipations,
    last30dParticipations,
    totalPaymentsSucceeded,
    topQuizzes,
    quizzesWithStats,
    locale,
    m,
  ] = await Promise.all([
    prisma.quiz.count({ where: { userId } }),
    prisma.quiz.count({ where: { userId, status: "PUBLISHED" } }),
    prisma.question.count({ where: { quiz: { userId } } }),
    prisma.participation.count({ where: { quiz: { userId } } }),
    prisma.participation.count({
      where: { quiz: { userId }, completedAt: { not: null } },
    }),
    prisma.participation.count({
      where: { quiz: { userId }, startedAt: { gte: SEVEN_DAYS_AGO } },
    }),
    prisma.participation.count({
      where: { quiz: { userId }, startedAt: { gte: THIRTY_DAYS_AGO } },
    }),
    prisma.payment.aggregate({
      where: { userId, status: "succeeded" },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.quiz.findMany({
      where: { userId },
      orderBy: { participations: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        code: true,
        createdAt: true,
        _count: { select: { participations: true, questions: true } },
      },
    }),
    prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        code: true,
        status: true,
        mode: true,
        isPaid: true,
        createdAt: true,
        participations: {
          select: {
            score: true,
            completedAt: true,
          },
        },
        _count: { select: { questions: true, participations: true } },
      },
    }),
    getLocale(),
    getMessages(),
  ]);

  const completionRate =
    totalParticipations > 0
      ? Math.round((completedParticipations / totalParticipations) * 100)
      : 0;

  const perQuizStats = quizzesWithStats.map((q) => {
    const totalP = q.participations.length;
    const completedP = q.participations.filter((p) => p.completedAt).length;
    const avgScore =
      totalP > 0
        ? Math.round(
            q.participations.reduce((sum, p) => sum + p.score, 0) / totalP
          )
        : 0;
    const compRate = totalP > 0 ? Math.round((completedP / totalP) * 100) : 0;
    return {
      id: q.id,
      title: q.title,
      code: q.code,
      status: q.status,
      mode: q.mode,
      isPaid: q.isPaid,
      createdAt: q.createdAt,
      questionsCount: q._count.questions,
      participationsCount: q._count.participations,
      completedCount: completedP,
      avgScore,
      compRate,
    };
  });

  const tag = LOCALE_TAGS[locale] ?? "fr-FR";
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(tag, { dateStyle: "short" }).format(d);

  const ms = m.stats!;

  function statusLabel(s: string): string {
    return (
      {
        DRAFT: ms.status_draft,
        PUBLISHED: ms.status_published,
        RUNNING: ms.status_running,
        FINISHED: ms.status_finished,
        ARCHIVED: ms.status_archived,
      }[s] ?? s
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          {ms.page_eyebrow}
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          {ms.page_title}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-xl">
          {ms.page_subtitle}
        </p>
      </header>

      {/* ============================================
          ENCART : Mes statistiques par quizz
          ============================================ */}
      <section>
        <h2 className="font-display text-xl tracking-wide mb-3 flex items-center gap-2">
          {ms.per_quiz_stats_title}
          <span className="text-xs font-normal text-muted-foreground">
            ({interp(ms.quizzes_count_suffix, { count: perQuizStats.length })})
          </span>
        </h2>
        {perQuizStats.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p className="text-muted-foreground">{ms.no_quizzes_yet}</p>
            <Link
              href="/dashboard/quizzes/templates"
              className="inline-block mt-3 text-sm font-semibold text-[var(--color-violet-primary)] hover:underline"
            >
              {ms.start_from_template}
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-3">{ms.th_quiz}</th>
                    <th className="text-left px-3 py-3">{ms.th_status}</th>
                    <th className="text-right px-3 py-3">{ms.th_questions}</th>
                    <th className="text-right px-3 py-3">{ms.th_players}</th>
                    <th className="text-right px-3 py-3">{ms.th_completion}</th>
                    <th className="text-right px-3 py-3">{ms.th_avg_score}</th>
                    <th className="text-left px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {perQuizStats.map((q) => (
                    <tr key={q.id} className="border-t hover:bg-zinc-50">
                      <td className="px-3 py-2.5 min-w-[180px]">
                        <Link
                          href={`/dashboard/quizzes/${q.id}/edit`}
                          className="font-medium hover:text-[var(--color-violet-primary)] hover:underline truncate block max-w-[240px]"
                        >
                          {q.title}
                          {q.isPaid && (
                            <span className="ml-1 text-[10px] text-amber-600">
                              ★
                            </span>
                          )}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-mono">{q.code}</span> ·{" "}
                          {fmtDate(q.createdAt)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${statusBadge(q.status)}`}
                        >
                          {statusLabel(q.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {q.questionsCount}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-[var(--color-violet-primary)]">
                        {q.participationsCount}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {q.participationsCount > 0 ? (
                          <span className="text-xs">
                            {q.completedCount}{" "}
                            <span className="opacity-60">
                              ({q.compRate}%)
                            </span>
                          </span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold">
                        {q.participationsCount > 0 ? q.avgScore : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {q.participationsCount > 0 && (
                          <Link
                            href={`/q/${q.code}/classement`}
                            className="text-xs text-[var(--color-violet-primary)] hover:underline"
                          >
                            🏆 →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Séparateur visuel */}
      <div className="border-t border-violet-100" />

      <div>
        <h2 className="font-display text-xl tracking-wide mb-1 flex items-center gap-2">
          {ms.global_stats_title}
        </h2>
        <p className="text-xs text-muted-foreground">
          {ms.global_stats_subtitle}
        </p>
      </div>

      {/* Cartes principales */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={ms.my_quizzes}
          value={totalQuizzes}
          sub={interp(ms.published_suffix, { count: publishedQuizzes })}
          icon="🎩"
        />
        <StatCard
          label={ms.questions_created}
          value={totalQuestions}
          icon="❓"
        />
        <StatCard
          label={ms.participations}
          value={totalParticipations}
          sub={interp(ms.completed_suffix, {
            count: completedParticipations,
            rate: completionRate,
          })}
          icon="🎮"
        />
        <StatCard
          label={ms.spent}
          value={`${formatStripeAmount(totalPaymentsSucceeded._sum.amountCents ?? 0)}`}
          sub={interp(ms.purchases_count, {
            count: totalPaymentsSucceeded._count,
          })}
          icon="💳"
          isText
        />
      </section>

      {/* Activité récente */}
      <section className="grid md:grid-cols-2 gap-4">
        <Box title={ms.days_7_title}>
          <p className="font-display text-4xl font-bold text-[var(--color-violet-primary)]">
            {last7dParticipations}
          </p>
          <p className="text-sm text-muted-foreground">
            {ms.participations_started}
          </p>
        </Box>
        <Box title={ms.days_30_title}>
          <p className="font-display text-4xl font-bold text-[var(--color-violet-primary)]">
            {last30dParticipations}
          </p>
          <p className="text-sm text-muted-foreground">
            {ms.participations_started}
          </p>
        </Box>
      </section>

      {/* Top 5 quizz */}
      <section className="rounded-2xl bg-white border p-5">
        <h2 className="font-display text-lg tracking-wide mb-3">
          {ms.top5_title}
        </h2>
        {topQuizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {ms.no_quiz_yet}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {topQuizzes.map((q, i) => (
              <li
                key={q.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display text-2xl w-8 text-center text-[var(--color-violet-primary)]">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/quizzes/${q.id}/edit`}
                      className="font-medium truncate hover:underline"
                    >
                      {q.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {ms.code_label} <span className="font-mono">{q.code}</span> ·{" "}
                      {interp(ms.questions_label, {
                        count: q._count.questions,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-[var(--color-gold)]">
                    {q._count.participations}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ms.players_suffix}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  isText,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5 bg-white border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          {label}
        </p>
        <span aria-hidden>{icon}</span>
      </div>
      <p
        className={`font-display font-bold text-[var(--color-violet-primary)] ${
          isText ? "text-2xl" : "text-4xl"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      )}
    </div>
  );
}

function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border p-5">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function statusBadge(s: string): string {
  return (
    {
      PUBLISHED: "bg-green-100 text-green-800",
      RUNNING: "bg-amber-100 text-amber-800",
      FINISHED: "bg-zinc-100 text-zinc-700",
      DRAFT: "bg-blue-100 text-blue-800",
      ARCHIVED: "bg-zinc-100 text-zinc-500",
    }[s] ?? "bg-zinc-100 text-zinc-600"
  );
}
