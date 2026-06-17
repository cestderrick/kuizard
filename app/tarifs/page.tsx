import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schemas";
import { getActivePlans } from "@/lib/plans/config";
import {
  OneShotCompareTable,
  SubscriptionCompareTable,
} from "@/components/pricing/compare-table";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Tarifs — quizz à l'unité dès 5 € ou abonnement pour bars",
  description:
    "Tous les tarifs Kuizard : quizz à l'unité gratuits ou dès 5 €, abonnements bars/restos illimités à partir de 25 €/mois. Sans engagement, TVA non applicable (art. 293 B CGI).",
  alternates: {
    canonical: `${BASE_URL}/tarifs`,
  },
  openGraph: {
    title: "Tarifs Kuizard — gratuit, à l'unité ou en abonnement",
    description:
      "Quizz à l'unité dès 5 €, abonnements bars dès 25 €/mois. Pas d'engagement, pas de TVA.",
    url: `${BASE_URL}/tarifs`,
  },
};

export default async function TarifsPage() {
  const [session, oneShotPlans, subscriptionPlans] = await Promise.all([
    auth(),
    getActivePlans("one_shot"),
    getActivePlans("subscription"),
  ]);
  const isLoggedIn = !!session?.user;

  // CTA contextuel : si déjà connecté on pointe vers le dashboard, sinon signup
  const ctaHref = isLoggedIn ? "/dashboard/quizzes" : "/signup";
  const ctaLabel = isLoggedIn ? "Créer mon prochain quizz ✨" : "Créer mon compte gratuit ✨";

  return (
    <main className="min-h-screen bg-[var(--color-lavender)] relative">
      <TopLocaleBar variant="light" />

      {/* Breadcrumb JSON-LD */}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: BASE_URL },
          { name: "Tarifs", url: `${BASE_URL}/tarifs` },
        ])}
      />

      {/* Product/Offer JSON-LD pour chaque plan payant (rich snippets Google) */}
      {[...oneShotPlans, ...subscriptionPlans]
        .filter((p) => p.priceCents > 0)
        .map((p) => (
          <JsonLd
            key={p.id}
            data={productSchema({
              name: p.name,
              description: p.description ?? p.tagline ?? p.name,
              priceCents: p.priceCents,
              slug: p.slug,
              interval: p.interval === "year" || p.interval === "month"
                ? (p.interval as "year" | "month")
                : null,
            })}
          />
        ))}

      {/* ====== HERO ====== */}
      <section className="px-4 pt-16 pb-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6"
          style={{ color: "var(--color-violet-deep)" }}
        >
          <KuizardLogo size={36} />
          <span className="font-display text-xl font-bold tracking-[3px]">
            Kuizard
          </span>
        </Link>
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
          ✨ Tarifs
        </p>
        <h1
          className="font-display text-3xl md:text-5xl font-bold tracking-wide mb-3"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Simple, sans engagement, sans TVA
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Gratuit pour essayer, à l'unité pour un évènement ponctuel, en
          abonnement pour les bars et lieux qui animent toute l'année. Tu
          changes d'avis ? Tu résilies en 1 clic.
        </p>
      </section>

      {/* ====== OFFRES À L'UNITÉ ====== */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2
            id="unite"
            className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-2 text-center"
            style={{ color: "var(--color-violet-deep)" }}
          >
            🎩 À l'unité — pour un évènement ponctuel
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
            Tu organises un seul évènement ? Paie une fois, profite à fond.
            Conservation des données et fonctionnalités au prorata de l'offre.
          </p>

          <OneShotCompareTable plans={oneShotPlans} />
          <p className="text-xs text-muted-foreground italic text-center mt-4">
            ✓ inclus &nbsp;·&nbsp; ✗ non inclus &nbsp;·&nbsp; ∞ illimité
          </p>
        </div>
      </section>

      {/* ====== ABONNEMENTS ====== */}
      <section
        className="px-4 py-16 text-[var(--color-lavender)]"
        style={{
          background:
            "linear-gradient(160deg, #1F1B3A 0%, #4C1D95 60%, #6B46C1 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2 text-center">
            ✨ Pour les pros
          </p>
          <h2
            id="abonnements"
            className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-2 text-center"
          >
            Abonnements bars, restos, lieux événementiels
          </h2>
          <p className="text-center text-[var(--color-lavender-2)] opacity-90 mb-10 max-w-2xl mx-auto">
            Quizz illimités, mode live, affichage TV, classements hebdo. Tout
            pour animer ton lieu sans souci. Sans engagement, résiliation à
            tout moment.
          </p>

          <div className="bg-white/5 rounded-2xl p-2 md:p-4 backdrop-blur-sm">
            <SubscriptionCompareTable plans={subscriptionPlans} />
          </div>

          <p className="mt-10 text-center text-sm opacity-80">
            ✓ Sans engagement &nbsp;·&nbsp; ✓ Résiliation libre &nbsp;·&nbsp; ✓
            Pas de reconduction tacite
          </p>
        </div>
      </section>

      {/* ====== TVA + GARANTIES ====== */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border p-6 md:p-8">
          <h2
            className="font-display text-xl mb-4"
            style={{ color: "var(--color-violet-deep)" }}
          >
            🪄 Quelques infos avant de te lancer
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <strong>TVA non applicable</strong> — art. 293 B du CGI. Kuizard
              est édité par Projiat (micro-entreprise), donc les prix affichés
              sont nets, sans TVA à ajouter.
            </li>
            <li>
              <strong>Paiement sécurisé</strong> — toutes les transactions
              passent par Stripe (carte, Apple Pay, Google Pay). Facture PDF
              automatique disponible depuis ton espace.
            </li>
            <li>
              <strong>Garantie de tarif</strong> — pour les offres à l'unité,
              le tarif payé est figé. Pour les abonnements en cours, une
              hausse ne s'applique qu'aux nouveaux abonnés (
              <Link href="/cgv" className="underline">
                voir CGV
              </Link>
              ).
            </li>
            <li>
              <strong>Tu changes d'avis ?</strong> Tu peux résilier ton
              abonnement à tout moment depuis ton espace, sans frais. La
              période en cours reste utilisable jusqu'à son terme.
            </li>
            <li>
              <strong>Codes promotionnels</strong> — saisis-les au moment du
              paiement. Non cumulables.
            </li>
          </ul>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="px-4 py-16 text-center bg-[var(--color-night)] text-[var(--color-lavender)]">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-3">
          Prêt à lancer ton premier quizz ?
        </h2>
        <p className="opacity-80 mb-6">
          Gratuit pour commencer. Aucune carte demandée.
        </p>
        <Button
          asChild
          size="lg"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
          className="font-bold"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
        <p className="mt-6 text-xs opacity-60">
          Une question avant ?{" "}
          <Link href="/aide" className="underline">
            Centre d'aide
          </Link>{" "}
          ·{" "}
          <Link href="/cgv" className="underline">
            CGV
          </Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
