import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbSchema,
  faqPageSchema,
  howToSchema,
} from "@/lib/seo/schemas";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export type UseCaseConfig = {
  slug: string; // ex: "quizz-mariage"
  emoji: string; // ex: "💍"
  eyebrow: string; // ex: "Quizz mariage"
  h1: string; // titre principal optimisé SEO
  intro: string; // paragraphe d'intro
  benefits: { icon: string; title: string; desc: string }[];
  sampleQuestions: string[]; // exemples de questions
  whyKuizard: string[]; // bullets "pourquoi Kuizard"
  ctaPrimary?: string; // optionnel, override du CTA
  internalLinks?: { label: string; href: string }[]; // liens vers d'autres pages
  // V48 — SEO boost : FAQ rich snippets Google
  faqs?: { question: string; answer: string }[];
  // V48 — HowTo rich snippets Google
  howTo?: {
    name: string;
    description: string;
    totalTime?: string; // ISO duration ex "PT5M"
    steps: { name: string; text: string }[];
  };
};

export async function UseCasePage({ config }: { config: UseCaseConfig }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const ctaHref = isLoggedIn ? "/dashboard/quizzes/new" : "/signup";
  const ctaLabel =
    config.ctaPrimary ??
    (isLoggedIn ? "Créer mon quizz ✨" : "Créer mon compte gratuit ✨");
  const url = `${BASE_URL}/${config.slug}`;

  return (
    <main className="min-h-screen bg-[var(--color-lavender)] relative">
      <TopLocaleBar variant="light" />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: BASE_URL },
          { name: config.eyebrow, url },
        ])}
      />
      {config.faqs && config.faqs.length > 0 && (
        <JsonLd data={faqPageSchema(config.faqs)} />
      )}
      {config.howTo && (
        <JsonLd
          data={howToSchema({
            name: config.howTo.name,
            description: config.howTo.description,
            totalTime: config.howTo.totalTime,
            steps: config.howTo.steps,
          })}
        />
      )}

      {/* Breadcrumb visuel (UX + SEO) */}
      <nav
        aria-label="Fil d'Ariane"
        className="max-w-5xl mx-auto px-4 pt-3 text-xs text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-[var(--color-violet-primary)] hover:underline"
            >
              Accueil
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-[var(--color-violet-deep)]">
            {config.eyebrow}
          </li>
        </ol>
      </nav>

      {/* Hero */}
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
        <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-3">
          {config.emoji} {config.eyebrow}
        </p>
        <h1
          className="font-display text-3xl md:text-5xl font-bold tracking-wide mb-4 max-w-3xl mx-auto"
          style={{ color: "var(--color-violet-deep)" }}
        >
          {config.h1}
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">
          {config.intro}
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
            className="font-bold"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
          {config.benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl bg-white border p-6 flex flex-col gap-2"
            >
              <p className="text-3xl">{b.icon}</p>
              <h3
                className="font-display text-lg font-bold tracking-wide"
                style={{ color: "var(--color-violet-deep)" }}
              >
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample questions */}
      <section
        className="px-4 py-16 text-[var(--color-lavender)]"
        style={{
          background:
            "linear-gradient(160deg, #1F1B3A 0%, #4C1D95 60%, #6B46C1 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2 text-center">
            ✨ Idées de questions
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-8 text-center">
            Pour t'inspirer
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {config.sampleQuestions.map((q, i) => (
              <li
                key={i}
                className="rounded-xl bg-white/5 border border-white/15 px-4 py-3 backdrop-blur-sm text-sm leading-relaxed"
              >
                <span className="text-[var(--color-gold)] font-bold mr-2">
                  Q{i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Kuizard */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border p-6 md:p-10">
          <h2
            className="font-display text-2xl mb-6"
            style={{ color: "var(--color-violet-deep)" }}
          >
            🪄 Pourquoi choisir Kuizard ?
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed">
            {config.whyKuizard.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-violet-primary)] font-bold mt-0.5">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {config.internalLinks && config.internalLinks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-violet-100">
              <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-3 font-semibold">
                Pour aller plus loin
              </p>
              <div className="flex flex-wrap gap-3">
                {config.internalLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm font-semibold text-[var(--color-violet-primary)] hover:underline"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HowTo visuel (V48 — SEO rich snippet) */}
      {config.howTo && (
        <section className="px-4 py-12 bg-[var(--color-lavender-2)]/30">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2 text-center">
              📋 Mode d&apos;emploi
            </p>
            <h2
              className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-6 text-center"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {config.howTo.name}
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
              {config.howTo.description}
            </p>
            <ol className="grid gap-4 md:grid-cols-2">
              {config.howTo.steps.map((s, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-white border-2 border-violet-100 p-5 flex gap-4"
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-lg font-bold"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "var(--color-violet-deep)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold mb-1"
                      style={{ color: "var(--color-violet-deep)" }}
                    >
                      {s.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {s.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ visuelle (V48 — SEO rich snippet) */}
      {config.faqs && config.faqs.length > 0 && (
        <section className="px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2 text-center">
              ❓ Questions fréquentes
            </p>
            <h2
              className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-8 text-center"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Tout ce que tu veux savoir
            </h2>
            <div className="space-y-3">
              {config.faqs.map((f, i) => (
                <details
                  key={i}
                  className="rounded-2xl bg-white border-2 border-violet-100 px-5 py-4 group"
                >
                  <summary
                    className="font-bold cursor-pointer list-none flex items-center justify-between gap-3"
                    style={{ color: "var(--color-violet-deep)" }}
                  >
                    <span>{f.question}</span>
                    <span className="text-[var(--color-violet-primary)] group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-4 py-16 text-center bg-[var(--color-night)] text-[var(--color-lavender)]">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-3">
          Crée ton {config.eyebrow.toLowerCase()} en 5 minutes
        </h2>
        <p className="opacity-80 mb-6">
          Gratuit pour commencer. Pas de CB. Pas d'app à installer.
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
      </section>

      <SiteFooter />
    </main>
  );
}
