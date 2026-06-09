// Endpoint debug — retourne ce que le serveur lit pour la locale
// À supprimer après le débogage.

import { NextResponse } from "next/server";

import { getLocale } from "@/lib/i18n/get-locale";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "(no cookie header)";
  const acceptLang = req.headers.get("accept-language") ?? "(no accept-lang)";
  const detectedLocale = await getLocale();

  return NextResponse.json(
    {
      detectedLocale,
      rawCookieHeader: cookieHeader,
      acceptLanguage: acceptLang,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
