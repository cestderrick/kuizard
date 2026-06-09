"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; exact?: boolean };

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊", exact: true },
  { href: "/dashboard/quizzes", label: "Mes quizz", icon: "🎩" },
  { href: "/dashboard/stats", label: "Stats", icon: "📈" },
  { href: "/dashboard/messages", label: "Messages", icon: "✉️" },
  { href: "/dashboard/suggestions", label: "Suggestions", icon: "💬" },
  { href: "/", label: "Page d'accueil", icon: "🏠" },
];

/**
 * Burger button + drawer latéral mobile. S'affiche uniquement < md.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // Ferme le drawer quand on change de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll body quand drawer ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu navigation"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Drawer + overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay sombre */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Panel latéral */}
          <aside className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right">
            <div className="px-4 py-4 border-b border-violet-100">
              <p className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
                Navigation
              </p>
            </div>

            <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
              {ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                      isActive
                        ? "bg-[var(--color-violet-primary)]/10 text-[var(--color-violet-primary)] font-semibold"
                        : "text-foreground hover:bg-zinc-100"
                    }`}
                  >
                    <span className="text-lg" aria-hidden>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-2 py-3 border-t border-violet-100 flex flex-col gap-0.5">
              <p className="px-3 text-[10px] uppercase tracking-[2px] text-muted-foreground font-semibold mb-1">
                Compte
              </p>
              <MobileLink href="/dashboard/profile" icon="👤" label="Mon profil" />
              <MobileLink
                href="/dashboard/subscription"
                icon="🔁"
                label="Mon abonnement"
              />
              <MobileLink
                href="/dashboard/payments"
                icon="💳"
                label="Mes paiements"
              />
              <MobileLink
                href="/dashboard/promos"
                icon="🎟️"
                label="Mes codes promos"
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-zinc-100 hover:text-foreground transition"
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
