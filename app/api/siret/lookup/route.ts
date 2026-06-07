// =============================================
// API — Vérification SIRET + lookup INSEE
// =============================================
//
// Endpoint REST classique (vs server action) — plus simple à débugger côté
// client et moins sensible aux changements de signature Next.

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { checkSiret } from "@/lib/siret/validate";
import { lookupSiret } from "@/lib/siret/insee";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Authentification : seuls les users connectés peuvent appeler ça
  // (sinon n'importe qui pourrait scraper l'API via notre serveur)
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siret = searchParams.get("siret") ?? "";

  if (!siret) {
    return NextResponse.json({ ok: false, message: "SIRET manquant." });
  }

  try {
    const check = checkSiret(siret);
    if (!check.ok) {
      return NextResponse.json({ ok: false, message: check.message });
    }

    const result = await lookupSiret(siret);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message });
    }

    return NextResponse.json({
      ok: true,
      company: result.company,
      message:
        result.company.state === "ceased"
          ? `⚠️ ${result.company.companyName} apparaît comme cessée.`
          : `✓ ${result.company.companyName}`,
    });
  } catch (err) {
    console.error("[api/siret/lookup] err:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur serveur. Réessaie ou tape la raison sociale à la main.",
      },
      { status: 500 }
    );
  }
}
