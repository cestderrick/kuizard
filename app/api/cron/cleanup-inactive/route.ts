// =============================================
// Cron endpoint — Suppression auto des comptes inactifs (RGPD)
// =============================================
//
// Règles :
// - Compte inactif = dernière connexion > INACTIVITY_DAYS (default: 1095 = 3 ans).
//   Si lastLoginAt null, on retombe sur createdAt.
// - 30 jours AVANT la suppression, on envoie un email d'avertissement
//   (et on stocke `inactivityWarnedAt` pour ne pas spammer).
// - À la date butoir : suppression effective (cascade gérée par schema).
//
// Protection : header `Authorization: Bearer <CRON_SECRET>` requis.
// À déclencher quotidiennement (3h du matin, voir docs/backup-setup.md).

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { inactivityWarningEmail } from "@/lib/email/templates-extra";

export const dynamic = "force-dynamic";

const INACTIVITY_DAYS = parseInt(
  process.env.INACTIVITY_DAYS ?? "1095",
  10
);
const WARNING_DAYS_BEFORE = 30;

function dateMinusDays(d: number): Date {
  return new Date(Date.now() - d * 86400 * 1000);
}

export async function POST(req: Request) {
  // Auth
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoffDelete = dateMinusDays(INACTIVITY_DAYS);
  const cutoffWarning = dateMinusDays(INACTIVITY_DAYS - WARNING_DAYS_BEFORE);

  // 1. Envoi d'avertissements pour ceux qui approchent du seuil
  const toWarn = await prisma.user.findMany({
    where: {
      AND: [
        // Inactivité approchée du seuil (entre cutoffDelete et cutoffWarning)
        {
          OR: [
            { lastLoginAt: { lt: cutoffWarning, gte: cutoffDelete } },
            {
              lastLoginAt: null,
              createdAt: { lt: cutoffWarning, gte: cutoffDelete },
            },
          ],
        },
        // Pas déjà averti
        { inactivityWarnedAt: null },
        // Pas un admin
        { role: "USER" },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 200,
  });

  let warned = 0;
  for (const u of toWarn) {
    try {
      const tpl = inactivityWarningEmail({
        name: u.name,
        daysRemaining: WARNING_DAYS_BEFORE,
      });
      await sendEmail({
        to: u.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
      await prisma.user.update({
        where: { id: u.id },
        data: { inactivityWarnedAt: new Date() },
      });
      warned++;
    } catch (err) {
      console.error("[cron cleanup] warning email failed:", u.id, err);
    }
  }

  // 2. Suppression effective des comptes vraiment inactifs (au-delà du seuil)
  const toDelete = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { lastLoginAt: { lt: cutoffDelete } },
            { lastLoginAt: null, createdAt: { lt: cutoffDelete } },
          ],
        },
        { role: "USER" },
      ],
    },
    select: { id: true, email: true },
    take: 100, // sécurité : pas plus de 100 par run
  });

  let deleted = 0;
  for (const u of toDelete) {
    try {
      await prisma.user.delete({ where: { id: u.id } });
      deleted++;
    } catch (err) {
      console.error("[cron cleanup] delete failed:", u.id, err);
    }
  }

  return NextResponse.json({
    ok: true,
    inactivityDays: INACTIVITY_DAYS,
    warned,
    deleted,
    summary: `${warned} avertissement(s) envoyé(s), ${deleted} compte(s) supprimé(s).`,
  });
}
