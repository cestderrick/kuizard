// =============================================
// Helper — Garde côté serveur pour les pages /admin
// =============================================
// On lit le rôle depuis la BDD à chaque requête (pas de cache JWT). Plus de
// query SQL mais permet de révoquer les droits admin instantanément.

import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?from=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // 404 plutôt que 403 pour ne pas révéler l'existence de la zone admin
  if (!user || user.role !== "ADMIN") {
    notFound();
  }

  return { session, user };
}
