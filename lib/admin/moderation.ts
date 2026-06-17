// =============================================
// Helpers de modération admin
// =============================================
// Vérifications utilisées par le ban check au login + le gating.

import { prisma } from "@/lib/db";

/**
 * Retourne true si l'utilisateur est actuellement banni.
 * Conformément à la CGU §4 (Modération et suspension), un user banni n'a plus
 * accès au service. On l'empêche de se connecter et on lui affiche un message.
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { bannedAt: true },
  });
  return !!u?.bannedAt;
}

/**
 * Variante : check by email (utilisé dans authorize() de Credentials provider
 * où on n'a que l'email avant de générer la session).
 */
export async function isEmailBanned(email: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { bannedAt: true },
  });
  return !!u?.bannedAt;
}
