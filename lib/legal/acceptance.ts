// =============================================
// Helpers pour enregistrer et vérifier l'acceptation des CGU/CGV
// =============================================

import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/terms-version";

/**
 * Enregistre une acceptation explicite des CGU/CGV pour un utilisateur.
 * - Crée une ligne TermsAcceptance (historique pour preuve juridique)
 * - Met à jour User.lastAcceptedTermsVersion (raccourci pour query rapide)
 *
 * À appeler depuis :
 *  - signupAction (à la création du compte)
 *  - /accept-terms (après bump de CURRENT_TERMS_VERSION)
 */
export async function recordTermsAcceptance(userId: string): Promise<void> {
  // Récupère IP + User-Agent depuis les headers de la requête courante
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    // Cloudflare > X-Forwarded-For > remote
    ipAddress =
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent") ?? null;
  } catch {
    // si appelé hors d'une requête HTTP, on continue sans IP
  }

  await prisma.$transaction([
    prisma.termsAcceptance.create({
      data: {
        userId,
        termsVersion: CURRENT_TERMS_VERSION,
        ipAddress,
        userAgent,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { lastAcceptedTermsVersion: CURRENT_TERMS_VERSION },
    }),
  ]);
}

/**
 * Vérifie si un utilisateur doit ré-accepter les CGU/CGV (version dépassée).
 * Retourne true si l'utilisateur doit aller sur /accept-terms.
 */
export function needsTermsReacceptance(
  lastAcceptedTermsVersion: string | null | undefined
): boolean {
  if (!lastAcceptedTermsVersion) return true;
  // Comparaison string sur format YYYY-MM-DD : version "2026-06-11" < "2026-07-01"
  // Si on passe à un format plus complexe (ex: 2026-06-11.b), il faudra adapter.
  return lastAcceptedTermsVersion < CURRENT_TERMS_VERSION;
}
