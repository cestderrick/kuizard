"use server";

// V60.5c — Server action : generer un escape complet par IA

import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getBillingContext } from "@/lib/billing/context";
import { generateEscape } from "@/lib/ai/generate-escape";
import { getEffectiveEscapePlan } from "@/lib/plans/gating";

const schema = z.object({
  theme: z.string().min(3).max(200),
  stepCount: z.coerce.number().int().min(3).max(12).default(6),
  difficulty: z
    .enum(["facile", "moyen", "difficile", "expert"])
    .default("moyen"),
});

export type GenerateEscapeState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

function generateEscapeCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "E";
  const buf = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) code += chars[buf[i] % chars.length];
  return code;
}

export async function generateEscapeAction(
  _prev: GenerateEscapeState,
  formData: FormData
): Promise<GenerateEscapeState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifie." };
  }

  // Gating premium (comme la generation IA de questions) ou admin
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";
  if (!isAdmin) {
    const billing = await getBillingContext(session.user.id);
    if (!billing?.hasActiveSubscription) {
      return {
        ok: false,
        message:
          "✨ La generation d'escape par IA est reservee aux abonnes Premium.",
      };
    }
  }

  const parsed = schema.safeParse({
    theme: formData.get("theme"),
    stepCount: formData.get("stepCount") ?? 6,
    difficulty: formData.get("difficulty") ?? "moyen",
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Verifie les champs.",
    };
  }

  // V60.3 — Verifie qu'on peut creer un escape de plus
  const plan = await getEffectiveEscapePlan(session.user.id);
  if (plan.limits.maxEscapes !== undefined) {
    const count = await prisma.escape.count({
      where: { userId: session.user.id },
    });
    if (count >= plan.limits.maxEscapes) {
      return {
        ok: false,
        message:
          plan.limits.maxEscapes === 0
            ? "Les escapes ne sont pas inclus dans ton plan."
            : `Limite atteinte (${plan.limits.maxEscapes} escapes max).`,
      };
    }
  }

  // Appel IA
  const result = await generateEscape({
    theme: parsed.data.theme,
    stepCount: parsed.data.stepCount,
    difficulty: parsed.data.difficulty,
  });
  if (!result.ok) {
    return { ok: false, message: `IA : ${result.error}` };
  }

  // Genere un code unique
  let code = "";
  for (let i = 0; i < 10; i++) {
    code = generateEscapeCode();
    const existing = await prisma.escape.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) break;
  }

  // Cree l'escape + steps en BDD
  const escape = await prisma.escape.create({
    data: {
      userId: session.user.id,
      code,
      title: result.escape.title,
      description: result.escape.description,
    },
    select: { id: true },
  });

  for (const s of result.escape.steps) {
    await prisma.escapeStep.create({
      data: {
        escapeId: escape.id,
        order: s.order,
        type: s.type,
        title: s.title,
        body: s.body,
        expectedAnswer: s.expectedAnswer,
        options: s.options as unknown as object,
        hints: s.hints as unknown as object,
        points: s.points,
      },
    });
  }

  revalidatePath("/dashboard/escapes");
  redirect(`/dashboard/escapes/${escape.id}/edit`);
}
