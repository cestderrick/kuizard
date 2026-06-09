// =============================================
// Helper pour récupérer la locale active (server components)
// =============================================

import { cookies, headers } from "next/headers";

import { LOCALES, type Locale, type Messages } from "@/lib/i18n/messages";

const COOKIE_NAME = "kz_locale";

const SUPPORTED: Locale[] = ["fr", "en", "es", "it", "de", "pt", "ru", "zh"];

function isLocale(v: string | undefined): v is Locale {
  return typeof v === "string" && SUPPORTED.includes(v as Locale);
}

/**
 * Détermine la locale active dans cet ordre :
 * 1. Cookie kz_locale (choix explicite du user)
 * 2. Accept-Language du navigateur (premier match parmi les supportées)
 * 3. Fallback "fr"
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  // Détection navigateur — on parse l'Accept-Language et on prend la
  // première préférence qui matche une locale supportée
  try {
    const h = await headers();
    const accept = h.get("accept-language") ?? "";
    const candidates = accept
      .split(",")
      .map((s) => s.trim().split(";")[0].toLowerCase().slice(0, 2));
    for (const c of candidates) {
      if (isLocale(c)) return c;
    }
  } catch {
    // ignore
  }

  return "fr";
}

/**
 * Merge profond : prend `base` (FR fallback) et override avec les valeurs
 * non-undefined de `over` (locale active). Une chaîne vide dans `over` est
 * traitée comme "manquante" et fallback sur FR.
 */
function mergeWithFallback<T>(base: T, over: T): T {
  if (typeof base !== "object" || base === null) return over ?? base;
  if (typeof over !== "object" || over === null) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const k of Object.keys(over as Record<string, unknown>)) {
    const a = (over as Record<string, unknown>)[k];
    const b = out[k];
    if (a === undefined || a === null) continue;
    if (typeof a === "string") {
      // Chaîne vide ou identique au FR ? On garde le FR
      if (a === "") continue;
      out[k] = a;
    } else if (typeof a === "object" && typeof b === "object" && b !== null) {
      out[k] = mergeWithFallback(b, a);
    } else {
      out[k] = a;
    }
  }
  return out as T;
}

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  if (locale === "fr") return LOCALES.fr;
  // Pour toutes les autres locales : on prend FR comme base, puis on override
  // avec les clés réellement traduites. Ça garantit qu'aucune chaîne n'est vide.
  return mergeWithFallback(LOCALES.fr, LOCALES[locale]);
}
