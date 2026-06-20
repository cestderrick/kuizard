// =============================================
// Webhook Stripe — source de vérité des paiements
// =============================================
//
// Configurer dans le dashboard Stripe → Developers → Webhooks :
//   - Endpoint URL : https://kuizard.fr/api/webhooks/stripe
//   - Événements à écouter : checkout.session.completed,
//     payment_intent.payment_failed, charge.refunded,
//     customer.subscription.created/updated/deleted
//
// Stripe fournit un `whsec_...` qu'on colle dans STRIPE_WEBHOOK_SECRET.

import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";
import { sendEmail } from "@/lib/email/client";
import {
  paymentReceiptEmail,
  subscriptionActivatedEmail,
} from "@/lib/email/templates";

// Body brut requis pour la vérif de signature
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret." },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[Stripe webhook] Signature invalide:", err);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      default:
        // On log pour debug mais on ne fail pas — d'autres events peuvent
        // arriver si Stripe en envoie plus que ce qu'on écoute
        console.log("[Stripe webhook] Event ignoré:", event.type);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook] Erreur traitement:", err);
    // On renvoie 500 pour que Stripe retente
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}

// ============================================================
// Handlers
// ============================================================

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const metadata = session.metadata ?? {};
  const userId = metadata.userId;
  const quizId = metadata.quizId;
  const planSlug = metadata.planSlug;
  const promoCodeId = metadata.promoCodeId || null;

  if (!session.id) return;

  // Update du Payment correspondant
  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: "succeeded",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
      amountCents: session.amount_total ?? undefined,
    },
  });

  // Bump du compteur de promo si utilisé
  if (promoCodeId) {
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { redemptions: { increment: 1 } },
    });
  }

  // V47.17 : on envoie le mail dans 2 cas distincts maintenant :
  //   1. Paiement quiz spécifique (quizId + planSlug)
  //   2. Achat de crédit one-shot (planSlug, pas de quizId)
  // Avant, seul le cas 1 était traité → aucun mail pour les crédits.

  // Cas 1 : paiement pour un quiz spécifique
  if (quizId && planSlug) {
    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        isPaid: true,
      },
    });

    try {
      const [user, plan, quiz] = await Promise.all([
        userId
          ? prisma.user.findUnique({
              where: { id: userId },
              select: { email: true, name: true },
            })
          : null,
        prisma.planConfig.findUnique({
          where: { slug: planSlug },
          select: { name: true },
        }),
        prisma.quiz.findUnique({
          where: { id: quizId },
          select: { title: true, code: true },
        }),
      ]);
      if (user?.email && plan && quiz) {
        const tpl = paymentReceiptEmail({
          name: user.name,
          amountCents: session.amount_total ?? 0,
          planSlug,
          planName: plan.name,
          quizTitle: quiz.title,
          quizCode: quiz.code,
        });
        const r = await sendEmail({
          to: user.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
        console.log("[stripe webhook] receipt email (quiz) sent:", r);
      }
    } catch (err) {
      console.error("[stripe webhook] receipt email (quiz) failed:", err);
    }
  } else if (planSlug && !quizId && userId) {
    // Cas 2 : achat de crédit one-shot (non lié à un quiz)
    try {
      const [user, plan] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        }),
        prisma.planConfig.findUnique({
          where: { slug: planSlug },
          select: { name: true },
        }),
      ]);
      if (user?.email && plan) {
        // On utilise le même template, avec des libellés "crédit" plutôt
        // que "quiz X"
        const tpl = paymentReceiptEmail({
          name: user.name,
          amountCents: session.amount_total ?? 0,
          planSlug,
          planName: plan.name,
          quizTitle: `Crédit ${plan.name}`,
          quizCode: "(à appliquer)",
        });
        const r = await sendEmail({
          to: user.email,
          subject: `Reçu Kuizard — Crédit ${plan.name} acheté`,
          html: tpl.html.replace(
            "Ton quizz <strong>Crédit",
            "Ton crédit <strong>"
          ),
          text: tpl.text,
        });
        console.log("[stripe webhook] receipt email (credit) sent:", r);
      } else {
        console.warn(
          "[stripe webhook] credit email skipped — user.email or plan missing",
          { hasUser: !!user, hasEmail: !!user?.email, hasPlan: !!plan }
        );
      }
    } catch (err) {
      console.error("[stripe webhook] receipt email (credit) failed:", err);
    }
  } else {
    console.warn(
      "[stripe webhook] checkout.session.completed sans quizId ni cas crédit",
      { quizId, planSlug, userId }
    );
  }

  // Si pas trouvé via stripeSessionId (cas rare où on a perdu le pending),
  // on crée le Payment maintenant
  const existing = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (!existing && userId) {
    await prisma.payment.create({
      data: {
        userId,
        quizId: quizId || null,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        amountCents: session.amount_total ?? 0,
        planSlug: planSlug || null,
        promoCodeId,
        status: "succeeded",
      },
    });
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: pi.id },
    data: { status: "failed" },
  });
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const piId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!piId) return;
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: piId },
    data: { status: "refunded" },
  });
}

async function handleSubscriptionUpsert(
  sub: Stripe.Subscription
): Promise<void> {
  // On retrouve le user via le Customer
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return;

  // On essaye d'extraire le plan via le Price ID (qu'on a stocké côté PlanConfig)
  const priceId = sub.items.data[0]?.price?.id;
  let planSlug = "unknown";
  let planName: string | null = null;
  let planAmountCents = 0;
  let planInterval: string | null = null;
  if (priceId) {
    const plan = await prisma.planConfig.findFirst({
      where: { stripePriceId: priceId },
      select: { slug: true, name: true, priceCents: true, interval: true },
    });
    if (plan) {
      planSlug = plan.slug;
      planName = plan.name;
      planAmountCents = plan.priceCents;
      planInterval = plan.interval;
    }
  }

  const currentPeriodEnd = (sub as unknown as { current_period_end?: number })
    .current_period_end;

  const wasNew =
    (await prisma.subscription.count({
      where: { stripeSubscriptionId: sub.id },
    })) === 0;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    update: {
      status: sub.status,
      stripePriceId: priceId,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      planSlug,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      planSlug,
    },
  });

  // Email "abo activé" uniquement à la première activation
  if (wasNew && sub.status === "active" && planName && user.email) {
    try {
      const tpl = subscriptionActivatedEmail({
        name: user.name,
        planName,
        amountCents: planAmountCents,
        interval: planInterval,
      });
      void sendEmail({
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    } catch (err) {
      console.error("[stripe webhook] sub email failed:", err);
    }
  }
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription
): Promise<void> {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status: "canceled",
      endedAt: new Date(),
    },
  });
}
