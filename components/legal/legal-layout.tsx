import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  title: string;
  lastUpdate: string;
  children: ReactNode;
};

export function LegalLayout({ title, lastUpdate, children }: Props) {
  return (
    <main className="min-h-screen bg-[var(--color-lavender)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
          >
            ← Retour à l'accueil
          </Link>
          <h1
            className="font-display text-3xl md:text-4xl tracking-wide mt-4 mb-2"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {lastUpdate}
          </p>
        </header>

        <article className="bg-white rounded-2xl shadow-sm p-8 prose prose-violet max-w-none">
          {children}
        </article>

        <nav className="mt-8 flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
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
