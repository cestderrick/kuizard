"use server";

// =============================================
// Server Actions — Suggestions / feedback
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

const suggestionSchema = z.object({
  category: z
    .enum(["bug", "feature", "design", "other"])
    .default("other"),
  message: z
    .string()
    .min(10, "Décris au moins 10 caractères.")
    .max(4000, "Maximum 4000 caractères."),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
});

export type SuggestionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitSuggestionAction(
  _prev: SuggestionState,
  formData: FormData
): Promise<SuggestionState> {
  const parsed = suggestionSchema.safeParse({
    category: (formData.get("category") as string) ?? "other",
    message: formData.get("message"),
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { category, message, email } = parsed.data;

  // Si l'utilisateur est connecté, on lie sa suggestion à son user
  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.suggestion.create({
    data: {
      category,
      message,
      email: email || (session?.user?.email ?? null),
      userId,
    },
  });

  return {
    ok: true,
    message:
      "Merci ! Ta suggestion est bien arrivée chez nous. On la lit attentivement ✨",
  };
}

// =============================================
// Admin — modération
// =============================================

const VALID_STATUSES = ["new", "seen", "done", "wont_fix"] as const;
type SuggestionStatus = (typeof VALID_STATUSES)[number];

export type AdminSuggestionState = {
  ok: boolean;
  message?: string;
};

/**
 * Met à jour le statut d'une suggestion (action admin).
 * Appelée depuis app/admin/suggestions/page.tsx.
 */
export async function updateSuggestionStatusAction(
  _prev: AdminSuggestionState,
  formData: FormData
): Promise<AdminSuggestionState> {
  await requireAdmin();

  const id = (formData.get("id") as string) ?? "";
  const status = (formData.get("status") as string) ?? "";

  if (!id) return { ok: false, message: "ID manquant." };
  if (!VALID_STATUSES.includes(status as SuggestionStatus)) {
    return { ok: false, message: "Statut invalide." };
  }

  try {
    await prisma.suggestion.update({
      where: { id },
      data: { status },
    });
  } catch {
    return { ok: false, message: "Suggestion introuvable." };
  }

  revalidatePath("/admin/suggestions");
  revalidatePath("/admin");

  return { ok: true, message: "Statut mis à jour." };
}

/**
 * Supprime une suggestion (action admin).
 */
export async function deleteSuggestionAction(
  _prev: AdminSuggestionState,
  formData: FormData
): Promise<AdminSuggestionState> {
  await requireAdmin();

  const id = (formData.get("id") as string) ?? "";
  if (!id) return { ok: false, message: "ID manquant." };

  try {
    await prisma.suggestion.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Suggestion introuvable." };
  }

  revalidatePath("/admin/suggestions");
  revalidatePath("/admin");

  return { ok: true, message: "Suggestion supprimée." };
}
