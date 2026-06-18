"use server";

// =============================================
// Server Actions — Stripe Checkout (paiement quizz)
// =============================================
//
// Flow :
// 1. createCheckoutSessionAction : crée une session Stripe et renvoie son URL
// 2. Front redirige vers cette URL (page Checkout hostée par Stripe)
// 3. Stripe redirige vers /payment/success ou /payment/cancel
// 4. Webhook /api/webhooks/stripe enregistre le paiement en BDD (source de vérité)

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";

export type CheckoutState = {
  ok: boolean;
  message?: string;
  url?: string;
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.fr";

export async function createCheckoutSessionAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise pour payer." };
  }

  const quizId = formData.get("quizId");
  const planSlug = formData.get("planSlug");
  const promoCode = formData.get("promoCode");

  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }
  if (typeof planSlug !== "string" || !planSlug) {
    return { ok: false, message: "Plan manquant." };
  }

  // Vérifie que le user possède bien ce quizz
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, userId: true, title: true, code: true },
  });
  if (!quiz || quiz.userId !== session.user.id) {
    return { ok: false, message: "Quizz introuvable." };
  }

  const plan = await prisma.planConfig.findUnique({
    where: { slug: planSlug },
  });
  if (!plan || !plan.isActive) {
    return { ok: false, message: "Plan invalide ou désactivé." };
  }
  if (plan.type !== "one_shot") {
    return { ok: false, message: "Ce plan n'est pas un paiement unique." };
  }
  if (plan.priceCents <= 0) {
    return { ok: false, message: "Plan gratuit — pas de checkout nécessaire." };
  }

  // Code promo optionnel
  let stripeCouponIds: string[] = [];
  let promoCodeId: string | undefined;
  if (typeof promoCode === "string" && promoCode.trim()) {
    const code = promoCode.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (
      promo &&
      promo.isActive &&
      (!promo.expiresAt || promo.expiresAt > new Date()) &&
      (!promo.maxRedemptions || promo.redemptions < promo.maxRedemptions) &&
      (!promo.planSlug || promo.planSlug === plan.slug) &&
      promo.stripeCouponId
    ) {
      stripeCouponIds = [promo.stripeCouponId];
      promoCodeId = promo.id;
    }
  }

  // Récupère ou crée le Customer Stripe pour ce user (utile pour l'historique
  // côté Stripe ; pas obligatoire mais pratique pour le portail client futur)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeCustomerId: true,
      email: true,
      name: true,
      accountType: true,
      companyName: true,
      siret: true,
      vatNumber: true,
    },
  });
  if (!user) return { ok: false, message: "Utilisateur introuvable." };

  const isPro = user.accountType === "BUSINESS";
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      // Pour un compte pro, on met le nom légal de la société comme nom de
      // facturation (apparaît sur les factures Stripe)
      name: isPro
        ? user.companyName ?? user.name ?? undefined
        : user.name ?? undefined,
      tax_id_data:
        isPro && user.vatNumber
          ? [{ type: "eu_vat", value: user.vatNumber }]
          : undefined,
      metadata: {
        userId: session.user.id,
        accountType: user.accountType,
        siret: user.siret ?? "",
        companyName: user.companyName ?? "",
      },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  } else if (isPro && (user.companyName || user.siret)) {
    // Pro : on met à jour le customer existant pour propager les changements
    // de raison sociale / SIRET
    try {
      await stripe.customers.update(customerId, {
        name: user.companyName ?? user.name ?? undefined,
        metadata: {
          userId: session.user.id,
          accountType: user.accountType,
          siret: user.siret ?? "",
          companyName: user.companyName ?? "",
        },
      });
    } catch (err) {
      console.warn("[checkout] stripe customer update failed:", err);
    }
  }

  // V30 : protection contre stripePriceId vide
  const safeStripePriceId =
    plan.stripePriceId && plan.stripePriceId.trim().length > 0
      ? plan.stripePriceId.trim()
      : null;

  // V30.2 : capture non-null pour TS closure narrowing
  const planSnapshot = plan;
  const quizSnapshot = quiz;
  function buildLineItems(usePriceId: boolean) {
    return [
      {
        price_data:
          usePriceId && safeStripePriceId
            ? undefined
            : {
                currency: "eur",
                unit_amount: planSnapshot.priceCents,
                product_data: {
                  name: `Kuizard ${planSnapshot.name} — ${quizSnapshot.title}`,
                  description: planSnapshot.description ?? undefined,
                },
              },
        price: usePriceId ? safeStripePriceId ?? undefined : undefined,
        quantity: 1,
      },
    ];
  }

  let stripeSession: { id: string; url: string | null };
  try {
    stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: buildLineItems(true),
      discounts: stripeCouponIds.map((id) => ({ coupon: id })),
      success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/payment/cancel?quiz_id=${quizId}`,
      metadata: {
        userId: session.user.id,
        quizId: quiz.id,
        planSlug: plan.slug,
        promoCodeId: promoCodeId ?? "",
      },
      // Permet à Stripe d'enregistrer la carte du customer pour usage futur
      // (utile si on passe sur abos pour le même user)
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: {
          userId: session.user.id,
          quizId: quiz.id,
          planSlug: plan.slug,
        },
      },
    });
  } catch (err) {
    // V30.2 : retry automatique si "No such price" → fallback price_data
    const isMissingPrice =
      err instanceof Error &&
      /No such price|resource_missing/i.test(err.message);
    if (isMissingPrice && safeStripePriceId) {
      console.warn(
        `[Stripe] price ${safeStripePriceId} introuvable — retry avec price_data`
      );
      try {
        stripeSession = await stripe.checkout.sessions.create({
          mode: "payment",
          customer: customerId,
          line_items: buildLineItems(false),
          discounts: stripeCouponIds.map((id) => ({ coupon: id })),
          success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/payment/cancel?quiz_id=${quizId}`,
          metadata: {
            userId: session.user.id,
            quizId: quiz.id,
            planSlug: plan.slug,
            promoCodeId: promoCodeId ?? "",
          },
          payment_intent_data: {
            setup_future_usage: "off_session",
            metadata: {
              userId: session.user.id,
              quizId: quiz.id,
              planSlug: plan.slug,
            },
          },
        });
      } catch (retryErr) {
        console.error("[Stripe] retry price_data échoue :", retryErr);
        const d = retryErr instanceof Error ? retryErr.message : "Erreur inconnue.";
        return { ok: false, message: `Stripe : ${d}` };
      }
    } else {
      console.error("[Stripe] Erreur création session :", {
        planSlug: plan.slug,
        stripePriceId: plan.stripePriceId,
        customerId,
        err,
      });
      const d = err instanceof Error ? err.message : "Erreur inconnue.";
      return { ok: false, message: `Stripe : ${d}` };
    }
  }

  // Trace de la tentative en BDD (status "pending")
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      quizId: quiz.id,
      stripeSessionId: stripeSession.id,
      amountCents: plan.priceCents,
      planSlug: plan.slug,
      promoCodeId,
      status: "pending",
    },
  });

  if (!stripeSession.url) {
    return { ok: false, message: "Stripe n'a pas renvoyé d'URL." };
  }

  // Redirection vers Stripe Checkout
  redirect(stripeSession.url);
}
