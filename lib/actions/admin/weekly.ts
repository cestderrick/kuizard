"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type WeeklyState = {
  ok: boolean;
  message?: string;
};

const setSchema = z.object({
  quizId: z.string().min(1),
  title: z.string().min(3).max(140),
  subtitle: z.string().max(280).optional(),
  prizesText: z.string().min(3).max(500),
  weekStart: z.string().min(1), // ISO date depuis l'input type=date
  weekEnd: z.string().min(1),
  ctaLabel: z.string().max(80).optional(),
});

export async function setWeeklyFeaturedAction(
  _prev: WeeklyState,
  formData: FormData
): Promise<WeeklyState> {
  const { user: admin } = await requireAdmin();

  const parsed = setSchema.safeParse({
    quizId: formData.get("quizId"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    prizesText: formData.get("prizesText"),
    weekStart: formData.get("weekStart"),
    weekEnd: formData.get("weekEnd"),
    ctaLabel: formData.get("ctaLabel") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }

  const weekStart = new Date(parsed.data.weekStart);
  const weekEnd = new Date(parsed.data.weekEnd);
  if (Number.isNaN(weekStart.getTime()) || Number.isNaN(weekEnd.getTime())) {
    return { ok: false, message: "Dates invalides." };
  }
  if (weekEnd <= weekStart) {
    return { ok: false, message: "La date de fin doit être après le début." };
  }

  // Vérifier que le quiz existe et est publié
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: { id: true, status: true },
  });
  if (!quiz) return { ok: false, message: "Quiz introuvable." };
  if (quiz.status !== "PUBLISHED" && quiz.status !== "RUNNING") {
    return {
      ok: false,
      message: "Le quiz doit être publié pour être featuré.",
    };
  }

  // Upsert : on autorise UN featured par quiz (unique index sur quizId)
  await prisma.weeklyFeaturedQuiz.upsert({
    where: { quizId: parsed.data.quizId },
    create: {
      quizId: parsed.data.quizId,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      prizesText: parsed.data.prizesText,
      weekStart,
      weekEnd,
      ctaLabel: parsed.data.ctaLabel ?? undefined,
      featuredBy: admin.id,
    },
    update: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      prizesText: parsed.data.prizesText,
      weekStart,
      weekEnd,
      ctaLabel: parsed.data.ctaLabel ?? undefined,
    },
  });

  // V31 : on force le quiz en mode SCHEDULED avec les dates du featured.
  // Sinon, le quiz peut tourner en LIVE_MANUAL et nécessiter un admin pour
  // lancer chaque question — pas ce qu'on veut pour un quiz hebdo en libre
  // accès. SCHEDULED + dates = ouvert/fermé automatiquement.
  await prisma.quiz.update({
    where: { id: parsed.data.quizId },
    data: {
      mode: "SCHEDULED",
      scheduledOpenAt: weekStart,
      scheduledCloseAt: weekEnd,
    },
  });

  revalidatePath("/admin/weekly");
  revalidatePath("/");
  revalidatePath(`/dashboard/quizzes/${parsed.data.quizId}/edit`);
  return {
    ok: true,
    message:
      "Quizz de la semaine enregistré. Le quiz a été basculé en mode Créneau horaire avec les dates choisies.",
  };
}

const removeSchema = z.object({ id: z.string().min(1) });

export async function removeWeeklyFeaturedAction(
  _prev: WeeklyState,
  formData: FormData
): Promise<WeeklyState> {
  await requireAdmin();

  const parsed = removeSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, message: "ID invalide." };

  await prisma.weeklyFeaturedQuiz.delete({
    where: { id: parsed.data.id },
  });

  revalidatePath("/admin/weekly");
  revalidatePath("/");
  return { ok: true, message: "Featured retiré." };
}
