"use server";

// =============================================
// V60.3 — Escape play : actions publiques joueur
// =============================================
// Pas d'auth requise (les joueurs jouent sans compte). L'equipe est identifiee
// par un cookie kz_escape_<escapeId> qui contient le teamId.

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isEscapeAnswerCorrect } from "@/lib/quiz/escape-answer";

const COOKIE_PREFIX = "kz_escape_";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export type EscapePlayState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// -----------------------------------------------------
// JOIN — cree une equipe, pose le cookie, redirige vers le jeu
// -----------------------------------------------------

const joinSchema = z.object({
  escapeCode: z.string().min(3).max(20),
  teamName: z.string().min(2, "Nom d'equipe trop court.").max(50),
  playerNames: z.string().max(500).optional(),
});

export async function joinEscapeAction(
  _prev: EscapePlayState,
  formData: FormData
): Promise<EscapePlayState> {
  const parsed = joinSchema.safeParse({
    escapeCode: formData.get("escapeCode"),
    teamName: formData.get("teamName"),
    playerNames: formData.get("playerNames") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Verifie les champs.",
    };
  }

  const code = parsed.data.escapeCode.toUpperCase().trim();
  const escape = await prisma.escape.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      status: true,
      maxTeamsCount: true,
      _count: { select: { teams: true } },
    },
  });
  if (!escape) {
    return { ok: false, message: "Escape introuvable." };
  }
  // V60.4a — Simplification : un escape en DRAFT est un brouillon (pas
  // jouable), ARCHIVED est cache. Tout le reste (RUNNING, FINISHED) est
  // accessible : FINISHED sert juste a marquer visuellement dans l'admin
  // qu'il est termine, mais on laisse quand meme les gens jouer.
  if (escape.status === "DRAFT" || escape.status === "ARCHIVED") {
    return { ok: false, message: "Cet escape n'est pas encore accessible." };
  }
  if (
    escape.maxTeamsCount &&
    escape._count.teams >= escape.maxTeamsCount
  ) {
    return { ok: false, message: "Nombre max d'equipes atteint." };
  }

  // Parse playerNames : format libre (separe par virgule / nouvelle ligne)
  const playerNames = (parsed.data.playerNames ?? "")
    .split(/[,\n]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n.length <= 40)
    .slice(0, 20);

  const team = await prisma.escapeTeam.create({
    data: {
      escapeId: escape.id,
      name: parsed.data.teamName.trim(),
      playerNames: playerNames as unknown as object,
      currentStepOrder: 1,
    },
    select: { id: true },
  });

  // Cookie session (expire 30 jours)
  const cookieStore = await cookies();
  cookieStore.set(`${COOKIE_PREFIX}${escape.id}`, team.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  // V60.4a — Auto-passage a RUNNING au premier join (peu importe l'ancien status)
  // pour poser startedAt et servir de t0 aux chronos.
  if (!escape.status || escape.status === "DRAFT") {
    await prisma.escape.update({
      where: { id: escape.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });
  }

  revalidatePath(`/e/${escape.code}`);
  redirect(`/e/${escape.code}/play`);
}

// -----------------------------------------------------
// SUBMIT ANSWER — verifie, avance si correct, ajoute a l'historique
// -----------------------------------------------------

const submitSchema = z.object({
  escapeId: z.string().min(1),
  stepId: z.string().min(1),
  userAnswer: z.string().max(500).optional(),
  selectedIndex: z.coerce.number().int().optional(),
});

export type SubmitEscapeAnswerState = {
  ok: boolean;
  correct?: boolean;
  message?: string;
  finished?: boolean;
};

export async function submitEscapeAnswerAction(
  _prev: SubmitEscapeAnswerState,
  formData: FormData
): Promise<SubmitEscapeAnswerState> {
  const parsed = submitSchema.safeParse({
    escapeId: formData.get("escapeId"),
    stepId: formData.get("stepId"),
    userAnswer: formData.get("userAnswer") ?? "",
    selectedIndex: formData.get("selectedIndex") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Reponse invalide." };
  }
  const { escapeId, stepId, userAnswer, selectedIndex } = parsed.data;

  // Auth cookie
  const cookieStore = await cookies();
  const teamId = cookieStore.get(`${COOKIE_PREFIX}${escapeId}`)?.value;
  if (!teamId) {
    return { ok: false, message: "Session equipe expiree, rejoins l'escape." };
  }

  const team = await prisma.escapeTeam.findFirst({
    where: { id: teamId, escapeId },
    select: {
      id: true,
      currentStepOrder: true,
      score: true,
      attempts: true,
      finishedAt: true,
    },
  });
  if (!team) {
    return { ok: false, message: "Equipe introuvable." };
  }
  if (team.finishedAt) {
    return { ok: false, message: "Escape deja termine par ton equipe." };
  }

  const step = await prisma.escapeStep.findFirst({
    where: { id: stepId, escapeId },
    select: {
      id: true,
      order: true,
      type: true,
      expectedAnswer: true,
      options: true,
      points: true,
    },
  });
  if (!step) {
    return { ok: false, message: "Etape introuvable." };
  }

  // Verifie que l'equipe est bien SUR cette etape (pas avance en tricherie)
  if (step.order !== team.currentStepOrder) {
    return { ok: false, message: "Ce n'est pas l'etape en cours." };
  }

  const correct = isEscapeAnswerCorrect({
    stepType: step.type,
    expectedAnswer: step.expectedAnswer,
    options: step.options,
    userAnswer: userAnswer ?? "",
    selectedIndex:
      typeof selectedIndex === "number" ? selectedIndex : null,
  });

  // Historique attempts
  const attempts = (team.attempts as Record<string, unknown[]>) ?? {};
  const stepAttempts = Array.isArray(attempts[step.id])
    ? (attempts[step.id] as unknown[])
    : [];
  stepAttempts.push({
    at: new Date().toISOString(),
    answer: userAnswer ?? "",
    selectedIndex: selectedIndex ?? null,
    correct,
  });
  attempts[step.id] = stepAttempts;

  if (correct) {
    // Cherche l'etape suivante
    const nextStep = await prisma.escapeStep.findFirst({
      where: { escapeId, order: { gt: step.order } },
      orderBy: { order: "asc" },
      select: { order: true },
    });
    const nextOrder = nextStep?.order ?? step.order + 1;
    const finished = !nextStep;

    await prisma.escapeTeam.update({
      where: { id: team.id },
      data: {
        currentStepOrder: nextOrder,
        score: team.score + step.points,
        attempts: attempts as unknown as object,
        finishedAt: finished ? new Date() : undefined,
      },
    });

    revalidatePath(`/e/${escapeId}/play`);
    return {
      ok: true,
      correct: true,
      finished,
      message: finished
        ? "🏆 Bravo, escape termine !"
        : `+${step.points} pts — Enigme suivante !`,
    };
  }

  // Reponse incorrecte : on garde l'etape courante, on trace juste l'attempt
  await prisma.escapeTeam.update({
    where: { id: team.id },
    data: { attempts: attempts as unknown as object },
  });
  return { ok: true, correct: false, message: "Mauvaise reponse, reessaie !" };
}

// -----------------------------------------------------
// UNLOCK HINT — deverrouille un indice, deduit le cout
// -----------------------------------------------------

const unlockSchema = z.object({
  escapeId: z.string().min(1),
  stepId: z.string().min(1),
});

export type UnlockHintState = {
  ok: boolean;
  message?: string;
  hint?: string;
  hintIndex?: number;
  totalHints?: number;
};

export async function unlockHintAction(
  _prev: UnlockHintState,
  formData: FormData
): Promise<UnlockHintState> {
  const parsed = unlockSchema.safeParse({
    escapeId: formData.get("escapeId"),
    stepId: formData.get("stepId"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Parametres invalides." };
  }
  const { escapeId, stepId } = parsed.data;

  const cookieStore = await cookies();
  const teamId = cookieStore.get(`${COOKIE_PREFIX}${escapeId}`)?.value;
  if (!teamId) {
    return { ok: false, message: "Session expiree." };
  }

  const [escape, team, step] = await Promise.all([
    prisma.escape.findUnique({
      where: { id: escapeId },
      select: { hintCostPoints: true },
    }),
    prisma.escapeTeam.findFirst({
      where: { id: teamId, escapeId },
      select: {
        id: true,
        score: true,
        hintsUsed: true,
        usedHints: true,
        finishedAt: true,
      },
    }),
    prisma.escapeStep.findFirst({
      where: { id: stepId, escapeId },
      select: { id: true, hints: true },
    }),
  ]);

  if (!escape || !team || !step) {
    return { ok: false, message: "Introuvable." };
  }
  if (team.finishedAt) {
    return { ok: false, message: "Escape termine." };
  }

  const allHints = Array.isArray(step.hints)
    ? (step.hints as string[]).filter((h) => typeof h === "string")
    : [];
  if (allHints.length === 0) {
    return { ok: false, message: "Aucun indice sur cette etape." };
  }

  const usedHints = (team.usedHints as Record<string, number[]>) ?? {};
  const already = Array.isArray(usedHints[step.id]) ? usedHints[step.id] : [];
  const nextIndex = already.length;
  if (nextIndex >= allHints.length) {
    return { ok: false, message: "Tous les indices ont deja ete deverrouilles." };
  }

  const hint = allHints[nextIndex];
  usedHints[step.id] = [...already, nextIndex];

  await prisma.escapeTeam.update({
    where: { id: team.id },
    data: {
      score: team.score - escape.hintCostPoints,
      hintsUsed: team.hintsUsed + 1,
      usedHints: usedHints as unknown as object,
    },
  });

  revalidatePath(`/e/${escapeId}/play`);
  return {
    ok: true,
    hint,
    hintIndex: nextIndex,
    totalHints: allHints.length,
    message: `Indice deverrouille (-${escape.hintCostPoints} pts).`,
  };
}
