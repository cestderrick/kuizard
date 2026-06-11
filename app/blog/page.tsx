import type { Metadata } from "next";
import Link from "next/link";

import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { getAllPosts } from "@/lib/blog/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Blog Kuizard — idées et guides pour animer tes évènements",
  description:
    "Idées de questions, guides pratiques, astuces pour animer mariages, EVJF, anniversaires, bars et séminaires avec un quizz personnalisé.",
  alternates: { canonical: `${BASE_URL}/blog` },
};

const LOCALE_TAG = "fr-FR";
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat(LOCALE_TAG, { dateStyle: "long" }).format(
    new Date(iso)
  );

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[var(--color-lavender)] relative">
      <TopLocaleBar variant="light" />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: BASE_URL },
          { name: "Blog", url: `${BASE_URL}/blog` },
        ])}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
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
            ✨ Blog
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Idées et guides pour tes évènements
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
            Tout ce qu'il faut pour réussir ton quizz : idées de questions,
            astuces d'animation, guides pratiques bar et événementiel.
          </p>
        </header>

        <ul className="flex flex-col gap-6">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block rounded-2xl bg-white border hover:shadow-md transition p-6"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-[2px] px-2 py-0.5 rounded-full bg-violet-50 text-[var(--color-violet-primary)] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2
                  className="font-display text-xl md:text-2xl font-bold tracking-wide mb-2"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {p.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {p.excerpt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(p.datePublished)} · {p.readingTime} min de lecture
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SiteFooter />
    </main>
  );
}
