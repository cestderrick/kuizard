import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { WeeklyFeaturedForm } from "@/components/admin/weekly-featured-form";

export const metadata: Metadata = {
  title: "Admin · Quizz de la semaine",
};

export default async function AdminWeeklyPage() {
  await requireAdmin();

  const now = new Date();
  const [current, allFeatured, eligibleQuizzes] = await Promise.all([
    prisma.weeklyFeaturedQuiz.findFirst({
      where: { weekStart: { lte: now }, weekEnd: { gte: now } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.weeklyFeaturedQuiz.findMany({
      orderBy: { weekStart: "desc" },
      take: 20,
    }),
    prisma.quiz.findMany({
      where: { status: { in: ["PUBLISHED", "RUNNING"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, title: true, code: true },
    }),
  ]);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(d);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🎁 Quizz de la semaine
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Sélectionne un quizz publié à mettre en avant sur la home. Gratuit
          pour tous, avec des lots à gagner. Un seul quizz featured actif à la
          fois (le plus récent dans sa fenêtre weekStart/weekEnd).
        </p>
      </header>

      {current && (
        <div className="rounded-2xl bg-[var(--color-night-2)] border border-green-700/40 p-4 text-sm">
          <p className="font-semibold text-green-400 mb-1">
            ✓ Featured actif maintenant
          </p>
          <p className="opacity-80">
            « {current.title} » — du {fmt(current.weekStart)} au{" "}
            {fmt(current.weekEnd)}
          </p>
        </div>
      )}

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[var(--color-gold)]/30 p-5">
        <h2 className="font-display text-lg tracking-wide text-[var(--color-lavender)] mb-4">
          {current ? "Modifier le featured actuel" : "Activer un featured"}
        </h2>
        <WeeklyFeaturedForm
          quizzes={eligibleQuizzes}
          current={
            current
              ? {
                  id: current.id,
                  quizId: current.quizId,
                  title: current.title,
                  subtitle: current.subtitle,
                  prizesText: current.prizesText,
                  weekStart: current.weekStart.toISOString(),
                  weekEnd: current.weekEnd.toISOString(),
                  ctaLabel: current.ctaLabel,
                }
              : null
          }
        />
      </section>

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
        <h2 className="font-display text-lg tracking-wide text-[var(--color-lavender)] mb-4">
          📚 Historique
        </h2>
        {allFeatured.length === 0 ? (
          <p className="text-sm italic opacity-60">
            Aucun featured pour l'instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {allFeatured.map((f) => {
              const isActive =
                now >= f.weekStart && now <= f.weekEnd;
              const isPast = f.weekEnd < now;
              return (
                <li
                  key={f.id}
                  className={`rounded-lg p-3 text-sm flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-green-900/20 border border-green-700/40"
                      : isPast
                      ? "bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.1)] opacity-70"
                      : "bg-[rgba(212,160,23,0.1)] border border-[var(--color-gold)]/30"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-xs opacity-70">
                      {fmt(f.weekStart)} → {fmt(f.weekEnd)}
                      {isActive && " · 🟢 EN COURS"}
                      {!isActive && !isPast && " · ⏳ À VENIR"}
                      {isPast && " · ✓ TERMINÉ"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
