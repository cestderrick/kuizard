import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActivePlans } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";
import { CheckoutButton } from "@/components/payment/checkout-button";

export const metadata: Metadata = {
  title: "Choisir un plan",
};

type Params = Promise<{ id: string }>;

export default async function UpgradePage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      code: true,
      isPaid: true,
    },
  });
  if (!quiz || quiz.userId !== session.user.id) notFound();

  const plans = await getActivePlans("one_shot");
  const hasSubscriptionsAvailable =
    (await getActivePlans("subscription")).length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/quizzes/${quiz.id}/edit`}
          className="text-sm text-[var(--color-violet-primary)] hover:underline"
        >
          ← Retour à l'édition
        </Link>
      </div>

      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          ✨ Choisis ton plan
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          {quiz.title}
        </h1>
        {quiz.isPaid && (
          <div className="mt-3 inline-block px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm">
            ✓ Ce quizz est déjà débloqué.{" "}
            <Link
              href={`/q/${quiz.code}`}
              className="underline font-semibold"
            >
              Voir le quizz
            </Link>
          </div>
        )}
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`rounded-2xl p-6 flex flex-col gap-4 border-2 transition ${
              plan.isHighlighted
                ? "border-[var(--color-gold)] bg-[rgba(245,158,11,0.05)] shadow-xl"
                : "border-[rgba(167,139,250,0.3)] bg-white"
            }`}
          >
            {plan.isHighlighted && (
              <p className="text-[10px] uppercase tracking-[3px] text-[var(--color-gold)] font-bold">
                ⭐ Le plus choisi
              </p>
            )}
            <div>
              <h2
                className="font-display text-xl tracking-wide"
                style={{ color: "var(--color-violet-deep)" }}
              >
                {plan.name}
              </h2>
              {plan.tagline && (
                <p className="text-xs text-muted-foreground italic mt-0.5">
                  {plan.tagline}
                </p>
              )}
            </div>

            <p
              className="font-display text-4xl font-bold"
              style={{ color: "var(--color-violet-primary)" }}
            >
              {plan.priceCents === 0
                ? "Gratuit"
                : formatStripeAmount(plan.priceCents)}
            </p>

            {plan.description && (
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            )}

            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              {plan.limits.maxQuestions !== undefined && (
                <li>
                  ✓{" "}
                  {plan.limits.maxQuestions >= 999
                    ? "Questions illimitées"
                    : `Jusqu'à ${plan.limits.maxQuestions} questions`}
                </li>
              )}
              {plan.limits.maxParticipants !== undefined && (
                <li>
                  ✓{" "}
                  {plan.limits.maxParticipants >= 999
                    ? "Participants illimités"
                    : `${plan.limits.maxParticipants} participants max`}
                </li>
              )}
              {plan.limits.coverImage && <li>✓ Photo de couverture</li>}
              {plan.limits.questionImages && (
                <li>✓ Photo sur chaque question</li>
              )}
              {plan.limits.customColors && <li>✓ Couleurs personnalisées</li>}
              {plan.limits.customPrizes && <li>✓ Lots personnalisés</li>}
              {plan.limits.finalMessage && <li>✓ Mot de fin sur-mesure</li>}
              {plan.limits.tvDisplay && <li>✓ Affichage TV pour bars</li>}
            </ul>

            <div className="mt-auto pt-2">
              {plan.priceCents === 0 ? (
                <div className="text-xs text-center text-muted-foreground italic">
                  Aucun paiement nécessaire
                </div>
              ) : (
                <CheckoutButton
                  quizId={quiz.id}
                  planSlug={plan.slug}
                  planName={plan.name}
                  priceCents={plan.priceCents}
                  label={`Débloquer ${plan.name}`}
                  primary={plan.isHighlighted}
                />
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Cross-link vers abos */}
      {hasSubscriptionsAvailable && (
        <section className="rounded-2xl bg-gradient-to-br from-[var(--color-violet-primary)]/5 to-[var(--color-gold)]/5 border-2 border-dashed border-[var(--color-violet-primary)]/30 p-5 text-center">
          <p className="text-sm">
            💡 <strong>Tu fais plusieurs quizz par an ?</strong> Un abonnement
            mensuel devient plus avantageux dès le 3e quizz.
          </p>
          <Link
            href="/dashboard/subscription"
            className="inline-block mt-2 text-sm font-semibold text-[var(--color-violet-primary)] underline-offset-4 hover:underline"
          >
            Voir les abonnements →
          </Link>
        </section>
      )}
    </div>
  );
}
