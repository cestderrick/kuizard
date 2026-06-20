"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; exact?: boolean };

const ITEMS: Item[] = [
  { href: "/", label: "Accueil", icon: "🏠", exact: true },
  { href: "/dashboard", label: "Tableau de bord", icon: "📊", exact: true },
  { href: "/dashboard/quizzes", label: "Mes quizz", icon: "🎩" },
  { href: "/dashboard/quizzes/library", label: "Quizthèque", icon: "📚" },
  { href: "/dashboard/mes-participations", label: "Mes participations", icon: "🕘" },
  { href: "/dashboard/stats", label: "Stats", icon: "📈" },
  { href: "/escape", label: "Escape (bêta)", icon: "🗝️" },
  { href: "/tarifs", label: "Tarifs", icon: "💳" },
];

/**
 * V36.1 — Burger button + drawer latéral mobile. S'affiche uniquement < md.
 * Le drawer est rendu via createPortal dans <body> pour échapper au
 * stacking context du header (qui a backdrop-filter, ce qui piège les
 * éléments fixed à l'intérieur).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = open ? (
    <div
      className="md:hidden fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className="absolute top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col overflow-y-auto"
        style={{ animation: "kz-slide-in 0.25s ease-out" }}
      >
        <div className="px-4 py-4 border-b border-violet-100 flex items-center justify-between">
          <p
            className="text-xs uppercase tracking-[2px] font-bold"
            style={{ color: "var(--color-violet-primary)" }}
          >
            ✨ Menu
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 transition"
            style={{ color: "var(--color-violet-deep)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition text-base " +
                  (isActive
                    ? "bg-[var(--color-violet-primary)]/10 text-[var(--color-violet-primary)] font-bold"
                    : "text-foreground hover:bg-zinc-100")
                }
              >
                <span className="text-xl" aria-hidden>
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
          <MobileLink href="/dashboard/profile" icon="👤" label="Mon profil" onClose={() => setOpen(false)} />
          <MobileLink href="/dashboard/subscription" icon="🔁" label="Mon abonnement" onClose={() => setOpen(false)} />
          <MobileLink href="/dashboard/payments" icon="💳" label="Mes paiements" onClose={() => setOpen(false)} />
          <MobileLink href="/dashboard/promos" icon="🎟️" label="Mes codes promos" onClose={() => setOpen(false)} />
          <MobileLink href="/dashboard/messages" icon="✉️" label="Messages" onClose={() => setOpen(false)} />
          <MobileLink href="/dashboard/suggestions" icon="💡" label="Suggestions" onClose={() => setOpen(false)} />
        </div>
      </aside>

      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes kz-slide-in{from{transform:translateX(100%);}to{transform:translateX(0);}}",
        }}
      />
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-violet-200 bg-white hover:bg-zinc-50 transition"
        style={{ color: "var(--color-violet-deep)" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

function MobileLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-zinc-100 hover:text-foreground transition"
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
