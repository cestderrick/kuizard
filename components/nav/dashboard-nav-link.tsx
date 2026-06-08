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
}: {
  href: string;
  label: string;
  /** Si true, match exact uniquement (utile pour /dashboard qui sinon match tout) */
  exact?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

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
