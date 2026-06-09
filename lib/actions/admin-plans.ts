"use server";

// =============================================
// Server Actions — Admin CRUD PlanConfig
// =============================================

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type AdminPlanState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Schéma de limites — schema-libre, on parse en JSON. Tous nullables/optionnels.
const planSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug trop court.")
    .max(40)
    .regex(/^[a-z0-9_-]+$/, "Slug : lettres min, chiffres, _ et - uniquement."),
  name: z.string().min(2, "Nom trop court.").max(80),
  tagline: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  type: z.enum(["one_shot", "subscription"]),
  interval: z.enum(["month", "year"]).optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0),
  stripePriceId: z.string().max(120).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
  isHighlighted: z.boolean().optional().default(false),
  // Limites
  maxQuestions: z.coerce.number().int().min(0).optional(),
  maxParticipants: z.coerce.number().int().min(0).optional(),
  customColors: z.boolean().optional().default(false),
  customPrizes: z.boolean().optional().default(false),
  finalMessage: z.boolean().optional().default(false),
  coverImage: z.boolean().optional().default(false),
  questionImages: z.boolean().optional().default(false),
  scheduledMode: z.boolean().optional().default(false),
  liveMode: z.boolean().optional().default(false),
  ranking: z.boolean().optional().default(true),
  tvDisplay: z.boolean().optional().default(false),
  maxActiveQuizzes: z.coerce.number().int().min(0).optional(),
  maxTemplatesPerMonth: z.coerce.number().int().min(0).optional(),
});

function checkbox(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function upsertPlanAction(
  _prev: AdminPlanState,
  formData: FormData
): Promise<AdminPlanState> {
  await requireAdmin();

  const parsed = planSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    name: formData.get("name"),
    tagline: formData.get("tagline") || "",
    description: formData.get("description") || "",
    type: formData.get("type"),
    interval: formData.get("interval") || "",
    priceCents: formData.get("priceCents"),
    stripePriceId: formData.get("stripePriceId") || "",
    displayOrder: formData.get("displayOrder"),
    isActive: checkbox(formData.get("isActive")),
    isHighlighted: checkbox(formData.get("isHighlighted")),
    maxQuestions: formData.get("maxQuestions") || undefined,
    maxParticipants: formData.get("maxParticipants") || undefined,
    customColors: checkbox(formData.get("customColors")),
    customPrizes: checkbox(formData.get("customPrizes")),
    finalMessage: checkbox(formData.get("finalMessage")),
    coverImage: checkbox(formData.get("coverImage")),
    questionImages: checkbox(formData.get("questionImages")),
    scheduledMode: checkbox(formData.get("scheduledMode")),
    liveMode: checkbox(formData.get("liveMode")),
    ranking: checkbox(formData.get("ranking")),
    tvDisplay: checkbox(formData.get("tvDisplay")),
    maxActiveQuizzes: formData.get("maxActiveQuizzes") || undefined,
    maxTemplatesPerMonth: formData.get("maxTemplatesPerMonth") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const v = parsed.data;
  const limits: Record<string, unknown> = {
    customColors: v.customColors,
    customPrizes: v.customPrizes,
    finalMessage: v.finalMessage,
    coverImage: v.coverImage,
    questionImages: v.questionImages,
    scheduledMode: v.scheduledMode,
    liveMode: v.liveMode,
    ranking: v.ranking,
    tvDisplay: v.tvDisplay,
  };
  if (v.maxQuestions !== undefined) limits.maxQuestions = v.maxQuestions;
  if (v.maxParticipants !== undefined) limits.maxParticipants = v.maxParticipants;
  if (v.maxActiveQuizzes !== undefined)
    limits.maxActiveQuizzes = v.maxActiveQuizzes;
  if (v.maxTemplatesPerMonth !== undefined)
    limits.maxTemplatesPerMonth = v.maxTemplatesPerMonth;

  const baseData = {
    slug: v.slug,
    name: v.name,
    tagline: v.tagline || null,
    description: v.description || null,
    type: v.type,
    interval: v.type === "subscription" ? v.interval || "month" : null,
    priceCents: v.priceCents,
    stripePriceId: v.stripePriceId || null,
    displayOrder: v.displayOrder,
    isActive: v.isActive ?? true,
    isHighlighted: v.isHighlighted ?? false,
    limits: limits as unknown as never,
  };

  try {
    if (v.id) {
      await prisma.planConfig.update({ where: { id: v.id }, data: baseData });
    } else {
      await prisma.planConfig.create({ data: baseData });
    }
  } catch (err) {
    console.error("[admin-plans] upsert err:", err);
    return { ok: false, message: "Slug déjà utilisé ou erreur BDD." };
  }

  revalidatePath("/admin/plans");
  revalidatePath("/dashboard");

  return { ok: true, message: "Plan enregistré." };
}

export async function deletePlanAction(
  _prev: AdminPlanState,
  formData: FormData
): Promise<AdminPlanState> {
  await requireAdmin();

  const id = (formData.get("id") as string) ?? "";
  if (!id) return { ok: false, message: "ID manquant." };

  try {
    await prisma.planConfig.delete({ where: { id } });
  } catch {
    return {
      ok: false,
      message: "Suppression refusée (plan référencé ?). Désactive-le plutôt.",
    };
  }

  revalidatePath("/admin/plans");
  return { ok: true, message: "Plan supprimé." };
}
