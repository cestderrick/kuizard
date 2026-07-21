"use server";

// =============================================
// V60.2 — Server Actions : Escape games CRUD
// =============================================

import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEffectiveEscapePlan } from "@/lib/plans/gating";

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

// Code court "E" + 5 chars, sans 0/O/I/1 pour lisibilite (ex: E7K3M2)
function generateEscapeCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "E";
  const buf = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    code += chars[buf[i] % chars.length];
  }
  return code;
}

async function assertOwnEscape(escapeId: string, userId: string) {
  return prisma.escape.findFirst({
    where: { id: escapeId, userId },
    select: { id: true },
  });
}

// -----------------------------------------------------
// CREATE ESCAPE (redirige vers l'editeur)
// -----------------------------------------------------

export async function createEscapeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 100) {
    throw new Error("Titre invalide (2 a 100 caracteres).");
  }

  // V60.3 — Gating : nombre max d'escapes selon plan effectif
  const plan = await getEffectiveEscapePlan(session.user.id);
  const maxEscapes = plan.limits.maxEscapes;
  if (maxEscapes !== undefined) {
    const currentCount = await prisma.escape.count({
      where: { userId: session.user.id },
    });
    if (currentCount >= maxEscapes) {
      throw new Error(
        maxEscapes === 0
          ? "Les escape games ne sont pas inclus dans ton plan actuel. Souscris a un abonnement pour les debloquer."
          : `Tu as atteint la limite de ton plan (${maxEscapes} escape${maxEscapes > 1 ? "s" : ""}). Passe a un plan superieur pour en creer plus.`
      );
    }
  }

  // Genere un code unique (10 essais max, quasi impossible de collisionner)
  let code = "";
  for (let i = 0; i < 10; i++) {
    code = generateEscapeCode();
    const existing = await prisma.escape.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) break;
  }

  const escape = await prisma.escape.create({
    data: {
      userId: session.user.id,
      code,
      title,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard/escapes");
  redirect(`/dashboard/escapes/${escape.id}/edit`);
}

// -----------------------------------------------------
// UPDATE ESCAPE META
// -----------------------------------------------------

const updateMetaSchema = z.object({
  escapeId: z.string().min(1),
  title: z.string().min(2, "Titre trop court.").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  timerMinutes: z
    .union([z.coerce.number().int().min(1).max(600), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  hintCostPoints: z.coerce.number().int().min(0).max(100).default(10),
});

export type UpdateEscapeMetaState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateEscapeMetaAction(
  _prev: UpdateEscapeMetaState,
  formData: FormData
): Promise<UpdateEscapeMetaState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifie." };

  const parsed = updateMetaSchema.safeParse({
    escapeId: formData.get("escapeId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    timerMinutes: formData.get("timerMinutes") ?? "",
    hintCostPoints: formData.get("hintCostPoints") ?? 10,
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Verifie les champs.",
    };
  }

  const { escapeId, title, description, timerMinutes, hintCostPoints } =
    parsed.data;

  const own = await assertOwnEscape(escapeId, session.user.id);
  if (!own) return { ok: false, message: "Escape introuvable." };

  await prisma.escape.update({
    where: { id: escapeId },
    data: {
      title,
      description: description ? description.trim() : null,
      timerMinutes,
      hintCostPoints,
    },
  });

  revalidatePath(`/dashboard/escapes/${escapeId}/edit`);
  return { ok: true, message: "Enregistre." };
}

// -----------------------------------------------------
// DELETE ESCAPE
// -----------------------------------------------------

export async function deleteEscapeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");

  const escapeId = String(formData.get("escapeId") ?? "");
  const own = await assertOwnEscape(escapeId, session.user.id);
  if (!own) throw new Error("Escape introuvable.");

  await prisma.escape.delete({ where: { id: escapeId } });
  revalidatePath("/dashboard/escapes");
  redirect("/dashboard/escapes");
}

// -----------------------------------------------------
// STEP: CREATE (redirige vers l'editeur de l'etape)
// -----------------------------------------------------

export async function addEscapeStepAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");

  const escapeId = String(formData.get("escapeId") ?? "");
  const own = await assertOwnEscape(escapeId, session.user.id);
  if (!own) throw new Error("Escape introuvable.");

  // V60.3 — Gating : nombre max de steps par escape selon plan effectif
  const plan = await getEffectiveEscapePlan(session.user.id);
  const maxSteps = plan.limits.maxEscapeSteps;
  if (maxSteps !== undefined) {
    const currentSteps = await prisma.escapeStep.count({ where: { escapeId } });
    if (currentSteps >= maxSteps) {
      throw new Error(
        `Tu as atteint la limite de ${maxSteps} etape${maxSteps > 1 ? "s" : ""} par escape sur ton plan. Passe a un plan superieur pour en ajouter plus.`
      );
    }
  }

  const last = await prisma.escapeStep.findFirst({
    where: { escapeId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;

  const step = await prisma.escapeStep.create({
    data: {
      escapeId,
      order: nextOrder,
      type: "TEXT",
      body: "",
      expectedAnswer: "",
      options: [],
      hints: [],
      points: 10,
    },
  });

  revalidatePath(`/dashboard/escapes/${escapeId}/edit`);
  redirect(`/dashboard/escapes/${escapeId}/steps/${step.id}/edit`);
}

// -----------------------------------------------------
// STEP: UPDATE
// -----------------------------------------------------

const optionSchema = z.object({
  label: z.string().min(1).max(200),
  isCorrect: z.boolean(),
});

const updateStepSchema = z.object({
  escapeId: z.string().min(1),
  stepId: z.string().min(1),
  type: z.enum(["TEXT", "CHOICE", "IMAGE", "AUDIO"]),
  title: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(1, "Enonce vide.").max(2000),
  expectedAnswer: z.string().max(500).optional().or(z.literal("")),
  points: z.coerce.number().int().min(0).max(1000).default(10),
  optionsJson: z.string(),
  hintsJson: z.string(),
});

export type UpdateEscapeStepState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateEscapeStepAction(
  _prev: UpdateEscapeStepState,
  formData: FormData
): Promise<UpdateEscapeStepState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifie." };

  const parsed = updateStepSchema.safeParse({
    escapeId: formData.get("escapeId"),
    stepId: formData.get("stepId"),
    type: formData.get("type"),
    title: formData.get("title") ?? "",
    body: formData.get("body"),
    expectedAnswer: formData.get("expectedAnswer") ?? "",
    points: formData.get("points") ?? 10,
    optionsJson: formData.get("optionsJson") ?? "[]",
    hintsJson: formData.get("hintsJson") ?? "[]",
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Verifie les champs.",
    };
  }

  const {
    escapeId,
    stepId,
    type,
    title,
    body,
    expectedAnswer,
    points,
    optionsJson,
    hintsJson,
  } = parsed.data;

  const own = await assertOwnEscape(escapeId, session.user.id);
  if (!own) return { ok: false, message: "Escape introuvable." };

  // Parse options + hints
  let options: { label: string; isCorrect: boolean }[] = [];
  try {
    options = z.array(optionSchema).parse(JSON.parse(optionsJson));
  } catch {
    options = [];
  }
  let hints: string[] = [];
  try {
    hints = z.array(z.string().min(1).max(300)).parse(JSON.parse(hintsJson));
  } catch {
    hints = [];
  }

  // Validation par type
  if (type === "CHOICE") {
    if (options.length < 2) {
      return { ok: false, message: "Il faut au moins 2 reponses pour un choix." };
    }
    if (!options.some((o) => o.isCorrect)) {
      return { ok: false, message: "Marque au moins 1 bonne reponse." };
    }
  } else if (type === "TEXT" || type === "IMAGE" || type === "AUDIO") {
    if (!expectedAnswer || expectedAnswer.trim().length === 0) {
      return { ok: false, message: "Renseigne la reponse attendue." };
    }
  }

  await prisma.escapeStep.updateMany({
    where: { id: stepId, escapeId },
    data: {
      type,
      title: title ? title.trim() : null,
      body: body.trim(),
      expectedAnswer: expectedAnswer ? expectedAnswer.trim() : null,
      options: options as unknown as object,
      hints: hints as unknown as object,
      points,
    },
  });

  revalidatePath(`/dashboard/escapes/${escapeId}/edit`);
  revalidatePath(`/dashboard/escapes/${escapeId}/steps/${stepId}/edit`);
  return { ok: true, message: "Etape enregistree." };
}

// -----------------------------------------------------
// STEP: DELETE
// -----------------------------------------------------

export async function deleteEscapeStepAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");

  const escapeId = String(formData.get("escapeId") ?? "");
  const stepId = String(formData.get("stepId") ?? "");
  const own = await assertOwnEscape(escapeId, session.user.id);
  if (!own) throw new Error("Escape introuvable.");

  await prisma.escapeStep.deleteMany({ where: { id: stepId, escapeId } });
  revalidatePath(`/dashboard/escapes/${escapeId}/edit`);
}


// -----------------------------------------------------
// V60.4b — ADMIN : marquer un escape comme library (ou non)
// -----------------------------------------------------

const toggleLibrarySchema = z.object({
  escapeId: z.string().min(1),
  isLibrary: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean()
  ),
  isPremium: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean()
  ),
  libraryDescription: z.string().max(1000).optional().or(z.literal("")),
  libraryTags: z.string().max(500).optional().or(z.literal("")),
  libraryLanguage: z.string().max(20).optional().or(z.literal("")),
});

export type ToggleEscapeLibraryState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function toggleEscapeLibraryAction(
  _prev: ToggleEscapeLibraryState,
  formData: FormData
): Promise<ToggleEscapeLibraryState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non authentifie." };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") {
    return { ok: false, message: "Reserve aux admins." };
  }

  const parsed = toggleLibrarySchema.safeParse({
    escapeId: formData.get("escapeId"),
    isLibrary: formData.get("isLibrary"),
    isPremium: formData.get("isPremium"),
    libraryDescription: formData.get("libraryDescription") ?? "",
    libraryTags: formData.get("libraryTags") ?? "",
    libraryLanguage: formData.get("libraryLanguage") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const v = parsed.data;

  const tags = (v.libraryTags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 10);

  await prisma.escape.update({
    where: { id: v.escapeId },
    data: {
      isLibrary: v.isLibrary,
      libraryIsPremium: v.isPremium,
      libraryDescription: v.libraryDescription
        ? v.libraryDescription.trim()
        : null,
      libraryTags: tags,
      libraryLanguage: v.libraryLanguage ? v.libraryLanguage.trim() : null,
    },
  });

  revalidatePath(`/dashboard/escapes/${v.escapeId}/edit`);
  revalidatePath("/dashboard/escapes/library");
  return { ok: true, message: v.isLibrary ? "Ajoute a la bibliotheque." : "Retire de la bibliotheque." };
}

// -----------------------------------------------------
// V60.4b — Dupliquer un escape library dans son propre compte
// -----------------------------------------------------
// Gating : escape gratuit (libraryIsPremium=false) OU user avec abo actif OU admin.

const duplicateSchema = z.object({
  sourceEscapeId: z.string().min(1),
});

export async function duplicateLibraryEscapeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie.");

  const parsed = duplicateSchema.safeParse({
    sourceEscapeId: formData.get("sourceEscapeId"),
  });
  if (!parsed.success) throw new Error("Escape source invalide.");

  // Charge la source (doit etre marquee library)
  const source = await prisma.escape.findFirst({
    where: { id: parsed.data.sourceEscapeId, isLibrary: true },
    include: {
      steps: { orderBy: { order: "asc" } },
    },
  });
  if (!source) throw new Error("Escape introuvable dans la bibliotheque.");

  // Gating : si premium, verifier abo ou admin
  if (source.libraryIsPremium) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    const isAdmin = me?.role === "ADMIN";
    if (!isAdmin) {
      const now = new Date();
      const [activeSub, giftedSub] = await Promise.all([
        prisma.subscription.findFirst({
          where: {
            userId: session.user.id,
            status: { in: ["active", "trialing"] },
          },
        }),
        prisma.grantedPlan.findFirst({
          where: {
            userId: session.user.id,
            type: "subscription",
            revokedAt: null,
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        }),
      ]);
      if (!activeSub && !giftedSub) {
        redirect(
          `/tarifs?from=escape-library&escape=${encodeURIComponent(source.title)}`
        );
      }
    }
  }

  // V60.3 — Aussi gate le max d'escapes selon plan
  const plan = await getEffectiveEscapePlan(session.user.id);
  if (plan.limits.maxEscapes !== undefined) {
    const count = await prisma.escape.count({
      where: { userId: session.user.id },
    });
    if (count >= plan.limits.maxEscapes) {
      throw new Error(
        plan.limits.maxEscapes === 0
          ? "Les escape games ne sont pas inclus dans ton plan. Souscris un abonnement."
          : `Limite atteinte (${plan.limits.maxEscapes} escapes max sur ton plan).`
      );
    }
  }

  // Genere un nouveau code unique
  let code = "";
  for (let i = 0; i < 10; i++) {
    code = generateEscapeCode();
    const existing = await prisma.escape.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) break;
  }

  // Cree l'escape puis copie les steps
  const created = await prisma.escape.create({
    data: {
      userId: session.user.id,
      code,
      title: source.title,
      description: source.description,
      coverImageUrl: source.coverImageUrl,
      theme: source.theme as unknown as object,
      maxTeamsCount: source.maxTeamsCount,
      timerMinutes: source.timerMinutes,
      hintCostPoints: source.hintCostPoints,
      finalMessage: source.finalMessage,
      // Reset flags library : le duplicata n'est PAS lui-meme dans la bibliotheque
      isLibrary: false,
      libraryIsPremium: false,
      status: "DRAFT",
    },
    select: { id: true },
  });

  // Copie chaque step
  for (const s of source.steps) {
    await prisma.escapeStep.create({
      data: {
        escapeId: created.id,
        order: s.order,
        type: s.type,
        title: s.title,
        body: s.body,
        imageUrl: s.imageUrl,
        audioUrl: s.audioUrl,
        expectedAnswer: s.expectedAnswer,
        options: s.options as unknown as object,
        hints: s.hints as unknown as object,
        points: s.points,
      },
    });
  }

  revalidatePath("/dashboard/escapes");
  redirect(`/dashboard/escapes/${created.id}/edit`);
}

