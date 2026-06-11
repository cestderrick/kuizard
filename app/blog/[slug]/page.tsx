import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { SiteFooter } from "@/components/legal/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";
const LOCALE_TAG = "fr-FR";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat(LOCALE_TAG, { dateStyle: "long" }).format(
    new Date(iso)
  );

// Pré-rendu statique des pages d'article
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Import dynamique du composant de contenu
  let PostContent: React.ComponentType;
  try {
    const mod = await import(`@/components/blog/posts/${slug}`);
    PostContent = mod.default;
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-lavender)] relative">
      <TopLocaleBar variant="light" />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: BASE_URL },
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: post.title, url: `${BASE_URL}/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.description,
          slug: post.slug,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
        })}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
          >
            ← Tous les articles
          </Link>
          <div className="flex flex-wrap gap-2 mt-5 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-[2px] px-2 py-0.5 rounded-full bg-violet-50 text-[var(--color-violet-primary)] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {post.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {fmtDate(post.datePublished)} · {post.readingTime} min de lecture
          </p>
        </header>

        <article className="legal-prose bg-white rounded-2xl shadow-sm px-6 py-10 md:px-12 md:py-12">
          <PostContent />
        </article>

        <div className="mt-10 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--color-violet-primary)] hover:underline"
          >
            ← Tous les articles
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-[var(--color-violet-primary)] hover:underline"
          >
            Créer mon compte gratuit →
          </Link>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
