"use server";

// =============================================
// Server Actions — Modération admin (ban / unban)
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ModerationState = {
  ok: boolean;
  message?: string;
};

const banSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(3, "Précise une raison (min. 3 caractères).").max(500),
});

export async function banUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const { user: admin } = await requireAdmin();

  const parsed = banSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  // Empêcher de se bannir soi-même (sécurité de base)
  if (parsed.data.userId === admin.id) {
    return { ok: false, message: "Tu ne peux pas te bannir toi-même." };
  }

  // Empêcher de bannir un autre admin (sécurité)
  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true, bannedAt: true },
  });
  if (!target) return { ok: false, message: "Utilisateur introuvable." };
  if (target.role === "ADMIN") {
    return { ok: false, message: "Impossible de bannir un autre admin." };
  }
  if (target.bannedAt) {
    return { ok: false, message: "Cet utilisateur est déjà banni." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      bannedAt: new Date(),
      bannedReason: parsed.data.reason,
      bannedBy: admin.id,
    },
  });

  // Optionnel : on pourrait aussi invalider les sessions Auth.js, mais comme
  // on a une stratégie JWT, l'invalidation arrive à la prochaine vérif (la
  // session reste active jusqu'à expiration). Pour forcer une déco immédiate,
  // on pourrait incrémenter un "version" sur l'user et le checker dans le JWT
  // callback. Pour V1 on accepte que le ban prend effet à la prochaine action.

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Utilisateur banni." };
}

const unbanSchema = z.object({
  userId: z.string().min(1),
});

export async function unbanUserAction(
  _prev: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  await requireAdmin();

  const parsed = unbanSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Champs invalides." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      bannedAt: null,
      bannedReason: null,
      bannedBy: null,
    },
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "Bannissement levé." };
}
