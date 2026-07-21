"use server";

// =============================================
// V60.5d — Checkout Stripe pour debloquer un escape library premium
// =============================================
// Le user n'a pas d'abo. Il veut dupliquer un escape library premium chez lui.
// On lui vend un one-shot : payment lie a escapeLibraryId.
// Une fois le payment succeeded (via webhook), il peut cliquer "Dupliquer chez moi"
// sur /dashboard/escapes/library → la duplication passera car son Payment matche.

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

const schema = z.object({
  escapeLibraryId: z.string().min(1),
  planSlug: z.string().min(1),
});

export type EscapeCheckoutState = {
  ok: boolean;
  message?: string;
  redirectUrl?: string;
};

export async function createEscapeUnlockCheckoutSessionAction(
  _prev: EscapeCheckoutState,
  formData: FormData
): Promise<EscapeCheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise pour payer." };
  }

  const parsed = schema.safeParse({
    escapeLibraryId: formData.get("escapeLibraryId"),
    planSlug: formData.get("planSlug"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Parametres invalides." };
  }

  const [source, plan, user] = await Promise.all([
    prisma.escape.findFirst({
      where: { id: parsed.data.escapeLibraryId, isLibrary: true },
      select: { id: true, title: true, libraryIsPremium: true },
    }),
    prisma.planConfig.findUnique({
      where: { slug: parsed.data.planSlug },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, stripeCustomerId: true },
    }),
  ]);

  if (!source) return { ok: false, message: "Escape library introuvable." };
  if (!source.libraryIsPremium) {
    return { ok: false, message: "Cet escape est gratuit — pas besoin de payer." };
  }
  if (!plan || !plan.isActive || plan.type !== "one_shot" || plan.priceCents <= 0) {
    return { ok: false, message: "Plan invalide pour cet achat." };
  }

  // Verifie si l'user a deja paye
  const existing = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      escapeLibraryId: source.id,
      status: "succeeded",
    },
  });
  if (existing) {
    return {
      ok: true,
      redirectUrl: "/dashboard/escapes/library",
      message: "Deja debloque, tu peux dupliquer.",
    };
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? undefined,
      customer: user?.stripeCustomerId ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: `🗝️ Escape : ${source.title}`,
              description: `Debloque la duplication du scenario "${source.title}" (plan ${plan.name}).`,
            },
            unit_amount: plan.priceCents,
          },
        },
      ],
      success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/dashboard/escapes/library`,
      metadata: {
        userId: session.user.id,
        planSlug: plan.slug,
        escapeLibraryId: source.id,
        kind: "escape_unlock",
      },
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
          planSlug: plan.slug,
          escapeLibraryId: source.id,
          kind: "escape_unlock",
        },
      },
    });

    // Pre-enregistre le Payment "pending"
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        planSlug: plan.slug,
        amountCents: plan.priceCents,
        escapeLibraryId: source.id,
        stripeSessionId: checkoutSession.id,
        status: "pending",
      },
    });

    if (!checkoutSession.url) {
      return { ok: false, message: "URL Stripe manquante." };
    }
    return { ok: true, redirectUrl: checkoutSession.url };
  } catch (err) {
    console.error("[escape-checkout] failed:", err);
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "Erreur creation session Stripe.",
    };
  }
}
