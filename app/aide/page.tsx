import type { Metadata } from "next";
import Link from "next/link";

import { InteractiveFaq } from "@/components/faq/interactive-faq";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { SiteFooterNight } from "@/components/legal/site-footer-night";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageSchema } from "@/lib/seo/schemas";
import { FAQ_NODES } from "@/lib/faq/tree";

export const metadata: Metadata = {
  title: "Aide & FAQ",
  description:
    "Trouve la réponse à ta question sur Kuizard : création de quizz, mode live, paiement, abonnement, dépannage.",
};

// Extraction des paires (question, réponse) de l'arbre FAQ pour Schema.org
const FAQ_QA = Object.values(FAQ_NODES)
  .filter((node) => typeof node.answer === "string" && node.answer.length > 0)
  .map((node) => ({
    question: node.question,
    // Strip simple du Markdown (gras, italique) qui ne passe pas bien en JSON-LD
    answer: (node.answer as string)
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/`(.+?)`/g, "$1"),
  }));

export default function AidePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)] relative overflow-hidden">
      {/* JSON-LD FAQPage : Google peut afficher les Q&A directement dans
          les résultats de recherche (rich snippet → CTR boosté) */}
      <JsonLd data={faqPageSchema(FAQ_QA)} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(85, 35, 187, 0.4) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
        <header className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <KuizardLogo size={42} />
            <span className="font-display text-2xl font-bold tracking-[3px] text-[var(--color-lavender)]">
              Kuizard
            </span>
          </Link>
        </header>

        <div className="text-center">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
            ✨ Centre d'aide
          </p>
          <h1 className="font-display text-3xl tracking-wide mb-2">
            On t'aide à trouver la réponse
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 max-w-md mx-auto">
            Réponds aux questions, on t'oriente vers la bonne info.
          </p>
        </div>

        <InteractiveFaq />

        <p className="text-center text-xs text-[var(--color-lavender-2)] opacity-60">
          ←{" "}
          <Link href="/" className="underline">
            Retour à l'accueil
          </Link>
        </p>
      </div>

      <div className="relative z-10 w-full mt-12">
        <SiteFooterNight />
      </div>
    </main>
  );
}
