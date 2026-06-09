"use server";

// =============================================
// Server Actions — Admin CRUD QuizTemplate
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type AdminTemplateState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// On accepte des questions au format JSON brut — l'admin a le contrôle.
// Le schéma est plus permissif que pour les utilisateurs finaux ; on valide
// juste qu'on a un array d'objets avec type+text.
const questionSchema = z.object({
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "TEXT"]),
  text: z.string().min(1),
  points: z.number().int().min(0).default(1),
  options: z
    .array(
      z.object({
        label: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .default([]),
});

const templateSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_-]+$/, "Slug : minuscules, chiffres, _ et -"),
  title: z.string().min(2).max(140),
  description: z.string().min(5).max(2000),
  category: z.string().min(2).max(40),
  language: z
    .enum(["fr", "en", "es", "it", "de", "pt", "ru", "zh"])
    .default("fr"),
  theme: z.string().max(40).optional().or(z.literal("")),
  tagsCsv: z.string().max(500).optional().or(z.literal("")),
  coverImageUrl: z.string().max(500).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  questionsJson: z.string().min(2, "Questions JSON manquantes."),
});

function checkbox(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function upsertTemplateAction(
  _prev: AdminTemplateState,
  formData: FormData
): Promise<AdminTemplateState> {
  await requireAdmin();

  const parsed = templateSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    language: formData.get("language") || "fr",
    theme: formData.get("theme") || "",
    tagsCsv: formData.get("tagsCsv") || "",
    coverImageUrl: formData.get("coverImageUrl") || "",
    displayOrder: formData.get("displayOrder"),
    isActive: checkbox(formData.get("isActive")),
    questionsJson: formData.get("questionsJson"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const v = parsed.data;

  // Parse + valide les questions
  let questions: unknown;
  try {
    questions = JSON.parse(v.questionsJson);
  } catch {
    return { ok: false, message: "Questions JSON invalides." };
  }
  const qParse = z.array(questionSchema).safeParse(questions);
  if (!qParse.success) {
    return {
      ok: false,
      message:
        "Format de questions invalide : array de {type, text, points, options}.",
    };
  }

  // Parse les tags depuis une CSV ("famille, humour, années 90")
  const tags = v.tagsCsv
    ? v.tagsCsv
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30)
    : [];

  const data = {
    slug: v.slug,
    title: v.title,
    description: v.description,
    category: v.category,
    language: v.language,
    theme: v.theme || null,
    tags,
    coverImageUrl: v.coverImageUrl || null,
    displayOrder: v.displayOrder,
    isActive: v.isActive,
    questions: qParse.data as unknown as never,
  };

  try {
    if (v.id) {
      await prisma.quizTemplate.update({ where: { id: v.id }, data });
    } else {
      await prisma.quizTemplate.create({ data });
    }
  } catch (err) {
    console.error("[admin-templates] upsert err:", err);
    return { ok: false, message: "Slug déjà utilisé ou erreur BDD." };
  }

  revalidatePath("/admin/templates");
  revalidatePath("/dashboard/quizzes/templates");
  revalidatePath("/dashboard/quizzes/new");

  return { ok: true, message: "Template enregistré." };
}

export async function deleteTemplateAction(
  _prev: AdminTemplateState,
  formData: FormData
): Promise<AdminTemplateState> {
  await requireAdmin();
  const id = (formData.get("id") as string) ?? "";
  if (!id) return { ok: false, message: "ID manquant." };

  try {
    await prisma.quizTemplate.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Suppression impossible." };
  }

  revalidatePath("/admin/templates");
  return { ok: true, message: "Template supprimé." };
}
