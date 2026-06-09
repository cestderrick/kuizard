// Endpoint debug — retourne ce que le serveur lit pour la locale
// À supprimer après le débogage.

import { NextResponse } from "next/server";

import { getLocale } from "@/lib/i18n/get-locale";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "(no cookie header)";
  const acceptLang = req.headers.get("accept-language") ?? "(no accept-lang)";
  const detectedLocale = await getLocale();

  // Random pour vérifier qu'il n'y a aucun cache à aucun niveau
  const random = Math.random().toString(36).slice(2, 10);

  return NextResponse.json(
    {
      detectedLocale,
      rawCookieHeader: cookieHeader,
      acceptLanguage: acceptLang,
      timestamp: new Date().toISOString(),
      randomNonce: random,
    },
    {
      headers: {
        "Cache-Control":
          "private, no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
        Vary: "Cookie",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
