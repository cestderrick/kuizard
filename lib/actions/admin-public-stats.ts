"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type PublicStatsState = { ok: boolean; message?: string };

function checkbox(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1";
}

export async function updatePublicStatsConfigAction(
  _prev: PublicStatsState,
  formData: FormData
): Promise<PublicStatsState> {
  await requireAdmin();

  const data = {
    enabled: checkbox(formData.get("enabled")),
    showUsers: checkbox(formData.get("showUsers")),
    showQuizzes: checkbox(formData.get("showQuizzes")),
    showQuestions: checkbox(formData.get("showQuestions")),
    showParticipations: checkbox(formData.get("showParticipations")),
    showAvgScore: checkbox(formData.get("showAvgScore")),
    customTitle: (formData.get("customTitle") as string) || null,
    customSubtitle: (formData.get("customSubtitle") as string) || null,
  };

  await prisma.publicStatsConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/admin/public-stats");
  revalidatePath("/");
  revalidatePath("/dashboard");

  return { ok: true, message: "Configuration enregistrée." };
}
