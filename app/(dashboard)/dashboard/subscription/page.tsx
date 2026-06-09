import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActivePlans } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";
import { SubscribeButton } from "@/components/payment/subscribe-button";
import { CustomerPortalButton } from "@/components/payment/customer-portal-button";
import { getMessages } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Mon abonnement",
};

type SearchParams = Promise<{ status?: string; error?: string }>;

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status, error } = await searchParams;

  const [activeSub, plans] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["active", "trialing", "past_due"] },
      },
      orderBy: { createdAt: "desc" },
    }),
    getActivePlans("subscription"),
  ]);

  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d)
      : "—";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          🔁 Abonnement
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Mon abonnement
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-xl">
          Choisis un plan mensuel — idéal si tu organises plusieurs quizz
          dans l'année (particuliers comme bars/pros).
        </p>
      </header>

      {/* Cross-link vers paiement à l'unité */}
      <section className="rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/5 to-[var(--color-violet-primary)]/5 border-2 border-dashed border-[var(--color-violet-primary)]/30 p-5 text-center">
        <p className="text-sm">
          💡 <strong>Tu n'as besoin que d'un seul quizz ?</strong> Tu peux
          aussi payer à l'unité (à partir de 5 €), sans engagement.
        </p>
        <Link
          href="/dashboard/quizzes"
          className="inline-block mt-2 text-sm font-semibold text-[var(--color-violet-primary)] underline-offset-4 hover:underline"
        >
          Voir mes quizz et payer à l'unité →
        </Link>
      </section>

      {status === "success" && (
        <div className="rounded-lg bg-green-100 text-green-800 px-4 py-3 text-sm">
          ✓ Souscription réussie ! Ton abo est actif.
        </div>
      )}
      {status === "cancel" && (
        <div className="rounded-lg bg-zinc-100 text-zinc-700 px-4 py-3 text-sm">
          🪄 Souscription annulée, rien n'a été débité.
        </div>
      )}
      {error === "no_customer" && (
        <div className="rounded-lg bg-amber-100 text-amber-800 px-4 py-3 text-sm">
          Tu n'as pas encore de compte Stripe. Souscris d'abord à un abo.
        </div>
      )}

      {/* Abonnement actuel */}
      {activeSub ? (
        <section className="rounded-2xl border-2 border-green-300 bg-green-50/60 p-6 flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-wide">
            ✓ Plan {activeSub.planSlug} actif
          </h2>
          <p className="text-sm text-muted-foreground">
            Prochain renouvellement : {fmt(activeSub.currentPeriodEnd)}
            {activeSub.cancelAtPeriodEnd && " (sera annulé à cette date)"}
          </p>
          <p className="text-xs opacity-70">
            Statut Stripe : <strong>{activeSub.status}</strong>
          </p>
          <div>
            <CustomerPortalButton />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl bg-[rgba(85,35,187,0.04)] border border-[var(--color-violet-primary)] p-6 text-center text-sm text-muted-foreground">
          Tu n'as pas encore d'abonnement actif. Choisis un plan ci-dessous.
        </section>
      )}

      {/* Plans dispos */}
      <section>
        <h2 className="font-display text-xl tracking-wide mb-3">
          Plans disponibles
        </h2>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aucun plan d'abonnement configuré.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col gap-4 border-2 ${
                  plan.isHighlighted
                    ? "border-[var(--color-gold)] bg-[rgba(245,158,11,0.05)] shadow-xl"
                    : "border-[rgba(167,139,250,0.3)] bg-white"
                }`}
              >
                {plan.isHighlighted && (
                  <p className="text-[10px] uppercase tracking-[3px] text-[var(--color-gold)] font-bold">
                    ⭐ Recommandé
                  </p>
                )}
                <div>
                  <h3
                    className="font-display text-xl tracking-wide"
                    style={{ color: "var(--color-violet-deep)" }}
                  >
                    {plan.name}
                  </h3>
                  {plan.tagline && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">
                      {plan.tagline}
                    </p>
                  )}
                </div>
                <p
                  className="font-display text-3xl font-bold"
                  style={{ color: "var(--color-violet-primary)" }}
                >
                  {formatStripeAmount(plan.priceCents)}
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "}
                    / {plan.interval === "year" ? "an" : "mois"}
                  </span>
                </p>
                {plan.description && (
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}
                {!activeSub && (
                  <div className="mt-auto pt-2">
                    <SubscribeButton
                      planSlug={plan.slug}
                      label={`Souscrire à ${plan.name}`}
                      primary={plan.isHighlighted}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground italic text-center">
        Tu peux annuler à tout moment depuis le portail Stripe.{" "}
        <Link href="/cgv" className="underline">
          Conditions Générales de Vente
        </Link>
      </p>
    </div>
  );
}
