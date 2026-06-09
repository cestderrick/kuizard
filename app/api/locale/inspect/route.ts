// Endpoint d'inspection des messages chargés en runtime.
// À SUPPRIMER après le débogage.

import { NextResponse } from "next/server";

import { LOCALES } from "@/lib/i18n/messages";
import { getLocale, getMessages } from "@/lib/i18n/get-locale";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const askedLocale = (url.searchParams.get("locale") ?? "en") as keyof typeof LOCALES;

  const detectedLocale = await getLocale();
  const messages = await getMessages();

  // Échantillons pour vérifier que les traductions sont chargées
  const sample = {
    detectedLocale,
    forLocale: askedLocale,
    // Ce que retourne getMessages() pour la locale active
    "messages.home.step1_title": messages.home?.step1_title,
    "messages.home.step1_desc": messages.home?.step1_desc,
    "messages.home.how_eyebrow": messages.home?.how_eyebrow,
    "messages.nav.dashboard": messages.nav?.dashboard,
    // Ce que LOCALES contient directement pour la locale demandée
    "LOCALES[ASKED].home.step1_title": LOCALES[askedLocale]?.home?.step1_title,
    "LOCALES[ASKED].home.step1_desc": LOCALES[askedLocale]?.home?.step1_desc,
    "LOCALES[ASKED].nav.dashboard": LOCALES[askedLocale]?.nav?.dashboard,
    // Liste des locales chargées
    available_locales: Object.keys(LOCALES),
    // A-t-on chargé le json auto ?
    locales_with_home_step1: Object.fromEntries(
      Object.entries(LOCALES).map(([k, v]) => [
        k,
        v.home?.step1_desc ? v.home.step1_desc.slice(0, 50) + "…" : "(missing)",
      ])
    ),
  };

  return NextResponse.json(sample, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
