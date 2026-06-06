"use server";

// =============================================
// Server Actions — Souscription Stripe (abos Bar)
// =============================================

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";

export type SubscribeState = {
  ok: boolean;
  message?: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.fr";

export async function createSubscriptionCheckoutAction(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const planSlug = formData.get("planSlug");
  if (typeof planSlug !== "string" || !planSlug) {
    return { ok: false, message: "Plan manquant." };
  }

  const plan = await prisma.planConfig.findUnique({
    where: { slug: planSlug },
  });
  if (!plan || !plan.isActive) {
    return { ok: false, message: "Plan introuvable ou désactivé." };
  }
  if (plan.type !== "subscription") {
    return { ok: false, message: "Ce plan n'est pas un abonnement." };
  }
  if (!plan.stripePriceId) {
    return {
      ok: false,
      message:
        "Stripe Price ID manquant sur ce plan. Configure-le dans l'admin.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });
  if (!user) return { ok: false, message: "Utilisateur introuvable." };

  // Récupère ou crée le Customer Stripe
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  let stripeSession: { url: string | null };
  try {
    stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/subscription?status=success`,
      cancel_url: `${APP_URL}/dashboard/subscription?status=cancel`,
      metadata: {
        userId: session.user.id,
        planSlug: plan.slug,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planSlug: plan.slug,
        },
      },
    });
  } catch (err) {
    console.error("[subscription] stripe err:", err);
    return { ok: false, message: "Erreur Stripe à la création." };
  }

  if (!stripeSession.url) {
    return { ok: false, message: "Stripe n'a pas renvoyé d'URL." };
  }

  redirect(stripeSession.url);
}

// =============================================
// Portail Customer (gérer abo, factures, RIB)
// =============================================

export async function openCustomerPortalAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    redirect("/dashboard/subscription?error=no_customer");
  }

  let portal: { url: string };
  try {
    portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/dashboard/subscription`,
    });
  } catch (err) {
    console.error("[portal] stripe err:", err);
    redirect("/dashboard/subscription?error=portal");
  }

  revalidatePath("/dashboard/subscription");
  redirect(portal.url);
}
