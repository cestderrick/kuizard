"use server";

// =============================================
// Server Actions — Cadeaux admin (offrir un plan)
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";

export type GrantState = {
  ok: boolean;
  message?: string;
};

// ============================================================
// Offrir un palier à l'unité sur un quiz précis
// ============================================================
const grantOneShotSchema = z.object({
  userId: z.string().min(1),
  quizId: z.string().min(1),
  planSlug: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function grantOneShotPlanAction(
  _prev: GrantState,
  formData: FormData
): Promise<GrantState> {
  const { user: admin } = await requireAdmin();

  const parsed = grantOneShotSchema.safeParse({
    userId: formData.get("userId"),
    quizId: formData.get("quizId"),
    planSlug: formData.get("planSlug"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  // Vérifier que le plan existe et est de type one_shot
  const plan = await prisma.planConfig.findUnique({
    where: { slug: parsed.data.planSlug },
  });
  if (!plan || plan.type !== "one_shot") {
    return { ok: false, message: "Plan invalide (doit être one_shot)." };
  }

  // Vérifier que le quiz appartient bien au user
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: { userId: true },
  });
  if (!quiz || quiz.userId !== parsed.data.userId) {
    return {
      ok: false,
      message: "Ce quiz n'appartient pas à cet utilisateur.",
    };
  }

  const granted = await prisma.grantedPlan.create({
    data: {
      userId: parsed.data.userId,
      quizId: parsed.data.quizId,
      planSlug: parsed.data.planSlug,
      type: "one_shot",
      grantedBy: admin.id,
      reason: parsed.data.reason ?? null,
    },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "grant_one_shot",
    targetUserId: parsed.data.userId,
    targetQuizId: parsed.data.quizId,
    targetEntityId: granted.id,
    payload: { planSlug: parsed.data.planSlug, reason: parsed.data.reason },
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { ok: true, message: "Offre cadeau enregistrée." };
}

// ============================================================
// Offrir un abonnement pour X mois
// ============================================================
const grantSubscriptionSchema = z.object({
  userId: z.string().min(1),
  planSlug: z.string().min(1),
  durationMonths: z.coerce.number().int().min(1).max(36),
  reason: z.string().max(500).optional(),
});

export async function grantSubscriptionAction(
  _prev: GrantState,
  formData: FormData
): Promise<GrantState> {
  const { user: admin } = await requireAdmin();

  const parsed = grantSubscriptionSchema.safeParse({
    userId: formData.get("userId"),
    planSlug: formData.get("planSlug"),
    durationMonths: formData.get("durationMonths"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  const plan = await prisma.planConfig.findUnique({
    where: { slug: parsed.data.planSlug },
  });
  if (!plan || plan.type !== "subscription") {
    return {
      ok: false,
      message: "Plan invalide (doit être un abonnement).",
    };
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + parsed.data.durationMonths);

  const granted = await prisma.grantedPlan.create({
    data: {
      userId: parsed.data.userId,
      planSlug: parsed.data.planSlug,
      type: "subscription",
      startsAt,
      endsAt,
      grantedBy: admin.id,
      reason: parsed.data.reason ?? null,
    },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "grant_subscription",
    targetUserId: parsed.data.userId,
    targetEntityId: granted.id,
    payload: {
      planSlug: parsed.data.planSlug,
      durationMonths: parsed.data.durationMonths,
      reason: parsed.data.reason,
    },
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return {
    ok: true,
    message: `Abonnement offert pour ${parsed.data.durationMonths} mois.`,
  };
}

// ============================================================
// Révoquer un cadeau (s'il y a eu une erreur)
// ============================================================
const revokeSchema = z.object({
  grantId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function revokeGrantAction(
  _prev: GrantState,
  formData: FormData
): Promise<GrantState> {
  const { user: admin } = await requireAdmin();

  const parsed = revokeSchema.safeParse({
    grantId: formData.get("grantId"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Champs invalides." };
  }

  const grant = await prisma.grantedPlan.findUnique({
    where: { id: parsed.data.grantId },
  });
  if (!grant) return { ok: false, message: "Cadeau introuvable." };
  if (grant.revokedAt) {
    return { ok: false, message: "Ce cadeau est déjà révoqué." };
  }

  await prisma.grantedPlan.update({
    where: { id: parsed.data.grantId },
    data: {
      revokedAt: new Date(),
      revokedBy: admin.id,
      revokeReason: parsed.data.reason ?? null,
    },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "revoke_grant",
    targetUserId: grant.userId,
    targetEntityId: grant.id,
    payload: { reason: parsed.data.reason },
  });

  revalidatePath(`/admin/users/${grant.userId}`);
  return { ok: true, message: "Cadeau révoqué." };
}
