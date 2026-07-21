"use server";

// =============================================
// V53 — Server action : générer les questions d'un quiz via IA
// =============================================
// Réservé aux comptes avec abo actif OU aux admins (modération/assistance).
// Le quiz cible doit appartenir au user (ou être accessible si admin).

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getBillingContext } from "@/lib/billing/context";
import { generateQuizQuestions } from "@/lib/ai/generate-questions";

const schema = z.object({
  quizId: z.string().min(1),
  theme: z.string().min(3).max(200),
  count: z.coerce.number().int().min(3).max(30).default(10),
  // V62 — 2 niveaux hardcore en plus
  difficulty: z
    .enum(["facile", "moyen", "difficile", "expert", "hardcore"])
    .default("moyen"),
});

export type AIGenerateState = {
  ok: boolean;
  message?: string;
  added?: number;
  errors?: Record<string, string[]>;
};

export async function generateQuizQuestionsAction(
  _prev: AIGenerateState,
  formData: FormData
): Promise<AIGenerateState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  // Gating : abo premium actif OU admin
  const billing = await getBillingContext(session.user.id);
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";
  const hasActiveSub =
    billing && (billing.hasActiveSubscription || isAdmin);
  if (!hasActiveSub) {
    return {
      ok: false,
      message:
        "✨ La génération par IA est réservée aux abonnés Premium. Souscris à un abonnement pour débloquer cette fonctionnalité.",
    };
  }

  const parsed = schema.safeParse({
    quizId: formData.get("quizId"),
    theme: formData.get("theme"),
    count: formData.get("count"),
    difficulty: formData.get("difficulty"),
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Vérifie ownership (sauf admin)
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: { id: true, userId: true, code: true, _count: { select: { questions: true } } },
  });
  if (!quiz) {
    return { ok: false, message: "Quiz introuvable." };
  }
  if (!isAdmin && quiz.userId !== session.user.id) {
    return { ok: false, message: "Tu n'es pas propriétaire de ce quiz." };
  }

  // Appel IA
  const result = await generateQuizQuestions({
    theme: parsed.data.theme,
    count: parsed.data.count,
    difficulty: parsed.data.difficulty,
  });
  if (!result.ok) {
    return { ok: false, message: `IA : ${result.error}` };
  }

  // Insertion BDD : on append à la fin (ordre = nbExistant + i)
  const startOrder = quiz._count.questions;
  let added = 0;
  for (let i = 0; i < result.questions.length; i++) {
    const q = result.questions[i];
    try {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          order: startOrder + i + 1,
          type: q.type,
          text: q.text,
          options: q.options as unknown as object,
          points: q.points,
          // V54 — explication facultative generee par l'IA
          explanation: q.explanation ?? null,
        },
      });
      added++;
    } catch (e) {
      console.warn("[ai-gen] question create failed:", e);
    }
  }

  revalidatePath(`/dashboard/quizzes/${quiz.id}/edit`);
  return {
    ok: true,
    added,
    message: `✨ ${added} question${added > 1 ? "s" : ""} générée${added > 1 ? "s" : ""} par IA et ajoutée${added > 1 ? "s" : ""}.`,
  };
}
