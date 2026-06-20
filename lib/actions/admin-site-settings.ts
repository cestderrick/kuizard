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
