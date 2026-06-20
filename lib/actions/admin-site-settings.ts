"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { setSetting, SETTING_KEYS } from "@/lib/site-settings";

export type SiteSettingsState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// On valide les URLs vidéos. Vide = on supprime la setting (retour au "non
// configuré"). Sinon URL HTTP/HTTPS valide.
const videoUrlSchema = z.union([
  z.literal(""),
  z.string().url("URL invalide. Format attendu : https://..."),
]);

const schema = z.object({
  videoIntro: videoUrlSchema,
  videoCreation: videoUrlSchema,
  videoJoueur: videoUrlSchema,
});

export async function updateHomeVideosAction(
  _prev: SiteSettingsState,
  formData: FormData
): Promise<SiteSettingsState> {
  const { user } = await requireAdmin();

  const parsed = schema.safeParse({
    videoIntro: formData.get("videoIntro") ?? "",
    videoCreation: formData.get("videoCreation") ?? "",
    videoJoueur: formData.get("videoJoueur") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les URLs en erreur.",
    };
  }

  const { videoIntro, videoCreation, videoJoueur } = parsed.data;
  await Promise.all([
    setSetting(SETTING_KEYS.videoIntro, videoIntro || null, user.id),
    setSetting(SETTING_KEYS.videoCreation, videoCreation || null, user.id),
    setSetting(SETTING_KEYS.videoJoueur, videoJoueur || null, user.id),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/site-settings");

  return { ok: true, message: "Vidéos mises à jour." };
}

// =============================================
// V47.1 — Update du quiz démo public
// =============================================
// L'admin choisit le code d'un quiz qui devient accessible sans compte
// via l'URL /demo, parfait pour partager en démo sur les réseaux sociaux.

export type DemoQuizState = SiteSettingsState;

export async function updateDemoQuizAction(
  _prev: DemoQuizState,
  formData: FormData
): Promise<DemoQuizState> {
  const { user } = await requireAdmin();

  const codeRaw = formData.get("demoQuizCode");
  const code = typeof codeRaw === "string" ? codeRaw.trim() : "";

  // Vide = on retire le quiz démo
  if (!code) {
    await setSetting(SETTING_KEYS.demoQuizCode, null, user.id);
    return { ok: true, message: "Quiz démo retiré." };
  }

  // Vérification : le quiz existe et est PUBLISHED (jouable)
  const { prisma } = await import("@/lib/db");
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    select: { id: true, status: true, title: true },
  });
  if (!quiz) {
    return {
      ok: false,
      message: `Aucun quiz trouvé avec le code « ${code} ».`,
    };
  }
  if (quiz.status !== "PUBLISHED" && quiz.status !== "RUNNING") {
    return {
      ok: false,
      message: `Le quiz « ${quiz.title} » est en statut ${quiz.status}. Il doit être PUBLISHED pour servir de démo publique.`,
    };
  }

  await setSetting(SETTING_KEYS.demoQuizCode, code, user.id);
  return { ok: true, message: `Quiz démo défini : « ${quiz.title} ».` };
}
