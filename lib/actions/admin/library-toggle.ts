"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type LibraryToggleState = {
  ok: boolean;
  message?: string;
};

const schema = z.object({
  quizId: z.string().min(1),
  isLibrary: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean()
  ),
  libraryDescription: z.string().max(500).optional(),
  libraryTags: z.string().max(500).optional(),
  libraryLanguage: z.string().max(8).optional(),
});

export async function toggleLibraryQuizAction(
  _prev: LibraryToggleState,
  formData: FormData
): Promise<LibraryToggleState> {
  await requireAdmin();

  const parsed = schema.safeParse({
    quizId: formData.get("quizId"),
    isLibrary: formData.get("isLibrary"),
    libraryDescription: formData.get("libraryDescription") || undefined,
    libraryTags: formData.get("libraryTags") || undefined,
    libraryLanguage: formData.get("libraryLanguage") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  // Parse les tags (string CSV → array trimmed sans doublons)
  const tags = (parsed.data.libraryTags ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0 && s.length <= 32);
  const uniqueTags = Array.from(new Set(tags));

  await prisma.quiz.update({
    where: { id: parsed.data.quizId },
    data: {
      isLibrary: parsed.data.isLibrary,
      libraryDescription: parsed.data.libraryDescription ?? null,
      libraryTags: uniqueTags,
      libraryLanguage: parsed.data.libraryLanguage || null,
    },
  });

  revalidatePath(`/dashboard/quizzes/${parsed.data.quizId}/edit`);
  revalidatePath("/dashboard/quizzes/library");
  return {
    ok: true,
    message: parsed.data.isLibrary
      ? "Ajouté à la banque ✓"
      : "Retiré de la banque ✓",
  };
}
