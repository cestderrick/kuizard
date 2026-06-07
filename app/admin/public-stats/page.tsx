import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PublicStatsConfigForm } from "@/components/admin/public-stats-form";

export const metadata: Metadata = {
  title: "Admin · Stats publiques",
};

export default async function AdminPublicStatsPage() {
  await requireAdmin();

  const config = await prisma.publicStatsConfig.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          📊 Stats publiques
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Configure quelles statistiques sont affichées publiquement (home
          page + dashboard utilisateur). Si désactivé, rien n'apparaît.
        </p>
      </header>

      <PublicStatsConfigForm
        defaults={
          config ?? {
            enabled: false,
            showUsers: true,
            showQuizzes: true,
            showQuestions: false,
            showParticipations: true,
            showAvgScore: false,
            customTitle: null,
            customSubtitle: null,
          }
        }
      />
    </div>
  );
}
