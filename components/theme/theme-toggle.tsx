"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Variant = "light" | "night";

/**
 * Toggle dark mode — un bouton qui cycle entre clair / sombre / système.
 * On affiche un soleil/lune ASCII pour pas dépendre d'une lib d'icônes.
 *
 * - variant "light" : sur fond clair (couleurs violettes)
 * - variant "night" : sur fond sombre (couleurs lavende)
 */
export function ThemeToggle({ variant = "light" }: { variant?: Variant }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes ne sait pas la valeur réelle avant la 1re render côté client.
  // Pour éviter un mismatch SSR/CSR, on attend mounted avant d'afficher l'icône.
  useEffect(() => setMounted(true), []);

  const isLight = variant === "light";
  const baseCls = `text-xs px-2 py-1 rounded-md cursor-pointer transition select-none ${
    isLight
      ? "bg-white border border-violet-100 text-foreground hover:border-[var(--color-violet-primary)]"
      : "bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] hover:border-[var(--color-gold)]"
  }`;

  const handleToggle = () => {
    const current = resolvedTheme === "dark" ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  };

  // Affichage durant SSR / 1ère hydratation : placeholder neutre (icône
  // demi-lune ou soleil-lune symbole de la fonctionnalité)
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Changer de thème"
        className={baseCls}
        suppressHydrationWarning
      >
        🌓
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const icon = isDark ? "☀️" : "🌙";
  const label = isDark ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label + ` (actuel : ${theme === "system" ? "système" : theme})`}
      className={baseCls}
    >
      {icon}
    </button>
  );
}
