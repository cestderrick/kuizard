"use client";

import { useState } from "react";

import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

/**
 * Sélecteur de langue — appelle un endpoint REST classique (plus fiable que
 * les server actions pour ce cas), puis force un reload complet. Le serveur
 * pose le cookie kz_locale via Set-Cookie dans la réponse.
 */
export function LocaleSelect({
  current,
  variant,
}: {
  current: string;
  variant: "light" | "night";
}) {
  const [pending, setPending] = useState(false);
  const isLight = variant === "light";

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === current) return;
    setPending(true);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: value }),
        cache: "no-store",
      });
      if (!res.ok) {
        setPending(false);
        console.error("[locale] failed", await res.text());
        return;
      }
      // Reload complet — le navigateur renvoie le nouveau cookie kz_locale
      // et tous les server components ré-exécutent getLocale().
      window.location.reload();
    } catch (err) {
      setPending(false);
      console.error("[locale] error", err);
    }
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
