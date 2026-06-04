"use server";

// =============================================
// Server Actions — Questions d'un quizz
// =============================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// -----------------------------------------------------
// Vérifie qu'un quizz appartient bien à l'utilisateur connecté.
// Retourne le quizz si OK, sinon null.
// -----------------------------------------------------
async function assertOwnQuiz(quizId: string, userId: string) {
  return prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true },
  });
}

// -----------------------------------------------------
// CREATE QUESTION (création d'une question vierge + redirect vers son éditeur)
// -----------------------------------------------------

export async function createQuestionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string" || !quizId) {
    throw new Error("Quizz manquant.");
  }

  const quiz = await assertOwnQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");

  // Détermine l'ordre = (max existant + 1)
  const last = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;

  const question = await prisma.question.create({
    data: {
      quizId,
      order: nextOrder,
      type: "SINGLE_CHOICE",
      text: "Nouvelle question",
      options: [
        { label: "Réponse A", isCorrect: false },
        { label: "Réponse B", isCorrect: true },
        { label: "Réponse C", isCorrect: false },
        { label: "Réponse D", isCorrect: false },
      ],
      points: 1,
    },
  });

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  redirect(`/dashboard/quizzes/${quizId}/questions/${question.id}/edit`);
}

// -----------------------------------------------------
// UPDATE QUESTION
// -----------------------------------------------------

const optionSchema = z.object({
  label: z.string().min(1).max(200),
  isCorrect: z.boolean(),
});

const updateQuestionSchema = z.object({
  quizId: z.string().min(1),
  questionId: z.string().min(1),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "TEXT"]),
  text: z
    .string()
    .min(1, "La question ne peut pas être vide.")
    .max(500, "Max 500 caractères."),
  points: z.coerce.number().int().min(0).max(100).default(1),
  timerSeconds: z
    .union([z.coerce.number().int().min(5).max(300), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  optionsJson: z.string(),
});

export type UpdateQuestionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateQuestionAction(
  _prevState: UpdateQuestionState,
  formData: FormData
): Promise<UpdateQuestionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const parsed = updateQuestionSchema.safeParse({
    quizId: formData.get("quizId"),
    questionId: formData.get("questionId"),
    type: formData.get("type"),
    text: formData.get("text"),
    points: formData.get("points") ?? 1,
    timerSeconds: formData.get("timerSeconds") ?? "",
    optionsJson: formData.get("optionsJson") ?? "[]",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { quizId, questionId, type, text, points, timerSeconds, optionsJson } =
    parsed.data;

  // Vérifier que le quizz appartient à l'utilisateur
  const quiz = await assertOwnQuiz(quizId, session.user.id);
  if (!quiz) return { ok: false, message: "Quizz introuvable." };

  // Parser les options
  let options: { label: string; isCorrect: boolean }[];
  try {
    const raw = JSON.parse(optionsJson);
    options = z.array(optionSchema).parse(raw);
  } catch {
    return { ok: false, message: "Options invalides." };
  }

  // Validations métier par type
  if (type === "SINGLE_CHOICE") {
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (options.length < 2) {
      return { ok: false, message: "Il faut au moins 2 réponses." };
    }
    if (correctCount !== 1) {
      return {
        ok: false,
        message: "Pour un QCM choix unique, marque exactement 1 bonne réponse.",
      };
    }
  } else if (type === "MULTIPLE_CHOICE") {
    if (options.length < 2) {
      return { ok: false, message: "Il faut au moins 2 réponses." };
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount === 0) {
      return {
        ok: false,
        message: "Marque au moins 1 bonne réponse.",
      };
    }
  } else if (type === "TRUE_FALSE") {
    if (
      options.length !== 2 ||
      options.filter((o) => o.isCorrect).length !== 1
    ) {
      return {
        ok: false,
        message: "Vrai/Faux : exactement 2 options, 1 marquée comme correcte.",
      };
    }
  } else if (type === "TEXT") {
    if (options.length !== 1 || !options[0]?.label?.trim()) {
      return {
        ok: false,
        message: "Renseigne la réponse attendue.",
      };
    }
  }

  // Mise à jour
  await prisma.question.updateMany({
    where: { id: questionId, quizId },
    data: {
      type,
      text,
      options,
      points,
      timerSeconds,
    },
  });

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);

  return { ok: true, message: "Question enregistrée." };
}

// -----------------------------------------------------
// DELETE QUESTION
// -----------------------------------------------------

export async function deleteQuestionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  const questionId = formData.get("questionId");
  if (typeof quizId !== "string" || typeof questionId !== "string") {
    throw new Error("Données manquantes.");
  }

  const quiz = await assertOwnQuiz(quizId, session.user.id);
  if (!quiz) throw new Error("Quizz introuvable.");

  await prisma.question.deleteMany({
    where: { id: questionId, quizId },
  });

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
}
