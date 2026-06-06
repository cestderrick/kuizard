import Link from "next/link";

/**
 * Footer global présent sur toutes les pages "normales" (dashboard, admin,
 * auth, payments, etc.). Les pages joueur (/q/[code]) et l'home gardent
 * leur propre footer custom pour ne pas casser leur layout edge-to-edge.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

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
          <p className="opacity-70">
            Édité par <strong>Projiat</strong> · Tous droits réservés
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/aide"
            className="hover:text-[var(--color-violet-primary)]"
          >
            FAQ
          </Link>
          <Link
            href="/suggestion"
            className="hover:text-[var(--color-violet-primary)]"
          >
            Suggestion
          </Link>
          <Link
            href="/mentions-legales"
            className="hover:text-[var(--color-violet-primary)]"
          >
            Mentions légales
          </Link>
          <Link
            href="/cgu"
            className="hover:text-[var(--color-violet-primary)]"
          >
            CGU
          </Link>
          <Link
            href="/cgv"
            className="hover:text-[var(--color-violet-primary)]"
          >
            CGV
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-[var(--color-violet-primary)]"
          >
            Confidentialité
          </Link>
          <Link
            href="/cookies"
            className="hover:text-[var(--color-violet-primary)]"
          >
            Cookies
          </Link>
        </nav>
      </div>
    </footer>
  );
}
