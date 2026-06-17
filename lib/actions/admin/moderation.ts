"use server";

// =============================================
// Server Actions — Modération admin
// =============================================
// Couvre : ban, unban, promote → ADMIN, demote → USER
// Chaque action est tracée dans l'audit log.

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";

export type ModerationState = {
  ok: boolean;
  message?: string;
};

// ============================================================
// BAN — avec confirmation par email tapée (sécurité)
// ============================================================
const banSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(3, "Précise une raison (min. 3 caractères).").max(500),
  emailConfirmation: z.string().min(1, "Confirmation requise."),
});

export async function banUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const { user: admin } = await requireAdmin();

  const parsed = banSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason"),
    emailConfirmation: formData.get("emailConfirmation"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  if (parsed.data.userId === admin.id) {
    return { ok: false, message: "Tu ne peux pas te bannir toi-même." };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true, bannedAt: true },
  });
  if (!target) return { ok: false, message: "Utilisateur introuvable." };
  if (target.role === "ADMIN") {
    return { ok: false, message: "Impossible de bannir un autre admin. Démote-le d'abord." };
  }
  if (target.bannedAt) {
    return { ok: false, message: "Cet utilisateur est déjà banni." };
  }

  // Confirmation email : il faut taper exactement l'email du user à bannir
  if (
    parsed.data.emailConfirmation.trim().toLowerCase() !==
    target.email.toLowerCase()
  ) {
    return {
      ok: false,
      message:
        "L'email de confirmation ne correspond pas. Tape exactement l'email du user à bannir.",
    };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      bannedAt: new Date(),
      bannedReason: parsed.data.reason,
      bannedBy: admin.id,
    },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "ban",
    targetUserId: target.id,
    targetUserEmail: target.email,
    payload: { reason: parsed.data.reason },
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Utilisateur banni." };
}

// ============================================================
// UNBAN
// ============================================================
const unbanSchema = z.object({ userId: z.string().min(1) });

export async function unbanUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const { user: admin } = await requireAdmin();

  const parsed = unbanSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { ok: false, message: "Champs invalides." };

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, bannedReason: true },
  });
  if (!target) return { ok: false, message: "Utilisateur introuvable." };

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { bannedAt: null, bannedReason: null, bannedBy: null },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "unban",
    targetUserId: target.id,
    targetUserEmail: target.email,
    payload: { previousReason: target.bannedReason },
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Bannissement levé." };
}

// ============================================================
// PROMOTE — User → ADMIN
// ============================================================
const promoteSchema = z.object({
  userId: z.string().min(1),
  emailConfirmation: z.string().min(1, "Confirmation requise."),
});

export async function promoteUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const { user: admin } = await requireAdmin();

  const parsed = promoteSchema.safeParse({
    userId: formData.get("userId"),
    emailConfirmation: formData.get("emailConfirmation"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true, bannedAt: true },
  });
  if (!target) return { ok: false, message: "Utilisateur introuvable." };
  if (target.role === "ADMIN") {
    return { ok: false, message: "Cet utilisateur est déjà admin." };
  }
  if (target.bannedAt) {
    return { ok: false, message: "Impossible de promouvoir un user banni. Lève le ban d'abord." };
  }

  if (
    parsed.data.emailConfirmation.trim().toLowerCase() !==
    target.email.toLowerCase()
  ) {
    return {
      ok: false,
      message: "L'email de confirmation ne correspond pas.",
    };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: "ADMIN" },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "promote",
    targetUserId: target.id,
    targetUserEmail: target.email,
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Utilisateur promu ADMIN." };
}

// ============================================================
// DEMOTE — ADMIN → USER
// ============================================================
const demoteSchema = z.object({
  userId: z.string().min(1),
  emailConfirmation: z.string().min(1, "Confirmation requise."),
});

export async function demoteUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const { user: admin } = await requireAdmin();

  const parsed = demoteSchema.safeParse({
    userId: formData.get("userId"),
    emailConfirmation: formData.get("emailConfirmation"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  if (parsed.data.userId === admin.id) {
    return {
      ok: false,
      message: "Tu ne peux pas te dégrader toi-même. Demande à un autre admin.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true },
  });
  if (!target) return { ok: false, message: "Utilisateur introuvable." };
  if (target.role !== "ADMIN") {
    return { ok: false, message: "Cet utilisateur n'est pas admin." };
  }

  if (
    parsed.data.emailConfirmation.trim().toLowerCase() !==
    target.email.toLowerCase()
  ) {
    return {
      ok: false,
      message: "L'email de confirmation ne correspond pas.",
    };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: "USER" },
  });

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "demote",
    targetUserId: target.id,
    targetUserEmail: target.email,
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Statut admin retiré." };
}
