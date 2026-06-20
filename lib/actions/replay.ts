"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

/**
 * V47.21 — Permet à un joueur de "rejouer" un quiz dont il a déjà soumis sa
 * participation. Supprime sa participation en BDD + son cookie kz_play.
 *
 * RESTRICTION : interdit pour le quizz de la semaine (un seul essai par
 * créneau pour garantir un classement équitable).
 */
export async function replayQuizAction(formData: FormData): Promise<void> {
  const code = formData.get("code");
  if (typeof code !== "string" || !code) {
    throw new Error("Code manquant.");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true, mode: true },
  });
  if (!quiz) throw new Error("Quiz introuvable.");

  // V47.23 : on autorise rejouer pour TOUS les quiz, y compris SCHEDULED,
  // SAUF le quiz hebdo featured (un seul essai par créneau pour celui-ci).
  const { getActiveWeeklyFeatured } = await import("@/lib/weekly/featured");
  const weekly = await getActiveWeeklyFeatured();
  if (weekly?.quizCode === code) {
    throw new Error(
      "Le quiz de la semaine n'est jouable qu'une seule fois. Reviens la semaine prochaine !"
    );
  }

  const cookieStore = await cookies();
  const cookieName = `kz_play_${quiz.id}`;
  const participationId = cookieStore.get(cookieName)?.value;

  if (participationId) {
    await prisma.participation
      .deleteMany({
        where: { id: participationId, quizId: quiz.id },
      })
      .catch((e) =>
        console.warn("[replay] participation delete failed:", e)
      );
    cookieStore.delete(cookieName);
  }

  revalidatePath(`/q/${code}`);
  revalidatePath(`/q/${code}/classement`);
  revalidatePath(`/dashboard/quizzes/library`);
}
