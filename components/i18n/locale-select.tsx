"use client";

import { useTransition } from "react";

import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";
import { setLocaleAction } from "@/lib/actions/locale";

/**
 * Sélecteur de langue — appelle la server action puis force un reload complet.
 * `router.refresh()` ne suffit pas car les RSC sont fortement cachés et ne
 * re-lisent pas getLocale() après la mise à jour du cookie. Un location.reload
 * garantit que toute l'arbre est re-fetché avec le nouveau cookie.
 */
export function LocaleSelect({
  current,
  variant,
}: {
  current: string;
  variant: "light" | "night";
}) {
  const [pending, startTransition] = useTransition();
  const isLight = variant === "light";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const formData = new FormData();
    formData.set("locale", value);
    startTransition(async () => {
      await setLocaleAction(formData);
      // Reload complet — le navigateur renvoie le cookie kz_locale mis à jour
      // et tous les server components ré-exécutent getLocale().
      window.location.reload();
    });
  }

  return (
    <select
      defaultValue={current}
      onChange={handleChange}
      disabled={pending}
      aria-label="Choisir la langue"
      className={`text-xs px-2 py-1 rounded-md cursor-pointer transition disabled:opacity-60 ${
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
