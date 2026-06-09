"use client";

import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

/**
 * Select natif qui soumet automatiquement son form parent au changement.
 * Utilisé dans LocaleSwitcher (server component) qui contient déjà le form
 * + l'action.
 */
export function LocaleSelect({
  current,
  variant,
}: {
  current: string;
  variant: "light" | "night";
}) {
  const isLight = variant === "light";
  return (
    <select
      name="locale"
      defaultValue={current}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      aria-label="Choisir la langue"
      className={`text-xs px-2 py-1 rounded-md cursor-pointer transition ${
        isLight
          ? "bg-white border border-violet-100 text-foreground hover:border-[var(--color-violet-primary)]"
          : "bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] hover:border-[var(--color-gold)]"
      }`}
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc.value} value={loc.value}>
          {loc.flag} {loc.label}
        </option>
      ))}
    </select>
  );
}
