import type { Metadata } from "next";
import Link from "next/link";

import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "La page que tu cherches n'existe plus ou a changé d'adresse. Reviens à l'accueil ou consulte le centre d'aide.",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--color-night)] text-[var(--color-lavender)]">
      <TopLocaleBar variant="night" />

      {/* Halos décoratifs cohérents avec /login & /signup */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(217, 70, 239, 0.30) 0%, transparent 70%)",
        }}
      />

      {/* Logo en haut */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-3 text-white relative z-10"
      >
        <KuizardLogo size={48} />
        <span
          className="font-display text-3xl font-bold tracking-[3px]"
          style={{ color: "var(--color-lavender)" }}
        >
          Kuizard
        </span>
      </Link>

      {/* Carte 404 */}
      <section className="relative z-10 max-w-xl w-full text-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-6 py-10 md:px-10 md:py-12">
        <p
          className="text-xs uppercase tracking-[3px] font-semibold mb-3"
          style={{ color: "var(--color-gold)" }}
        >
          ✨ Erreur 404
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-normal mb-2 leading-tight break-words"
          style={{ color: "var(--color-lavender)" }}
        >
          Abracadabra…
        </h1>
        <p
          className="font-display text-lg md:text-2xl mb-6 italic"
          style={{ color: "var(--color-gold)" }}
        >
          cette page a disparu 🪄
        </p>
        <p
          className="text-sm md:text-base leading-relaxed mb-8"
          style={{ color: "var(--color-lavender-2)", opacity: 0.9 }}
        >
          On a beau remuer le chapeau de magicien, on ne trouve pas la page que
          tu cherches. Elle a peut-être changé d'adresse, ou alors le lien
          n'est plus valide.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-bold text-sm transition hover:opacity-90"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            ← Retour à l'accueil
          </Link>
          <Link
            href="/aide"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-sm transition border border-[var(--color-gold)]/40 bg-transparent text-[#f5f0ff] hover:bg-white/10"
          >
            💬 Besoin d'aide ?
          </Link>
        </div>
      </section>

      {/* Liens secondaires */}
      <nav className="relative z-10 mt-10 flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs"
        style={{ color: "var(--color-lavender-2)", opacity: 0.7 }}
      >
        <Link href="/tarifs" className="hover:opacity-100 hover:text-[var(--color-gold)]">
          Tarifs
        </Link>
        <Link href="/blog" className="hover:opacity-100 hover:text-[var(--color-gold)]">
          Blog
        </Link>
        <Link href="/quizz-mariage" className="hover:opacity-100 hover:text-[var(--color-gold)]">
          Quizz mariage
        </Link>
        <Link href="/quizz-bar" className="hover:opacity-100 hover:text-[var(--color-gold)]">
          Quizz bar
        </Link>
        <Link href="/aide" className="hover:opacity-100 hover:text-[var(--color-gold)]">
          Aide
        </Link>
      </nav>
    </main>
  );
}
