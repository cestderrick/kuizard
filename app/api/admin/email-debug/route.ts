// =============================================
// V47.14 — Diagnostic email envoi
// =============================================
// Endpoint admin-only qui reporte la config Resend et tente d'envoyer un
// email de test à l'admin connecté. Reporte clairement le pourquoi du
// silence si email ne part pas.

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true, name: true },
  });
  if (me?.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Admin only" },
      { status: 403 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kuizard.fr";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "(non défini)";
  const cronSecret = process.env.CRON_SECRET;

  const config = {
    RESEND_API_KEY: apiKey
      ? `set (commence par "${apiKey.slice(0, 3)}…", ${apiKey.length} chars)`
      : "❌ NON DÉFINIE — emails non envoyés, juste loggés en console",
    RESEND_FROM_EMAIL: fromEmail,
    NEXT_PUBLIC_APP_URL: appUrl,
    CRON_SECRET: cronSecret
      ? `set (${cronSecret.length} chars, commence par "${cronSecret.slice(0, 3)}…")`
      : "❌ NON DÉFINIE — cron daily-digest refusé",
  };

  // Compte admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true },
  });

  // Tentative d'envoi à l'admin courant
  let sendResult: unknown = "not attempted";
  if (apiKey) {
    const tpl = {
      subject: "🧪 Kuizard — Test email diagnostic",
      html: `<p>Salut ${me.name ?? me.email} !</p><p>Si tu reçois cet email, ta config Resend fonctionne ✅</p><p>From: ${fromEmail}</p><p>Date: ${new Date().toISOString()}</p>`,
      text: `Test email Kuizard - Si tu reçois ça, Resend fonctionne. From: ${fromEmail}`,
    };
    sendResult = await sendEmail({
      to: me.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  }

  return NextResponse.json({
    ok: true,
    config,
    admins: admins.map((a) => ({
      email: a.email,
      name: a.name,
    })),
    adminCount: admins.length,
    testEmail: {
      to: me.email,
      result: sendResult,
    },
    troubleshooting: {
      noKey:
        "Si RESEND_API_KEY ❌ → ajoute la dans .env VPS et `pm2 restart kuizard-app --update-env`",
      keyButFails:
        "Si erreur 401/403 → la clé est invalide ou révoquée. Va sur resend.com → API Keys.",
      keyButDomainError:
        "Si erreur 'domain not verified' → va sur resend.com → Domains et ajoute les DNS records",
      cronNotFiring:
        "Si CRON_SECRET ❌ → ajoute la, sinon le cron VPS curl renvoie 401 et aucun mail.",
    },
  });
}
