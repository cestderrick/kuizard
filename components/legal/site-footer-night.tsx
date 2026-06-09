import Link from "next/link";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ProjiatLogo } from "@/components/brand/projiat-logo";

/**
 * Variante "night" du footer pour les pages au thème sombre (admin,
 * payment/success, payment/cancel, joueur si besoin).
 */
export function SiteFooterNight() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(167,139,250,0.15)] bg-[var(--color-night-2)] text-[var(--color-lavender-2)]">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs opacity-90">
        <div className="flex flex-col gap-1">
          <p>
            © {year}{" "}
            <span className="font-display tracking-[2px] text-[var(--color-gold-light)] font-semibold">
              KUIZARD
            </span>{" "}
            — Quizz personnalisés
          </p>
          <p className="opacity-70 inline-flex items-center gap-1.5 flex-wrap">
            Site développé par{" "}
            <span className="inline-flex items-center gap-1">
              <ProjiatLogo size={14} color="currentColor" />
              <strong>Projiat</strong>
            </span>
            <span>· Tous droits réservés</span>
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/aide" className="hover:text-[var(--color-gold)]">
            FAQ
          </Link>
          <Link href="/suggestion" className="hover:text-[var(--color-gold)]">
            Suggestion
          </Link>
          <Link
            href="/mentions-legales"
            className="hover:text-[var(--color-gold)]"
          >
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-[var(--color-gold)]">
            CGU
          </Link>
          <Link href="/cgv" className="hover:text-[var(--color-gold)]">
            CGV
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-[var(--color-gold)]"
          >
            Confidentialité
          </Link>
          <Link href="/cookies" className="hover:text-[var(--color-gold)]">
            Cookies
          </Link>
          <LocaleSwitcher variant="night" />
        </nav>
      </div>
    </footer>
  );
}
