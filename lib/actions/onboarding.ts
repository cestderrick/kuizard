"use server";

// =============================================
// V35 — Action : marquer l'onboarding comme complété/skippé
// =============================================

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function completeOnboardingAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompletedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
