"use server";

// =============================================
// Server Actions — Quizz (création, listage, suppression…)
// =============================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateUniqueQuizCode } from "@/lib/quiz/generate-code";
import { getTemplateBySlugUnified } from "@/lib/quiz/templates-source";

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

  // Créer le quizz en BDD.
  // 👉 Plus de DRAFT : le quizz est directement PUBLISHED. Le gating se fait par
  // mode (LIVE attend l'admin, SCHEDULED attend les dates) et la page joueur
  // affiche "quizz en préparation" tant qu'il n'y a pas de question.
  // Conservation FREE : 30 jours par défaut, recalculé au moment de l'envoi
  // si le plan change.
  const expiresAt = new Date(Date.now() + 30 * 86400 * 1000);
  const quiz = await prisma.quiz.create({
    data: {
      userId: session.user.id,
      code,
      title,
      description: description || null,
      mode,
      status: "PUBLISHED",
      plan: "FREE",
      expiresAt,
    },
  });

  // Rafraîchir la liste des quizz dans le dashboard
  revalidatePath("/dashboard/quizzes");

  // Rediriger vers l'éditeur (la page sera créée au Sprint 2.2)
  redirect(`/dashboard/quizzes/${quiz.id}/edit`);
}

// -----------------------------------------------------
// CREATE FROM TEMPLATE
// -----------------------------------------------------

