import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActivePlans } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";
import { SubscribeButton } from "@/components/payment/subscribe-button";
import { CustomerPortalButton } from "@/components/payment/customer-portal-button";
import { getLocale, getMessages } from "@/lib/i18n/get-locale";
import { interp } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Mon abonnement",
};

type SearchParams = Promise<{ status?: string; error?: string }>;

// Mapping locale → tag BCP47 pour Intl.DateTimeFormat
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

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status, error } = await searchParams;
  const [activeSub, plans, locale, m] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["active", "trialing", "past_due"] },
      },
      orderBy: { createdAt: "desc" },
    }),
    getActivePlans("subscription"),
    getLocale(),
    getMessages(),
  ]);

  const tag = LOCALE_TAGS[locale] ?? "fr-FR";
  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat(tag, { dateStyle: "long" }).format(d)
      : "—";

  const ms = m.subscription!;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
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

      {/* Cross-link vers paiement à l'unité */}
      <section className="rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/5 to-[var(--color-violet-primary)]/5 border-2 border-dashed border-[var(--color-violet-primary)]/30 p-5 text-center">
        <p className="text-sm">
          💡 <strong>{ms.cross_sell_strong}</strong> {ms.cross_sell}
        </p>
        <Link
          href="/dashboard/quizzes"
          className="inline-block mt-2 text-sm font-semibold text-[var(--color-violet-primary)] underline-offset-4 hover:underline"
        >
          {ms.cross_sell_link}
        </Link>
      </section>

      {status === "success" && (
        <div className="rounded-lg bg-green-100 text-green-800 px-4 py-3 text-sm">
          {ms.status_success}
        </div>
      )}
      {status === "cancel" && (
        <div className="rounded-lg bg-zinc-100 text-zinc-700 px-4 py-3 text-sm">
          {ms.status_cancel}
        </div>
      )}
      {error === "no_customer" && (
        <div className="rounded-lg bg-amber-100 text-amber-800 px-4 py-3 text-sm">
          {ms.error_no_customer}
        </div>
      )}

      {/* Abonnement actuel */}
      {activeSub ? (
        <section className="rounded-2xl border-2 border-green-300 bg-green-50/60 p-6 flex flex-col gap-3">
          <h2 className="font-display text-xl tracking-wide">
            {interp(ms.active_plan_prefix, { plan: activeSub.planSlug })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {interp(ms.next_renewal, { date: fmt(activeSub.currentPeriodEnd) })}
            {activeSub.cancelAtPeriodEnd && ` ${ms.will_cancel}`}
          </p>
          <p className="text-xs opacity-70">
            {interp(ms.stripe_status, { status: activeSub.status })}
          </p>
          <div>
            <CustomerPortalButton />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl bg-[rgba(85,35,187,0.04)] border border-[var(--color-violet-primary)] p-6 text-center text-sm text-muted-foreground">
          {ms.no_subscription}
        </section>
      )}

      {/* Plans dispos */}
      <section>
        <h2 className="font-display text-xl tracking-wide mb-3">
          {ms.plans_title}
        </h2>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{ms.no_plans}</p>
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
                    {ms.recommended}
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
                    / {plan.interval === "year" ? ms.per_year : ms.per_month}
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
                      label={interp(ms.subscribe_button, { plan: plan.name })}
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
        {ms.cancel_anytime}{" "}
        <Link href="/cgv" className="underline">
          {ms.cgv_link}
        </Link>
      </p>
    </div>
  );
}
