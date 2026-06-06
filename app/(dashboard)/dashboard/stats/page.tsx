import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatStripeAmount } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "Mes stats",
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
  ]);

  const completionRate =
    totalParticipations > 0
      ? Math.round((completedParticipations / totalParticipations) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          📊 Statistiques
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Mes stats globales
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-xl">
          L'activité de tous tes quizz d'un coup d'œil.
        </p>
      </header>

      {/* Cartes principales */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Mes quizz"
          value={totalQuizzes}
          sub={`${publishedQuizzes} publiés`}
          icon="🎩"
        />
        <StatCard
          label="Questions créées"
          value={totalQuestions}
          icon="❓"
        />
        <StatCard
          label="Participations"
          value={totalParticipations}
          sub={`${completedParticipations} terminées (${completionRate}%)`}
          icon="🎮"
        />
        <StatCard
          label="Dépensé"
          value={`${formatStripeAmount(totalPaymentsSucceeded._sum.amountCents ?? 0)}`}
          sub={`${totalPaymentsSucceeded._count} achat(s)`}
          icon="💳"
          isText
        />
      </section>

      {/* Activité récente */}
      <section className="grid md:grid-cols-2 gap-4">
        <Box title="🌟 7 derniers jours">
          <p className="font-display text-4xl font-bold text-[var(--color-violet-primary)]">
            {last7dParticipations}
          </p>
          <p className="text-sm text-muted-foreground">
            participation{last7dParticipations > 1 ? "s" : ""} démarrée
            {last7dParticipations > 1 ? "s" : ""}
          </p>
        </Box>
        <Box title="📅 30 derniers jours">
          <p className="font-display text-4xl font-bold text-[var(--color-violet-primary)]">
            {last30dParticipations}
          </p>
          <p className="text-sm text-muted-foreground">
            participation{last30dParticipations > 1 ? "s" : ""} démarrée
            {last30dParticipations > 1 ? "s" : ""}
          </p>
        </Box>
      </section>

      {/* Top 5 quizz */}
      <section className="rounded-2xl bg-white border p-5">
        <h2 className="font-display text-lg tracking-wide mb-3">
          🏆 Top 5 quizz par participation
        </h2>
        {topQuizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aucun quizz pour l'instant.
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
                      Code <span className="font-mono">{q.code}</span> ·{" "}
                      {q._count.questions} questions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-[var(--color-gold)]">
                    {q._count.participations}
                  </p>
                  <p className="text-xs text-muted-foreground">joueur(s)</p>
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
