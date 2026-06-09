"use client";

import { useEffect, useState } from "react";

import { LocaleSelect } from "@/components/i18n/locale-select";

/**
 * Variante client du TopLocaleBar — lit la locale active via document.cookie
 * au lieu de next/headers. Utilisable depuis n'importe quel composant client.
 */
export function TopLocaleBarClient({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  const [locale, setLocale] = useState<string>("fr");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)kz_locale=([^;]+)/);
    if (match) setLocale(match[1]);
  }, []);

  return (
    <div className="absolute top-3 right-3 z-50">
      <LocaleSelect current={locale} variant={variant} />
    </div>
  );
}
