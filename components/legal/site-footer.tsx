import Link from "next/link";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ProjiatLogo } from "@/components/brand/projiat-logo";
import { getMessages } from "@/lib/i18n/get-locale";

/**
 * Footer global présent sur toutes les pages "normales" (dashboard, admin,
 * auth, payments, etc.). Les pages joueur (/q/[code]) et l'home gardent
 * leur propre footer custom pour ne pas casser leur layout edge-to-edge.
 */
export async function SiteFooter() {
  const year = new Date().getFullYear();
  const msgs = await getMessages();
  const t = msgs.footer;

  return (
    <footer className="border-t border-violet-100 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
        <div className="flex flex-col gap-1">
          <p>
            © {year}{" "}
            <span className="font-display tracking-[2px] text-[var(--color-violet-deep)] font-semibold">
              KUIZARD
            </span>{" "}
            — Quizz personnalisés pour tes évènements
          </p>
          <p className="opacity-70 inline-flex items-center gap-1.5">
            Site développé par{" "}
            <span className="inline-flex items-center gap-1">
              <ProjiatLogo size={14} color="currentColor" />
              <strong>Projiat</strong>
            </span>
            <span>· Tous droits réservés</span>
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/aide" className="hover:text-[var(--color-violet-primary)]">
            {t.faq}
          </Link>
          <Link
            href="/suggestion"
            className="hover:text-[var(--color-violet-primary)]"
          >
            {t.suggestion}
          </Link>
          <Link
            href="/mentions-legales"
            className="hover:text-[var(--color-violet-primary)]"
          >
            {t.legal}
          </Link>
          <Link href="/cgu" className="hover:text-[var(--color-violet-primary)]">
            {t.cgu}
          </Link>
          <Link href="/cgv" className="hover:text-[var(--color-violet-primary)]">
            {t.cgv}
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-[var(--color-violet-primary)]"
          >
            {t.privacy}
          </Link>
          <Link
            href="/cookies"
            className="hover:text-[var(--color-violet-primary)]"
          >
            {t.cookies}
          </Link>
          <LocaleSwitcher variant="light" />
        </nav>
      </div>
    </footer>
  );
}
