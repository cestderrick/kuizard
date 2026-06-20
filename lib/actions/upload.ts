"use server";

// =============================================
// Server Actions — Upload d'images
// =============================================

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { saveImageFile, deleteImageByUrl } from "@/lib/upload/save";
import { getEffectivePlan } from "@/lib/plans/gating";

export type UploadState = {
  ok: boolean;
  url?: string;
  message?: string;
};

// -----------------------------------------------------
// COVER IMAGE du quizz
// -----------------------------------------------------

export async function uploadCoverImageAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const quizId = formData.get("quizId");
  const file = formData.get("file");

  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Aucun fichier sélectionné." };
  }

  // Vérifier que le quizz appartient au user
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: { id: true, coverImageUrl: true },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };

  // Gating : photo de couverture
  const plan = await getEffectivePlan(quizId);
  if (plan.limits.coverImage === false) {
    return {
      ok: false,
      message: `La photo de couverture n'est pas incluse dans ton plan "${plan.name}". Passe à un plan supérieur pour l'activer.`,
    };
  }

  const result = await saveImageFile(file, `quizzes-${quizId}`);
  if (!result.ok) return { ok: false, message: result.message };

  // Mettre à jour le quizz + supprimer l'ancien fichier si existant
  const oldUrl = quiz.coverImageUrl;
  await prisma.quiz.update({
    where: { id: quizId },
    data: { coverImageUrl: result.url },
  });
  if (oldUrl && oldUrl !== result.url) {
    await deleteImageByUrl(oldUrl);
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/q/${quiz.id}`); // pattern, revalidate s'occupe du reste

  return { ok: true, url: result.url, message: "Photo de couverture mise à jour." };
}

export async function removeCoverImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  if (typeof quizId !== "string" || !quizId) throw new Error("Quizz manquant.");

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: { id: true, coverImageUrl: true },
  });
  if (!quiz) throw new Error("Quizz introuvable.");

  await prisma.quiz.update({
    where: { id: quizId },
    data: { coverImageUrl: null },
  });
  await deleteImageByUrl(quiz.coverImageUrl);

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
}

// -----------------------------------------------------
// QUESTION IMAGE
// -----------------------------------------------------

export async function uploadQuestionImageAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const quizId = formData.get("quizId");
  const questionId = formData.get("questionId");
  const file = formData.get("file");

  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }
  if (typeof questionId !== "string" || !questionId) {
    return { ok: false, message: "Question manquante." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Aucun fichier sélectionné." };
  }

  // Vérifier ownership : on cherche la question via son quiz parent
  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId, quiz: { userId: session.user.id } },
    select: { id: true, imageUrl: true },
  });
  if (!question) return { ok: false, message: "Question introuvable." };

  // Gating : photo sur les questions
  const plan = await getEffectivePlan(quizId);
  if (plan.limits.questionImages === false) {
    return {
      ok: false,
      message: `Les photos sur les questions ne sont pas incluses dans ton plan "${plan.name}". Passe à un plan supérieur pour les activer.`,
    };
  }

  const result = await saveImageFile(file, `quizzes-${quizId}`);
  if (!result.ok) return { ok: false, message: result.message };

  const oldUrl = question.imageUrl;
  await prisma.question.update({
    where: { id: questionId },
    data: { imageUrl: result.url },
  });
  if (oldUrl && oldUrl !== result.url) {
    await deleteImageByUrl(oldUrl);
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);

  return { ok: true, url: result.url, message: "Image enregistrée." };
}

export async function removeQuestionImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const quizId = formData.get("quizId");
  const questionId = formData.get("questionId");
  if (typeof quizId !== "string" || typeof questionId !== "string") {
    throw new Error("Données manquantes.");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId, quiz: { userId: session.user.id } },
    select: { id: true, imageUrl: true },
  });
  if (!question) throw new Error("Question introuvable.");

  await prisma.question.update({
    where: { id: questionId },
    data: { imageUrl: null },
  });
  await deleteImageByUrl(question.imageUrl);

  revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);
}

// =============================================
// V43 — Set image from external URL (link instead of upload)
// =============================================
// Permet de coller une URL HTTPS directement dans le champ "image" au lieu
// d'uploader un fichier. Utile pour les photos déjà hébergées (Unsplash,
// Google Photos public, etc.) ou pour les utilisateurs qui n'ont pas la
// place de stocker.

const URL_SCHEMA = /^https:\/\/[^\s<>"]+/i;

export async function setQuestionImageFromUrlAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const quizId = formData.get("quizId");
  const questionId = formData.get("questionId");
  const url = formData.get("imageUrl");

  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }
  if (typeof questionId !== "string" || !questionId) {
    return { ok: false, message: "Question manquante." };
  }
  if (typeof url !== "string" || !url.trim()) {
    return { ok: false, message: "URL vide." };
  }

  const trimmed = url.trim();
  if (!URL_SCHEMA.test(trimmed)) {
    return {
      ok: false,
      message: "L'URL doit commencer par https:// et ne pas contenir d'espaces.",
    };
  }
  if (trimmed.length > 2048) {
    return { ok: false, message: "URL trop longue (max 2048 caractères)." };
  }

  // Vérifier ownership
  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId, quiz: { userId: session.user.id } },
    select: { id: true, imageUrl: true },
  });
  if (!question) return { ok: false, message: "Question introuvable." };

  // Gating plan : même limite que pour l'upload de fichier
  const plan = await getEffectivePlan(quizId);
  if (plan.limits.questionImages === false) {
    return {
      ok: false,
      message: `Les images sur les questions ne sont pas incluses dans ton plan \"${plan.name}\".`,
    };
  }

  // Update + cleanup éventuel de l'ancienne image hébergée chez nous
  const oldUrl = question.imageUrl;
  await prisma.question.update({
    where: { id: questionId },
    data: { imageUrl: trimmed },
  });
  // On supprime l'ancien fichier UNIQUEMENT s'il était hébergé chez nous
  // (local /uploads/ ou R2). Si c'était déjà une URL externe, on ne touche rien.
  if (oldUrl && oldUrl !== trimmed) {
    await deleteImageByUrl(oldUrl);
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);

  return { ok: true, url: trimmed, message: "Image enregistrée depuis URL." };
}

export async function setCoverImageFromUrlAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifié." };

  const quizId = formData.get("quizId");
  const url = formData.get("imageUrl");
  if (typeof quizId !== "string" || !quizId) {
    return { ok: false, message: "Quizz manquant." };
  }
  if (typeof url !== "string" || !url.trim()) {
    return { ok: false, message: "URL vide." };
  }
  const trimmed = url.trim();
  if (!URL_SCHEMA.test(trimmed)) {
    return {
      ok: false,
      message: "L'URL doit commencer par https:// et ne pas contenir d'espaces.",
    };
  }
  if (trimmed.length > 2048) {
    return { ok: false, message: "URL trop longue." };
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: { id: true, coverImageUrl: true },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };

  const plan = await getEffectivePlan(quizId);
  if (plan.limits.coverImage === false) {
    return {
      ok: false,
      message: `La photo de couverture n'est pas incluse dans ton plan \"${plan.name}\".`,
    };
  }

  const oldUrl = quiz.coverImageUrl;
  await prisma.quiz.update({
    where: { id: quizId },
    data: { coverImageUrl: trimmed },
  });
  if (oldUrl && oldUrl !== trimmed) {
    await deleteImageByUrl(oldUrl);
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  return { ok: true, url: trimmed, message: "Photo de couverture enregistrée." };
}
