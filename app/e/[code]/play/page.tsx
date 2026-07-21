import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { EscapePlayer } from "@/components/escape/escape-player";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = {
  title: "🗝️ Escape en cours",
};

export default async function EscapePlayPage({ params }: Props) {
  const { code: codeRaw } = await params;
  const code = codeRaw.toUpperCase();

  const escape = await prisma.escape.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      timerMinutes: true,
      hintCostPoints: true,
      startedAt: true,
      steps: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          title: true,
          body: true,
          imageUrl: true,
          audioUrl: true,
          options: true,
          hints: true,
          points: true,
        },
      },
    },
  });
  if (!escape) notFound();

  const cookieStore = await cookies();
  const teamCookie = cookieStore.get(`kz_escape_${escape.id}`)?.value;
  if (!teamCookie) {
    // Pas connecte -> retour au join
    redirect(`/e/${escape.code}`);
  }

  const team = await prisma.escapeTeam.findFirst({
    where: { id: teamCookie, escapeId: escape.id },
    select: {
      id: true,
      name: true,
      score: true,
      hintsUsed: true,
      usedHints: true,
      currentStepOrder: true,
      finishedAt: true,
      startedAt: true,
    },
  });
  if (!team) redirect(`/e/${escape.code}`);

  // Etape courante
  const currentStep = escape.steps.find((s) => s.order === team.currentStepOrder) ?? null;

  // Options pour un CHOICE : on cache isCorrect
  const publicOptions = currentStep && Array.isArray(currentStep.options)
    ? (currentStep.options as { label: string; isCorrect?: boolean }[])
        .filter((o) => typeof o === "object" && typeof o.label === "string")
        .map((o) => ({ label: o.label }))
    : [];

  // Indices deja debloques sur l'etape courante
  const usedHints = (team.usedHints as Record<string, number[]>) ?? {};
  const stepHints = currentStep && Array.isArray(currentStep.hints)
    ? (currentStep.hints as string[]).filter((h) => typeof h === "string")
    : [];
  const unlockedIndices = currentStep && Array.isArray(usedHints[currentStep.id])
    ? usedHints[currentStep.id]
    : [];
  const unlockedHintsCurrent = unlockedIndices
    .filter((i) => i >= 0 && i < stepHints.length)
    .map((i) => stepHints[i]);

  return (
    <div className="min-h-screen py-6 px-3 bg-gradient-to-b from-violet-50 to-white">
      <EscapePlayer
        escapeId={escape.id}
        escapeCode={escape.code}
        escapeTitle={escape.title}
        hintCostPoints={escape.hintCostPoints}
        timerMinutes={escape.timerMinutes}
        startedAtIso={
          team.startedAt ? team.startedAt.toISOString() : escape.startedAt?.toISOString() ?? null
        }
        totalSteps={escape.steps.length}
        currentStep={
          currentStep
            ? {
                id: currentStep.id,
                order: currentStep.order,
                type: currentStep.type,
                title: currentStep.title,
                body: currentStep.body,
                imageUrl: currentStep.imageUrl,
                audioUrl: currentStep.audioUrl,
                options: publicOptions,
                hintsCount: stepHints.length,
                points: currentStep.points,
              }
            : null
        }
        team={{
          id: team.id,
          name: team.name,
          score: team.score,
          hintsUsed: team.hintsUsed,
          currentStepOrder: team.currentStepOrder,
          finishedAt: team.finishedAt ? team.finishedAt.toISOString() : null,
          unlockedHintsCurrent,
        }}
      />
    </div>
  );
}
