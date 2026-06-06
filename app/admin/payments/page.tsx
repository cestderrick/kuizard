import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatStripeAmount } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "Admin · Paiements",
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      _sum: { amountCents: true },
    }),
  ]);

  const totals = stats.reduce(
    (acc, s) => {
      acc[s.status] = {
        count: s._count,
        sumCents: s._sum.amountCents ?? 0,
      };
      return acc;
    },
    {} as Record<string, { count: number; sumCents: number }>
  );

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          💰 Paiements
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Historique des transactions Stripe (mode test ou prod selon ton .env)
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["succeeded", "pending", "failed", "refunded"] as const).map((s) => {
          const t = totals[s] ?? { count: 0, sumCents: 0 };
          return (
            <div
              key={s}
              className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-3"
            >
              <p className="text-[10px] uppercase tracking-wider opacity-60">
                {labelStatus(s)}
              </p>
              <p className="font-display text-2xl text-[var(--color-gold-light)]">
                {t.count}
              </p>
              <p className="text-xs opacity-70">{formatStripeAmount(t.sumCents)}</p>
            </div>
          );
        })}
      </section>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Stripe ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center opacity-70"
                  >
                    Aucun paiement.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-[rgba(167,139,250,0.08)]"
                  >
                    <td className="px-4 py-2.5 text-xs opacity-70 whitespace-nowrap">
                      {fmt(p.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <div>{p.user?.name ?? "—"}</div>
                      <div className="opacity-60 font-mono">
                        {p.user?.email ?? "(supprimé)"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{p.planSlug ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-display text-[var(--color-gold-light)]">
                      {formatStripeAmount(p.amountCents)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${badgeClass(p.status)}`}
                      >
                        {labelStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono opacity-60 truncate max-w-[180px]">
                      {p.stripePaymentIntentId ?? p.stripeSessionId ?? "—"}
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

function labelStatus(s: string): string {
  return (
    { succeeded: "Réussi", pending: "En attente", failed: "Échec", refunded: "Remboursé" }[s] ??
    s
  );
}
function badgeClass(s: string): string {
  return (
    {
      succeeded: "bg-green-500/20 text-green-200 border border-green-500/40",
      pending: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
      failed: "bg-red-500/20 text-red-200 border border-red-500/40",
      refunded: "bg-blue-500/20 text-blue-200 border border-blue-500/40",
    }[s] ?? "bg-zinc-500/20 text-zinc-300"
  );
}
