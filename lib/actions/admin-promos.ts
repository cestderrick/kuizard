"use server";

// =============================================
// Server Actions — Admin CRUD PromoCode
// =============================================
//
// Quand on crée un PromoCode, on crée aussi le Coupon côté Stripe pour que
// Checkout puisse l'appliquer. Lors de la suppression on tente de delete
// le coupon Stripe également.

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { stripe } from "@/lib/stripe/client";

export type AdminPromoState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const promoSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .min(3, "Code trop court.")
      .max(40)
      .regex(/^[A-Z0-9_-]+$/, "Caractères : majuscules, chiffres, _ et -"),
    description: z.string().max(200).optional().or(z.literal("")),
    percentOff: z.coerce.number().int().min(0).max(100).optional(),
    amountOffCents: z.coerce.number().int().min(0).optional(),
    planSlug: z.string().max(40).optional().or(z.literal("")),
    giftPlanSlug: z.string().max(40).optional().or(z.literal("")),
    maxRedemptions: z.coerce.number().int().min(0).optional(),
    expiresAt: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (v) =>
      (v.percentOff && v.percentOff > 0) ||
      (v.amountOffCents && v.amountOffCents > 0) ||
      (v.giftPlanSlug && v.giftPlanSlug.length > 0),
    {
      message:
        "Renseigne un % de réduction, un montant, ou un plan cadeau (giftPlanSlug).",
      path: ["percentOff"],
    }
  );

function checkbox(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function upsertPromoAction(
  _prev: AdminPromoState,
  formData: FormData
): Promise<AdminPromoState> {
  await requireAdmin();

  const codeRaw = (formData.get("code") as string) ?? "";
  const code = codeRaw.toUpperCase().trim();

  const parsed = promoSchema.safeParse({
    id: formData.get("id") || undefined,
    code,
    description: formData.get("description") || "",
    percentOff: formData.get("percentOff") || undefined,
    amountOffCents: formData.get("amountOffCents") || undefined,
    planSlug: formData.get("planSlug") || "",
    giftPlanSlug: formData.get("giftPlanSlug") || "",
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    expiresAt: formData.get("expiresAt") || "",
    isActive: checkbox(formData.get("isActive")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const v = parsed.data;
  const expiresAt =
    v.expiresAt && v.expiresAt.length > 0 ? new Date(v.expiresAt) : null;

  // Création du Coupon Stripe (uniquement à la création initiale)
  // Pour les codes "cadeau" pur (sans %/montant), on n'a PAS besoin de Stripe
  // — l'application se fait côté serveur sans paiement
  let stripeCouponId: string | null = null;
  let existingFromDb: { stripeCouponId: string | null } | null = null;
  if (v.id) {
    existingFromDb = await prisma.promoCode.findUnique({
      where: { id: v.id },
      select: { stripeCouponId: true },
    });
    stripeCouponId = existingFromDb?.stripeCouponId ?? null;
  }

  const isPureGift =
    !!v.giftPlanSlug &&
    !(v.percentOff && v.percentOff > 0) &&
    !(v.amountOffCents && v.amountOffCents > 0);

  if (!stripeCouponId && !isPureGift) {
    try {
      const coupon = await stripe.coupons.create({
        name: code,
        percent_off: v.percentOff && v.percentOff > 0 ? v.percentOff : undefined,
        amount_off:
          v.amountOffCents && v.amountOffCents > 0
            ? v.amountOffCents
            : undefined,
        currency:
          v.amountOffCents && v.amountOffCents > 0 ? "eur" : undefined,
        max_redemptions:
          v.maxRedemptions && v.maxRedemptions > 0
            ? v.maxRedemptions
            : undefined,
        redeem_by: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : undefined,
        metadata: { code, planSlug: v.planSlug || "" },
      });
      stripeCouponId = coupon.id;
    } catch (err) {
      console.error("[admin-promos] stripe coupon create err:", err);
      return {
        ok: false,
        message:
          "Stripe a refusé la création du coupon (clés OK ? % ou montant valide ?).",
      };
    }
  }

  const baseData = {
    code,
    description: v.description || null,
    percentOff: v.percentOff && v.percentOff > 0 ? v.percentOff : null,
    amountOffCents:
      v.amountOffCents && v.amountOffCents > 0 ? v.amountOffCents : null,
    stripeCouponId,
    planSlug: v.planSlug || null,
    giftPlanSlug: v.giftPlanSlug || null,
    maxRedemptions:
      v.maxRedemptions && v.maxRedemptions > 0 ? v.maxRedemptions : null,
    expiresAt,
    isActive: v.isActive ?? true,
  };

  try {
    if (v.id) {
      await prisma.promoCode.update({ where: { id: v.id }, data: baseData });
    } else {
      await prisma.promoCode.create({ data: baseData });
    }
  } catch (err) {
    console.error("[admin-promos] db err:", err);
    return { ok: false, message: "Code déjà utilisé ou erreur BDD." };
  }

  revalidatePath("/admin/promos");
  return { ok: true, message: "Code promo enregistré." };
}

export async function deletePromoAction(
  _prev: AdminPromoState,
  formData: FormData
): Promise<AdminPromoState> {
  await requireAdmin();
  const id = (formData.get("id") as string) ?? "";
  if (!id) return { ok: false, message: "ID manquant." };

  const promo = await prisma.promoCode.findUnique({
    where: { id },
    select: { stripeCouponId: true },
  });

  // Supprime le coupon côté Stripe (best-effort, on continue même si erreur)
  if (promo?.stripeCouponId) {
    try {
      await stripe.coupons.del(promo.stripeCouponId);
    } catch (err) {
      console.warn("[admin-promos] stripe coupon delete err:", err);
    }
  }

  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promos");
  return { ok: true, message: "Code promo supprimé." };
}
