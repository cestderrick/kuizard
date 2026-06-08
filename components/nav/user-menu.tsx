"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { signoutAction } from "@/lib/actions/auth";

/**
 * Avatar cliquable + dropdown menu (Profil / Abo / Paiements / Déconnexion).
 * Responsive : marche en mobile comme en desktop. Le dropdown est positionné
 * à droite et se ferme au clic extérieur ou Escape.
 */
export function UserMenu({
  name,
  email,
  isAdmin,
}: {
  name: string | null;
  email: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme au clic extérieur / Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = name ?? email.split("@")[0];
  const initials = (name ?? email)
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu utilisateur"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-zinc-100 transition"
      >
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full font-display text-sm font-bold text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
          }}
        >
          {initials || "?"}
        </span>
        <span className="hidden sm:inline text-sm text-muted-foreground max-w-[140px] truncate">
          {displayName}
        </span>
        <svg
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-violet-100 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-violet-100">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>

          <div className="py-1.5">
            <MenuLink
              href="/dashboard/profile"
              icon="👤"
              label="Mon profil"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/dashboard/subscription"
              icon="🔁"
              label="Mon abonnement"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/dashboard/payments"
              icon="💳"
              label="Mes paiements"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/dashboard/promos"
              icon="🎟️"
              label="Mes codes promos"
              onClick={() => setOpen(false)}
            />
          </div>

          {isAdmin && (
            <div className="py-1.5 border-t border-violet-100">
              <MenuLink
                href="/admin"
                icon="🛡️"
                label="Espace admin"
                accent
                onClick={() => setOpen(false)}
              />
            </div>
          )}

          <div className="py-1.5 border-t border-violet-100">
            <form action={signoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition"
              >
                <span aria-hidden>🚪</span>
                <span>Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  accent,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={`flex items-center gap-3 px-4 py-2 text-sm transition ${
        accent
          ? "text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 font-semibold"
          : "text-foreground hover:bg-violet-50"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
