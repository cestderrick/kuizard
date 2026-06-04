"use server";

// =============================================
// Server Actions — Quizz (création, listage, suppression…)
// =============================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateUniqueQuizCode } from "@/lib/quiz/generate-code";

// -----------------------------------------------------
// CREATE QUIZ
// -----------------------------------------------------

const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit faire au moins 3 caractères.")
    .max(80, "Le titre ne peut pas dépasser 80 caractères."),
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères.")
    .optional()
    .or(z.literal("")),
  mode: z.enum(["LIVE_MANUAL", "SCHEDULED"]).default("LIVE_MANUAL"),
});

export type CreateQuizState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createQuizAction(
  _prevState: CreateQuizState,
  formData: FormData
): Promise<CreateQuizState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Tu dois être connecté pour créer un quizz." };
  }

  const parsed = createQuizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    mode: formData.get("mode") ?? "LIVE_MANUAL",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { title, description, mode } = parsed.data;

  // Générer un code court unique
  const code = await generateUniqueQuizCode();

  // Créer le quizz en BDD (status = DRAFT, plan = FREE par défaut)
  const quiz = await prisma.quiz.create({
    data: {
      userId: session.user.id,
      code,
      title,
      description: description || null,
      mode,
      status: "DRAFT",
      plan: "FREE",
    },
  });

  // Rafraîchir la liste des quizz dans le dashboard
  revalidatePath("/dashboard/quizzes");

  // Rediriger vers l'éditeur (la page sera créée au Sprint 2.2)
  redirect(`/dashboard/quizzes/${quiz.id}/edit`);
}

// -----------------------------------------------------
// LIST MY QUIZZES (helper appelable depuis les pages)
// -----------------------------------------------------

export async function listMyQuizzes() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.quiz.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      status: true,
      mode: true,
      plan: true,
      createdAt: true,
      _count: { select: { questions: true, participations: true } },
    },
  });
}

// -----------------------------------------------------
// GET MY QUIZ (avec questions)
// -----------------------------------------------------

export async function getMyQuiz(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });
}

// -----------------------------------------------------
// UPDATE QUIZ META (titre, description, mode)
// -----------------------------------------------------

const updateQuizMetaSchema = z.object({
  quizId: z.string().min(1),
  title: z
    .string()
    .min(3, "Le titre doit faire au moins 3 caractères.")
    .max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  mode: z.enum(["LIVE_MANUAL", "SCHEDULED"]),
});

export type UpdateQuizMetaState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateQuizMetaAction(
  _prevState: UpdateQuizMetaState,
  formData: FormData
): Promise<UpdateQuizMetaState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const parsed = updateQuizMetaSchema.safeParse({
    quizId: formData.get("quizId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    mode: formData.get("mode") ?? "LIVE_MANUAL",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { quizId, title, description, mode } = parsed.data;

  // updateMany pour garantir qu'on touche uniquement nos quizz
  const result = await prisma.quiz.updateMany({
    where: { id: quizId, userId: session.user.id },
    data: { title, description: description || null, mode },
  });

  if (result.count === 0) {
    return { ok: false, message: "Quizz introuvable ou non autorisé." };
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes`);

  return { ok: true, message: "Modifications enregistrées." };
}

// -----------------------------------------------------
// DELETE QUIZ
// -----------------------------------------------------

export async function deleteQuizAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié.");
  }

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string" || !quizId) {
    throw new Error("Quizz introuvable.");
  }

  // Sécurité : on supprime uniquement si le quizz appartient à l'utilisateur
  await prisma.quiz.deleteMany({
    where: { id: quizId, userId: session.user.id },
  });

  revalidatePath("/dashboard/quizzes");
}
