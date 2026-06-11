"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { recordTermsAcceptance } from "@/lib/legal/acceptance";

export type AcceptTermsState = {
  ok: boolean;
  message?: string;
};

/**
 * Server Action — enregistre l'acceptation explicite des CGU/CGV par un
 * utilisateur déjà connecté (cas du bump de version ou première acceptation
 * d'un compte créé avant l'introduction du système).
 *
 * Au succès : redirige vers `next` (si valide) ou `/dashboard`.
 */
export async function acceptTermsAction(
  _prevState: AcceptTermsState,
  formData: FormData
): Promise<AcceptTermsState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Tu dois être connecté pour accepter." };
  }

  const accepted = formData.get("accept") === "on";
  if (!accepted) {
    return {
      ok: false,
      message: "Tu dois cocher la case pour accepter les CGU/CGV.",
    };
  }

  try {
    await recordTermsAcceptance(session.user.id);
  } catch (err) {
    console.error("[accept-terms] failed:", err);
    return {
      ok: false,
      message: "Une erreur est survenue. Réessaie dans quelques instants.",
    };
  }

  const next = formData.get("next");
  const safeNext =
    typeof next === "string" && next.startsWith("/") ? next : "/dashboard";
  redirect(safeNext);
}
