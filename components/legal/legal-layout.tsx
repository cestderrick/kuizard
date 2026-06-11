import type { ReactNode } from "react";
import Link from "next/link";

import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { getLocale, getMessages } from "@/lib/i18n/get-locale";

type Props = {
  title: string;
  lastUpdate: string;
  children: ReactNode;
};

export async function LegalLayout({ title, lastUpdate, children }: Props) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const showFrenchOnlyBanner = locale !== "fr";
  const banner = messages.legal_banner;

  return (
    <main className="min-h-screen bg-[var(--color-lavender)] py-12 px-4 relative">
      <TopLocaleBar variant="light" />

      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
          >
            ← Retour à l'accueil
          </Link>
          <h1
            className="font-display text-3xl md:text-4xl tracking-wide mt-6 mb-3"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {lastUpdate}
          </p>
        </header>

        {/* Bandeau d'avertissement pour les locales non-FR : seule la version
            française fait foi juridiquement (pratique standard SaaS FR). */}
        {showFrenchOnlyBanner && banner && (
          <aside
            role="note"
            className="mb-6 rounded-2xl border-2 border-dashed border-[var(--color-gold)] bg-gradient-to-br from-[rgba(245,158,11,0.08)] to-[rgba(85,35,187,0.04)] p-5"
          >
            <p
              className="font-semibold text-sm mb-2"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {banner.title}
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {banner.body}
            </p>
          </aside>
        )}

        <article className="legal-prose bg-white rounded-2xl shadow-sm px-6 py-10 md:px-12 md:py-12">
          {children}
        </article>

        <nav className="mt-10 flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
          <Link href="/mentions-legales" className="hover:underline">
            Mentions légales
          </Link>
          <span>·</span>
          <Link href="/cgu" className="hover:underline">
            CGU
          </Link>
          <span>·</span>
          <Link href="/cgv" className="hover:underline">
            CGV
          </Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:underline">
            Confidentialité
          </Link>
          <span>·</span>
          <Link href="/cookies" className="hover:underline">
            Cookies
          </Link>
        </nav>
      </div>
    </main>
  );
}
