import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { prisma } from "@/lib/db";

/**
 * V47.21 — Route "smart" pour les liens d'invitation type "Tenter ma chance".
 * - Si le user a déjà joué (cookie kz_play_<quizId> existe + participation
 *   completée en BDD) → redirige vers /q/[code]/classement
 * - Sinon → redirige vers /q/[code] (jeu normal)
 *
 * Permet de ne pas obliger le joueur à recommencer s'il a déjà fini.
 */
export const dynamic = "force-dynamic";

export default async function GoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true },
  });
  if (!quiz) notFound();

  // Cookie de participation
  const cookieStore = await cookies();
  const participationId = cookieStore.get(`kz_play_${quiz.id}`)?.value;

  if (participationId) {
    const part = await prisma.participation.findFirst({
      where: { id: participationId, quizId: quiz.id },
      select: { completedAt: true },
    });
    if (part?.completedAt) {
      // Déjà joué et fini → va direct au classement
      redirect(`/q/${code}/classement`);
    }
  }

  // Sinon, on lance le jeu
  redirect(`/q/${code}`);
}
