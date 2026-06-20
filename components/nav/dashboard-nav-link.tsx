"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Lien de nav dashboard avec état actif détecté via le pathname courant.
 * Style "pill" arrondi, fond violet doux quand actif.
 */
export function DashboardNavLink({
  href,
  label,
  exact,
  notMatching,
}: {
  href: string;
  label: string;
  /** Si true, match exact uniquement (utile pour /dashboard qui sinon match tout) */
  exact?: boolean;
  /** V47.3 : sous-chemins à NE PAS considérer comme actifs. Par exemple
   * `/dashboard/quizzes` ne doit pas être actif quand on est sur
   * `/dashboard/quizzes/library` (qui a son propre lien). */
  notMatching?: string[];
}) {
  const pathname = usePathname() ?? "";
  const baseActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
  const excluded =
    notMatching?.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    ) ?? false;
  const isActive = baseActive && !excluded;

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? "bg-[var(--color-violet-primary)]/10 text-[var(--color-violet-primary)]"
          : "text-muted-foreground hover:bg-zinc-100 hover:text-[var(--color-violet-deep)]"
      }`}
    >
      {label}
    </Link>
  );
}
