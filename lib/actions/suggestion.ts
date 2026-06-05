"use server";

// =============================================
// Server Actions — Suggestions / feedback
// =============================================

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
