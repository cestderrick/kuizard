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

  try {
    const result = await saveImageFile(file, `quizzes-${quizId}`);
    if (!result.ok) return { ok: false, message: result.message };

    const oldUrl = quiz.coverImageUrl;
    await prisma.quiz.update({
      where: { id: quizId },
      data: { coverImageUrl: result.url },
    });
    if (oldUrl && oldUrl !== result.url) {
      await deleteImageByUrl(oldUrl).catch((e) =>
        console.warn("[upload] old cover delete failed:", e)
      );
    }

    revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
    revalidatePath(`/q/${quiz.id}`);

    return { ok: true, url: result.url, message: "Photo de couverture mise à jour." };
  } catch (err) {
    // V43.1 : si saveImageFile ou Prisma throw, on renvoie une erreur propre
    // au lieu de laisser la page React crasher.
    console.error("[uploadCoverImage] failed:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Erreur serveur : ${err.message}`
          : "Erreur serveur lors de l'upload. Réessaie.",
    };
  }
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

  try {
    const result = await saveImageFile(file, `quizzes-${quizId}`);
    if (!result.ok) return { ok: false, message: result.message };

    const oldUrl = question.imageUrl;
    await prisma.question.update({
      where: { id: questionId },
      data: { imageUrl: result.url },
    });
    if (oldUrl && oldUrl !== result.url) {
      await deleteImageByUrl(oldUrl).catch((e) =>
        console.warn("[upload] old question image delete failed:", e)
      );
    }

    revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
    revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);

    return { ok: true, url: result.url, message: "Image enregistrée." };
  } catch (err) {
    console.error("[uploadQuestionImage] failed:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Erreur serveur : ${err.message}`
          : "Erreur serveur lors de l'upload. Réessaie.",
    };
  }
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


// =============================================
// V60.5b — ESCAPE STEP : image + audio uploads
// =============================================

export async function uploadEscapeStepImageAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifie." };
  }

  const escapeId = formData.get("escapeId");
  const stepId = formData.get("stepId");
  const file = formData.get("file");
  if (typeof escapeId !== "string" || !escapeId) {
    return { ok: false, message: "Escape manquant." };
  }
  if (typeof stepId !== "string" || !stepId) {
    return { ok: false, message: "Etape manquante." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Aucun fichier selectionne." };
  }

  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId, escape: { userId: session.user.id } },
    select: { id: true, imageUrl: true },
  });
  if (!step) return { ok: false, message: "Etape introuvable." };

  try {
    const result = await saveImageFile(file, `escapes-${escapeId}`);
    if (!result.ok) return { ok: false, message: result.message };

    const oldUrl = step.imageUrl;
    await prisma.escapeStep.update({
      where: { id: stepId },
      data: { imageUrl: result.url },
    });
    if (oldUrl && oldUrl !== result.url) {
      await deleteImageByUrl(oldUrl).catch((e) =>
        console.warn("[upload] old escape step image delete failed:", e)
      );
    }

    revalidatePath(`/dashboard/escapes/${escapeId}/edit`);
    revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
    return { ok: true, url: result.url, message: "Image enregistree." };
  } catch (err) {
    console.error("[uploadEscapeStepImage] failed:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Erreur serveur : ${err.message}`
          : "Erreur serveur lors de l'upload.",
    };
  }
}

export async function removeEscapeStepImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");
  const escapeId = formData.get("escapeId");
  const stepId = formData.get("stepId");
  if (typeof escapeId !== "string" || typeof stepId !== "string") {
    throw new Error("Donnees manquantes.");
  }

  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId, escape: { userId: session.user.id } },
    select: { id: true, imageUrl: true },
  });
  if (!step) throw new Error("Etape introuvable.");

  await prisma.escapeStep.update({
    where: { id: stepId },
    data: { imageUrl: null },
  });
  await deleteImageByUrl(step.imageUrl);
  revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
}

export async function setEscapeStepImageFromUrlAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifie." };
  const escapeId = formData.get("escapeId");
  const stepId = formData.get("stepId");
  const url = formData.get("imageUrl");
  if (typeof escapeId !== "string" || !escapeId) {
    return { ok: false, message: "Escape manquant." };
  }
  if (typeof stepId !== "string" || !stepId) {
    return { ok: false, message: "Etape manquante." };
  }
  if (typeof url !== "string" || !url.trim()) {
    return { ok: false, message: "URL vide." };
  }
  if (!URL_SCHEMA.test(url.trim())) {
    return { ok: false, message: "URL invalide (https requis)." };
  }
  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId, escape: { userId: session.user.id } },
    select: { id: true },
  });
  if (!step) return { ok: false, message: "Etape introuvable." };
  await prisma.escapeStep.update({
    where: { id: stepId },
    data: { imageUrl: url.trim() },
  });
  revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
  return { ok: true, url: url.trim(), message: "URL image enregistree." };
}

// -----------------------------------------------------
// V60.5b — ESCAPE STEP AUDIO (accept mp3/wav/ogg/webm)
// -----------------------------------------------------

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "webm", "m4a", "aac"]);
const AUDIO_MAX_BYTES = 20 * 1024 * 1024; // 20 Mo

async function saveAudioFile(
  file: File,
  bucketSubdir: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (file.size > AUDIO_MAX_BYTES) {
    return { ok: false, message: "Fichier trop lourd (max 20 Mo)." };
  }
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() ?? "";
  if (!AUDIO_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      message: "Format audio non supporte (mp3, wav, ogg, m4a, aac, webm).",
    };
  }
  const { randomBytes } = await import("node:crypto");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const rel = path.join(bucketSubdir, filename);
  const abs = path.join(process.cwd(), "storage", "uploads", rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(abs, buf);
  return { ok: true, url: `/uploads/${rel.replace(/\\/g, "/")}` };
}

export async function uploadEscapeStepAudioAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifie." };

  const escapeId = formData.get("escapeId");
  const stepId = formData.get("stepId");
  const file = formData.get("file");
  if (typeof escapeId !== "string" || typeof stepId !== "string") {
    return { ok: false, message: "Escape/etape manquant." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Aucun fichier selectionne." };
  }

  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId, escape: { userId: session.user.id } },
    select: { id: true, audioUrl: true },
  });
  if (!step) return { ok: false, message: "Etape introuvable." };

  try {
    const result = await saveAudioFile(file, `escapes-${escapeId}-audio`);
    if (!result.ok) return { ok: false, message: result.message };
    await prisma.escapeStep.update({
      where: { id: stepId },
      data: { audioUrl: result.url },
    });
    revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
    return { ok: true, url: result.url, message: "Audio enregistre." };
  } catch (err) {
    console.error("[uploadEscapeStepAudio] failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Erreur upload audio.",
    };
  }
}

export async function removeEscapeStepAudioAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");
  const escapeId = formData.get("escapeId");
  const stepId = formData.get("stepId");
  if (typeof escapeId !== "string" || typeof stepId !== "string") {
    throw new Error("Donnees manquantes.");
  }
  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId, escape: { userId: session.user.id } },
    select: { id: true },
  });
  if (!step) throw new Error("Etape introuvable.");
  await prisma.escapeStep.update({
    where: { id: stepId },
    data: { audioUrl: null },
  });
  revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
}

