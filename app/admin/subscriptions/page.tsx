import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Abonnements",
};

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true, accountType: true } },
    },
  });

  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "short",
        }).format(d)
      : "—";

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🔁 Abonnements
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Vue read-only. Les modifs (cancel, etc.) passent par le dashboard
          Stripe pour V1.
        </p>
      </header>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Prochain renouvellement</th>
                <th className="text-left px-4 py-3">Cancel à la fin ?</th>
                <th className="text-left px-4 py-3">Stripe ID</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center opacity-70"
                  >
                    Aucun abonnement actif.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-[rgba(167,139,250,0.08)]"
                  >
                    <td className="px-4 py-2.5 text-xs">
                      <div>{s.user.name ?? "—"}</div>
                      <div className="opacity-60 font-mono">{s.user.email}</div>
                    </td>
                    <td className="px-4 py-2.5">{s.planSlug}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${
                          s.status === "active"
                            ? "bg-green-500/20 text-green-200 border border-green-500/40"
                            : s.status === "past_due"
                            ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                            : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/40"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {fmt(s.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {s.cancelAtPeriodEnd ? "⚠️ oui" : "non"}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono opacity-60 truncate max-w-[180px]">
                      {s.stripeSubscriptionId ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
