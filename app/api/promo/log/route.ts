// =============================================
// V51 — API /api/promo/log : track view/copy d'un code promo société
// =============================================

import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { logCompanyPromoUsage } from "@/lib/promo/company-promo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const promoCodeId = String(body.promoCodeId ?? "");
    const quizId = body.quizId ? String(body.quizId) : null;
    const action = body.action === "copy" ? "copy" : "view";
    if (!promoCodeId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const h = await headers();
    const ip =
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;
    await logCompanyPromoUsage(promoCodeId, quizId, action, ip);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
