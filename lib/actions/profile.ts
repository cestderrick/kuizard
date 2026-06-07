"use server";

// =============================================
// Server Actions — Profil utilisateur
// =============================================

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { checkSiret, normalizeSiret } from "@/lib/siret/validate";

export type ProfileState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nom trop court.").max(80, "Nom trop long.").optional(),
  email: z.string().email("Email invalide.").max(200),
  accountType: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  // Champs entreprise — optionnels au schéma, validés ci-dessous si pro
  siret: z.string().max(20).optional().or(z.literal("")),
  companyName: z.string().max(140).optional().or(z.literal("")),
  vatNumber: z.string().max(40).optional().or(z.literal("")),
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
    siret: formData.get("siret") || "",
    companyName: formData.get("companyName") || "",
    vatNumber: formData.get("vatNumber") || "",
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

  // Validation SIRET si compte pro avec SIRET renseigné
  let siretNormalized: string | null = null;
  if (v.accountType === "BUSINESS" && v.siret && v.siret.trim().length > 0) {
    const check = checkSiret(v.siret);
    if (!check.ok) {
      return {
        ok: false,
        errors: { siret: [check.message] },
        message: check.message,
      };
    }
    siretNormalized = normalizeSiret(v.siret);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: v.name,
      email: emailLower,
      accountType: v.accountType,
      siret: siretNormalized,
      companyName: v.companyName || null,
      vatNumber: v.vatNumber || null,
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

// =============================================
// Suppression de compte (droit à l'oubli RGPD)
// =============================================
//
// Exige le mot de passe actuel comme garde-fou (anti-CSRF en plus de
// l'auth déjà active). Le compte est SUPPRIMÉ DÉFINITIVEMENT — les quizz,
// participations, messages et paiements liés tombent en cascade selon les
// onDelete du schéma. Le compte Stripe Customer est conservé côté Stripe
// pour préserver l'historique fiscal (obligation légale 10 ans en France).

const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe requis pour confirmer."),
  confirmation: z.literal("SUPPRIMER", {
    message: 'Tape exactement "SUPPRIMER" pour confirmer.',
  }),
});

export async function deleteAccountAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const parsed = deleteAccountSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie la saisie.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (user?.passwordHash) {
    const valid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    );
    if (!valid) {
      return {
        ok: false,
        errors: { currentPassword: ["Mot de passe incorrect."] },
        message: "Mot de passe incorrect.",
      };
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  // Déconnecte la session et redirige vers la home
  await signOut({ redirect: false });
  redirect("/?account=deleted");
}
