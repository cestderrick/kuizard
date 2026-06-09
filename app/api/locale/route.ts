// =============================================
// API REST — Changement de langue
// =============================================
// Endpoint dédié pour bypasser les soucis de server actions côté i18n
// (RSC cache + revalidate parfois flaky avec un changement de cookie).

import { NextResponse } from "next/server";

const VALID = new Set(["fr", "en", "es", "it", "de", "pt", "ru", "zh"]);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const locale = body.locale;
  if (!locale || !VALID.has(locale)) {
    return NextResponse.json({ ok: false, message: "Invalid locale" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set("kz_locale", locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