export async function createFromTemplateAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const slug = formData.get("slug");
  if (typeof slug !== "string" || !slug) throw new Error("Template manquant.");

  // Check quota mensuel (uniquement si user abonné avec quota défini)
  const { canUseTemplateNow } = await import("@/lib/plans/template-quota");
  const quotaCheck = await canUseTemplateNow(session.user.id);
  if (!quotaCheck.ok) {
    throw new Error(quotaCheck.message ?? "Quota atteint.");
  }

  const template = await getTemplateBySlugUnified(slug);
  if (!template) throw new Error("Template introuvable.");

  const code = await generateUniqueQuizCode();

  const expiresAt = new Date(Date.now() + 30 * 86400 * 1000);
  const quiz = await prisma.quiz.create({
    data: {
      userId: session.user.id,
      code,
      title: template.quizTitle,
      description: template.quizDescription,
      mode: "LIVE_MANUAL",
      status: "PUBLISHED",
      plan: "FREE",
      fromTemplateSlug: template.slug,
      expiresAt,
      theme: {
        primaryColor: template.themeColor,
        background: "night",
      } as unknown as Prisma.InputJsonValue,
      questions: {
        create: template.questions.map((q, index) => ({
          order: index + 1,
          type: q.type,
          text: q.text,
          points: q.points,
          options: q.options as unknown as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath("/dashboard/quizzes");
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
      liveState: true,
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

const updateQuizMetaSchema = z
  .object({
    quizId: z.string().min(1),
    title: z
      .string()
      .min(3, "Le titre doit faire au moins 3 caractères.")
      .max(80),
    description: z.string().max(500).optional().or(z.literal("")),
    mode: z.enum(["LIVE_MANUAL", "SCHEDULED"]),
    scheduledOpenAt: z.string().optional().or(z.literal("")),
    scheduledCloseAt: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.mode !== "SCHEDULED") return true;
      // En mode SCHEDULED, les deux dates sont requises
      return !!data.scheduledOpenAt && !!data.scheduledCloseAt;
    },
    {
      message:
        "En mode créneau horaire, l'ouverture et la fermeture sont obligatoires.",
      path: ["scheduledOpenAt"],
    }
  )
  .refine(
    (data) => {
      if (data.mode !== "SCHEDULED") return true;
      if (!data.scheduledOpenAt || !data.scheduledCloseAt) return true;
      return new Date(data.scheduledOpenAt) < new Date(data.scheduledCloseAt);
    },
    {
      message: "La date de fermeture doit être après l'ouverture.",
      path: ["scheduledCloseAt"],
    }
  );

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
    scheduledOpenAt: formData.get("scheduledOpenAt") ?? "",
    scheduledCloseAt: formData.get("scheduledCloseAt") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { quizId, title, description, mode, scheduledOpenAt, scheduledCloseAt } =
    parsed.data;

  // Gating : check que le mode est autorisé par le plan
  const { getEffectivePlan } = await import("@/lib/plans/gating");
  const plan = await getEffectivePlan(quizId);
  if (mode === "SCHEDULED" && plan.limits.scheduledMode === false) {
    return {
      ok: false,
      message: `Le mode "Créneau horaire" n'est pas inclus dans ton plan "${plan.name}". Passe à un plan supérieur pour l'activer.`,
    };
  }
  if (mode === "LIVE_MANUAL" && plan.limits.liveMode === false) {
    return {
      ok: false,
      message: `Le mode "Pilotage live" n'est pas inclus dans ton plan "${plan.name}". Passe à un plan supérieur pour l'activer.`,
    };
  }

  const openAt =
    mode === "SCHEDULED" && scheduledOpenAt ? new Date(scheduledOpenAt) : null;
  const closeAt =
    mode === "SCHEDULED" && scheduledCloseAt
      ? new Date(scheduledCloseAt)
      : null;

  // updateMany pour garantir qu'on touche uniquement nos quizz
  const result = await prisma.quiz.updateMany({
    where: { id: quizId, userId: session.user.id },
    data: {
      title,
      description: description || null,
      mode,
      scheduledOpenAt: openAt,
      scheduledCloseAt: closeAt,
    },
  });

  if (result.count === 0) {
    return { ok: false, message: "Quizz introuvable ou non autorisé." };
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes`);

  return { ok: true, message: "Modifications enregistrées." };
}

// -----------------------------------------------------
// THEME (couleur principale + fond)
// -----------------------------------------------------

const themeSchema = z.object({
  quizId: z.string().min(1),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide (ex : #6B46C1)."),
  background: z.enum(["night", "light"]),
});

export type UpdateThemeState = {
  ok: boolean;
  message?: string;
};

export async function updateThemeAction(
  _prev: UpdateThemeState,
  formData: FormData
): Promise<UpdateThemeState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const parsed = themeSchema.safeParse({
    quizId: formData.get("quizId"),
    primaryColor: formData.get("primaryColor"),
    background: formData.get("background") ?? "night",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { quizId, primaryColor, background } = parsed.data;

  // Gating : personnalisation des couleurs
  const { getEffectivePlan } = await import("@/lib/plans/gating");
  const plan = await getEffectivePlan(quizId);
  if (plan.limits.customColors === false) {
    return {
      ok: false,
      message: `La personnalisation des couleurs n'est pas incluse dans ton plan "${plan.name}". Passe à un plan supérieur pour l'activer.`,
    };
  }

  const result = await prisma.quiz.updateMany({
    where: { id: quizId, userId: session.user.id },
    data: {
      theme: { primaryColor, background } as unknown as Prisma.InputJsonValue,
    },
  });

  if (result.count === 0) {
    return { ok: false, message: "Quizz introuvable." };
  }

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/q/${quizId}`); // path utilisé par revalidate, n'importe quel pattern

  return { ok: true, message: "Thème enregistré." };
}

// -----------------------------------------------------
// PRIZES (lots associés aux rangs du classement)
// -----------------------------------------------------

const prizeSchema = z.object({
  rank: z.coerce.number().int().min(1).max(20),
  label: z.string().min(1, "Le lot doit avoir un nom.").max(120),
  description: z.string().max(300).optional().or(z.literal("")),
});

const updatePrizesSchema = z.object({
  quizId: z.string().min(1),
  prizesJson: z.string(),
});

export type UpdatePrizesState = {
  ok: boolean;
  message?: string;
};

export async function updatePrizesAction(
  _prev: UpdatePrizesState,
  formData: FormData
): Promise<UpdatePrizesState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const parsed = updatePrizesSchema.safeParse({
    quizId: formData.get("quizId"),
    prizesJson: formData.get("prizesJson") ?? "[]",
  });
  if (!parsed.success) return { ok: false, message: "Données invalides." };

  // Gating : lots personnalisés
  const { getEffectivePlan } = await import("@/lib/plans/gating");
  const plan = await getEffectivePlan(parsed.data.quizId);
  if (plan.limits.customPrizes === false) {
    return {
      ok: false,
      message: `Les lots personnalisés ne sont pas inclus dans ton plan "${plan.name}". Passe à un plan supérieur pour les activer.`,
    };
  }

  let prizes: unknown;
  try {
    prizes = JSON.parse(parsed.data.prizesJson);
  } catch {
    return { ok: false, message: "Format des lots invalide." };
  }

  const validated = z.array(prizeSchema).safeParse(prizes);
  if (!validated.success) {
    return {
      ok: false,
      message: "Un lot a un rang ou un libellé invalide.",
    };
  }

  // Dédoublonner par rang : si plusieurs lots ciblent le même rang, on garde
  // uniquement le dernier (le plus à droite dans la liste de l'éditeur).
  const byRank = new Map<number, (typeof validated.data)[number]>();
  for (const p of validated.data) {
    byRank.set(p.rank, p);
  }
  const cleaned = Array.from(byRank.values())
    .map((p) => ({
      rank: p.rank,
      label: p.label.trim(),
      description: p.description?.trim() || undefined,
    }))
    .sort((a, b) => a.rank - b.rank);

  const result = await prisma.quiz.updateMany({
    where: { id: parsed.data.quizId, userId: session.user.id },
    data: {
      // Cast vers le type Prisma JSON
      prizes: cleaned as unknown as Prisma.InputJsonValue,
    },
  });

  if (result.count === 0) {
    return { ok: false, message: "Quizz introuvable ou non autorisé." };
  }

  revalidatePath(`/dashboard/quizzes/${parsed.data.quizId}/edit`);
  revalidatePath(`/q/${parsed.data.quizId}/classement`);

  return { ok: true, message: "Lots enregistrés." };
}

// -----------------------------------------------------
// PUBLISH / UNPUBLISH QUIZ
// -----------------------------------------------------

const publishSchema = z.object({
  quizId: z.string().min(1),
});

export type PublishQuizState = {
  ok: boolean;
  message?: string;
};

/**
 * Publie un quizz : passe DRAFT → PUBLISHED, calcule expiresAt selon le plan.
 * Au MVP tous les quizz sont en FREE → conservation 1 mois.
 */
export async function publishQuizAction(
  _prevState: PublishQuizState,
  formData: FormData
): Promise<PublishQuizState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Non authentifié." };
  }

  const parsed = publishSchema.safeParse({ quizId: formData.get("quizId") });
  if (!parsed.success) return { ok: false, message: "Données invalides." };

  const { quizId } = parsed.data;

  // Récupérer le quizz pour vérifier qu'il appartient au user et qu'il a au
  // moins 1 question
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId: session.user.id },
    select: { id: true, plan: true, status: true, _count: { select: { questions: true } } },
  });
  if (!quiz) return { ok: false, message: "Quizz introuvable." };

  if (quiz._count.questions === 0) {
    return {
      ok: false,
      message: "Ajoute au moins 1 question avant de publier.",
    };
  }

  // Durée de conservation selon le plan (1 mois FREE, 2 mois Essentiel/Festif/Magique, 6 mois Bar)
  const RETENTION_DAYS_BY_PLAN: Record<string, number> = {
    FREE: 30,
    ESSENTIEL: 60,
    FESTIF: 60,
    MAGIQUE: 60,
    BAR_ESSENTIEL: 180,
    BAR_PRO: 180,
  };
  const retentionDays = RETENTION_DAYS_BY_PLAN[quiz.plan] ?? 30;
  const expiresAt = new Date(Date.now() + retentionDays * 86400 * 1000);

  await prisma.quiz.update({
    where: { id: quizId },
    data: { status: "PUBLISHED", expiresAt },
  });

  revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
  revalidatePath(`/dashboard/quizzes`);
  revalidatePath(`/q/${quizId}`);

  return { ok: true, message: "Quizz publié ! Le lien est maintenant actif." };
}

export async function unpublishQuizAction(
  _prevState: PublishQuizState,
  formData: FormData
): Promise<PublishQuizState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifié." };

  const parsed = publishSchema.safeParse({ quizId: formData.get("quizId") });
  if (!parsed.success) return { ok: false, message: "Données invalides." };

  await prisma.quiz.updateMany({
    where: { id: parsed.data.quizId, userId: session.user.id },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/dashboard/quizzes/${parsed.data.quizId}/edit`);
  return { ok: true, message: "Quizz remis en brouillon. Le lien n'est plus actif." };
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
  // Redirige toujours vers la liste — utile si l'utilisateur supprimait depuis
  // la page d'édition (sinon il atterrirait sur un 404 fantôme).
  redirect("/dashboard/quizzes");
}
