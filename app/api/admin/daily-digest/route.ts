// =============================================
// V47.8 — Récap quotidien admin par email
// =============================================
// Sécurisé par un CRON_SECRET. À appeler via cron sur la VPS :
//   0 6 * * * curl -sS "https://kuizard.com/api/admin/daily-digest" \
//     -H "Authorization: Bearer $CRON_SECRET" > /tmp/digest.log 2>&1
//
// Une fois la route exécutée, on calcule les stats du jour PRÉCÉDENT
// (Jour-1) et on envoie un email récap à l'admin (premier user avec
// role=ADMIN trouvé). Réponse JSON pour debug.

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { adminDailyDigestEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Auth via Bearer token
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET missing on server" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fenêtre = J-1 00:00 → J-1 23:59:59 (UTC)
    const now = new Date();
    const todayUtcMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const yesterdayStart = new Date(
      todayUtcMidnight.getTime() - 24 * 60 * 60 * 1000
    );
    const yesterdayEnd = todayUtcMidnight; // exclusif

    const dateLabel = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(yesterdayStart);

    const [
      newUsersToday,
      totalUsers,
      quizzesCreatedToday,
      totalQuizzes,
      messagesReceivedToday,
      unreadConversations,
      participationsToday,
      paymentsToday,
      paymentsAggregate,
      newSubscriptionsToday,
      templatesUsedToday,
      topQuizAgg,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } },
      }),
      prisma.user.count(),
      prisma.quiz.count({
        where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } },
      }),
      prisma.quiz.count(),
      prisma.message.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
          senderRole: "USER",
        },
      }),
      prisma.conversation.count({ where: { unreadByAdmin: true } }),
      prisma.participation.count({
        where: {
          completedAt: { gte: yesterdayStart, lt: yesterdayEnd, not: null },
        },
      }),
      prisma.payment.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
          status: "succeeded",
        },
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
          status: "succeeded",
        },
        _sum: { amountCents: true },
      }),
      prisma.subscription.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
          status: { in: ["active", "trialing"] },
        },
      }),
      prisma.quiz.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
          fromTemplateSlug: { not: null },
        },
      }),
      // Top quiz par participations terminées aujourd'hui
      prisma.participation.groupBy({
        by: ["quizId"],
        where: {
          completedAt: { gte: yesterdayStart, lt: yesterdayEnd, not: null },
        },
        _count: true,
        orderBy: { _count: { quizId: "desc" } },
        take: 1,
      }),
    ]);

    let topQuizToday: { title: string; participations: number } | null = null;
    if (topQuizAgg.length > 0) {
      const top = topQuizAgg[0];
      const q = await prisma.quiz.findUnique({
        where: { id: top.quizId },
        select: { title: true },
      });
      if (q) {
        topQuizToday = { title: q.title, participations: top._count };
      }
    }

    // Cherche le premier admin pour lui envoyer le mail
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    if (admins.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "No admin user found to receive the digest",
      });
    }

    const tpl = adminDailyDigestEmail({
      date: dateLabel,
      newUsersToday,
      totalUsers,
      quizzesCreatedToday,
      totalQuizzes,
      messagesReceivedToday,
      unreadConversations,
      participationsToday,
      paymentsToday,
      paymentsAmountCents: paymentsAggregate._sum.amountCents ?? 0,
      newSubscriptionsToday,
      templatesUsedToday,
      topQuizToday,
    });

    // Envoi à chaque admin
    const results = await Promise.all(
      admins.map((a) =>
        sendEmail({
          to: a.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        }).catch((e) => ({ error: e instanceof Error ? e.message : "unknown" }))
      )
    );

    return NextResponse.json({
      ok: true,
      date: dateLabel,
      stats: {
        newUsersToday,
        totalUsers,
        quizzesCreatedToday,
        totalQuizzes,
        participationsToday,
        templatesUsedToday,
        paymentsToday,
        paymentsAmountCents: paymentsAggregate._sum.amountCents ?? 0,
        newSubscriptionsToday,
        messagesReceivedToday,
        unreadConversations,
        topQuizToday,
      },
      sentToCount: admins.length,
      sendResults: results,
    });
  } catch (err) {
    console.error("[daily-digest] error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}
