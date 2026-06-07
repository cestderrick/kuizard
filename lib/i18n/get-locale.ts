// =============================================
// Helper pour récupérer la locale active (server components)
// =============================================

import { cookies, headers } from "next/headers";

import { LOCALES, type Locale, type Messages } from "@/lib/i18n/messages";

const COOKIE_NAME = "kz_locale";

function isLocale(v: string | undefined): v is Locale {
  return v === "fr" || v === "en";
}

/**
 * Détermine la locale active dans cet ordre :
 * 1. Cookie kz_locale (choix explicite du user)
 * 2. Accept-Language du navigateur
 * 3. Fallback "fr"
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  // Détection navigateur
  try {
    const h = await headers();
    const accept = h.get("accept-language") ?? "";
    if (accept.toLowerCase().startsWith("en")) return "en";
  } catch {
    // ignore
  }

  return "fr";
}

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  return LOCALES[locale];
}
