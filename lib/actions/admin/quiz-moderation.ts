"use server";

// =============================================
// V49.1 — Modération admin des quizz
// =============================================
// Permet aux admins de supprimer le quizz d'un autre user (modération
// abuse / contenu inapproprié, ou nettoyage après assistance).
// Toute action est tracée dans l'audit log.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";

export async function adminDeleteQuizAction(formData: FormData): Promise<void> {
  const { user: admin } = await requireAdmin();

  const quizId = formData.get("quizId");
  const reason = formData.get("reason");
  if (typeof quizId !== "string" || !quizId) {
    throw new Error("Quizz introuvable.");
  }

  const target = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      code: true,
      title: true,
      userId: true,
      user: { select: { email: true } },
    },
  });
  if (!target) {
    throw new Error("Quizz introuvable.");
  }

  // Supprime le quizz (cascade : questions + participations s'effacent par
  // les onDelete: Cascade du schema Prisma)
  await prisma.quiz.delete({ where: { id: quizId } });

  // Audit log
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email ?? "",
    action: "delete_quiz",
    targetUserId: target.userId,
    targetUserEmail: target.user.email,
    targetQuizId: target.id,
    payload: {
      code: target.code,
      title: target.title,
      reason: typeof reason === "string" ? reason : null,
    },
  });

  revalidatePath("/admin/quizzes");
  redirect("/admin/quizzes");
}
