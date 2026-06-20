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
  // V47.10 — Double auth :
  //   1. Bearer CRON_SECRET (utilisé par le cron VPS)
  //   2. Session admin connectée (pour le bouton "Envoyer maintenant" dans /admin)
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  const isCronAuth = !!expected && authHeader === `Bearer ${expected}`;

  let isAdminAuth = false;
  if (!isCronAuth) {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdminAuth = user?.role === "ADMIN";
    }
  }

  if (!isCronAuth && !isAdminAuth) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unauthorized. Connectez-vous en tant qu'admin OU passez le Bearer CRON_SECRET.",
      },
      { status: 401 }
    );
  }

  try {
    // V47.16 : par défaut = J-1 (le cron à 6h envoie le récap d'hier).
    // Mais si ?range=today (utilisé par le bouton "Envoyer maintenant" du
    // admin), on calcule sur le jour COURANT — pratique pour voir le
    // résultat d'une action qu'on vient de faire.
    const url = new URL(req.url);
    const isToday = url.searchParams.get("range") === "today";

    const now = new Date();
    const todayUtcMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const yesterdayStart = new Date(
      todayUtcMidnight.getTime() - 24 * 60 * 60 * 1000
    );

    // Fenêtre selon le mode
    const windowStart = isToday ? todayUtcMidnight : yesterdayStart;
    const windowEnd = isToday
      ? new Date(todayUtcMidnight.getTime() + 24 * 60 * 60 * 1000)
      : todayUtcMidnight;

    const dateLabel =
      (isToday ? "AUJOURD'HUI — " : "") +
      new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(windowStart);

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
        where: { createdAt: { gte: windowStart, lt: windowEnd } },
      }),
      prisma.user.count(),
      prisma.quiz.count({
        where: { createdAt: { gte: windowStart, lt: windowEnd } },
      }),
      prisma.quiz.count(),
      prisma.message.count({
        where: {
          createdAt: { gte: windowStart, lt: windowEnd },
          senderRole: "USER",
        },
      }),
      prisma.conversation.count({ where: { unreadByAdmin: true } }),
      prisma.participation.count({
        where: {
          completedAt: { gte: windowStart, lt: windowEnd, not: null },
        },
      }),
      prisma.payment.count({
        where: {
          createdAt: { gte: windowStart, lt: windowEnd },
          status: "succeeded",
        },
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: windowStart, lt: windowEnd },
          status: "succeeded",
        },
        _sum: { amountCents: true },
      }),
      prisma.subscription.count({
        where: {
          createdAt: { gte: windowStart, lt: windowEnd },
          status: { in: ["active", "trialing"] },
        },
      }),
      prisma.quiz.count({
        where: {
          createdAt: { gte: windowStart, lt: windowEnd },
          fromTemplateSlug: { not: null },
        },
      }),
      // Top quiz par participations terminées aujourd'hui
      prisma.participation.groupBy({
        by: ["quizId"],
        where: {
          completedAt: { gte: windowStart, lt: windowEnd, not: null },
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
