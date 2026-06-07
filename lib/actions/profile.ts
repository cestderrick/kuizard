"use server";

// =============================================
// Server Actions — Profil utilisateur
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type ProfileState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nom trop court.").max(80, "Nom trop long.").optional(),
  email: z.string().email("Email invalide.").max(200),
  accountType: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
});

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    accountType: formData.get("accountType") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const v = parsed.data;
  const emailLower = v.email.toLowerCase();

  // Vérif unicité de l'email (autorisé si c'est le même que l'actuel)
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (existing && existing.id !== session.user.id) {
    return {
      ok: false,
      errors: { email: ["Cet email est déjà utilisé."] },
      message: "Email déjà utilisé par un autre compte.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: v.name,
      email: emailLower,
      accountType: v.accountType,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profil mis à jour ✨" };
}

// =============================================
// Changement de mot de passe
// =============================================

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z
      .string()
      .min(8, "Minimum 8 caractères.")
      .max(200, "Maximum 200 caractères."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export async function updatePasswordAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return {
      ok: false,
      message:
        "Ton compte n'a pas de mot de passe (OAuth Google ?). Contacte le support.",
    };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return {
      ok: false,
      errors: { currentPassword: ["Mot de passe actuel incorrect."] },
      message: "Mot de passe actuel incorrect.",
    };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Mot de passe mis à jour 🔐" };
}
