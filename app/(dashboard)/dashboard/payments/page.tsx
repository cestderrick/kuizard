import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatStripeAmount } from "@/lib/stripe/client";
import { CustomerPortalButton } from "@/components/payment/customer-portal-button";

export const metadata: Metadata = {
  title: "Mes paiements",
};

export default async function MyPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [payments, stats, hasStripeCustomer] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        promoCode: { select: { code: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { userId, status: "succeeded" },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.user
      .findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      })
      .then((u) => !!u?.stripeCustomerId),
  ]);

  // Pour chaque payment, on retrouve le code du quizz lié (lookup en batch)
  const quizIds = Array.from(
    new Set(payments.map((p) => p.quizId).filter((id): id is string => !!id))
  );
  const quizzes = quizIds.length
    ? await prisma.quiz.findMany({
        where: { id: { in: quizIds } },
        select: { id: true, code: true, title: true },
      })
    : [];
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
            💳 Paiements
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Mes paiements
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl">
            Historique des achats de quizz et abonnements.
          </p>
        </div>
        {hasStripeCustomer && <CustomerPortalButton />}
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border p-5">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-1">
            Total dépensé
          </p>
          <p
            className="font-display text-3xl font-bold"
            style={{ color: "var(--color-violet-primary)" }}
          >
            {formatStripeAmount(stats._sum.amountCents ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border p-5">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-1">
            Achats réussis
          </p>
          <p
            className="font-display text-3xl font-bold"
            style={{ color: "var(--color-violet-primary)" }}
          >
            {stats._count}
          </p>
        </div>
        <div className="rounded-2xl bg-white border p-5">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground mb-1">
            Toutes transactions
          </p>
          <p
            className="font-display text-3xl font-bold"
            style={{ color: "var(--color-violet-primary)" }}
          >
            {payments.length}
          </p>
        </div>
      </section>

      {/* Liste */}
      <section>
        <h2 className="font-display text-lg tracking-wide mb-3">Historique</h2>
        {payments.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-5xl mb-3">🧾</p>
            <p className="text-muted-foreground">
              Tu n'as encore fait aucun achat.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Quizz</th>
                    <th className="text-left px-4 py-3">Plan</th>
                    <th className="text-left px-4 py-3">Code</th>
                    <th className="text-right px-4 py-3">Montant</th>
                    <th className="text-left px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const quiz = p.quizId ? quizMap.get(p.quizId) : null;
                    return (
                      <tr
                        key={p.id}
                        className="border-t hover:bg-zinc-50"
                      >
                        <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                          {fmt(p.createdAt)}
                        </td>
                        <td className="px-4 py-2.5">
                          {quiz ? (
                            <Link
                              href={`/dashboard/quizzes/${quiz.id}/edit`}
                              className="hover:underline"
                            >
                              {quiz.title}
                            </Link>
                          ) : (
                            <span className="opacity-50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {p.planSlug ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono">
                          {p.promoCode?.code ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">
                          {p.amountCents === 0
                            ? "Offert"
                            : formatStripeAmount(p.amountCents)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`text-xs px-2 py-1 rounded-md ${badge(p.status)}`}
                          >
                            {label(p.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground italic">
        Pour télécharger tes factures, utilise le portail Stripe (bouton
        ci-dessus).
      </p>
    </div>
  );
}

function label(s: string) {
  return (
    { succeeded: "Réussi", pending: "En attente", failed: "Échec", refunded: "Remboursé" }[s] ??
    s
  );
}
function badge(s: string) {
  return (
    {
      succeeded: "bg-green-100 text-green-800",
      pending: "bg-amber-100 text-amber-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-blue-100 text-blue-800",
    }[s] ?? "bg-zinc-100 text-zinc-700"
  );
}
