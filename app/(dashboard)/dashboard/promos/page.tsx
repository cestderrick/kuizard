import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PromoRedeemForm } from "@/components/promos/redeem-form";

export const metadata: Metadata = {
  title: "Mes codes promos",
};

export default async function MyPromosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Historique des codes promos utilisés par ce user (via Payment.promoCodeId)
  const [usedPayments, myQuizzes] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId: session.user.id,
        status: "succeeded",
        promoCodeId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        promoCode: { select: { code: true, description: true } },
      },
    }),
    prisma.quiz.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, code: true, isPaid: true },
    }),
  ]);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          🎟️ Codes promos
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Mes codes promos
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-xl">
          Tu as reçu un code ? Saisis-le ci-dessous. Selon son type, il te
          donnera une réduction à appliquer au prochain achat, ou il
          débloquera directement un quizz (code cadeau).
        </p>
      </header>

      {/* Saisie d'un code */}
      <section className="rounded-2xl border-2 border-[var(--color-violet-primary)] bg-[rgba(85,35,187,0.04)] p-5">
        <PromoRedeemForm myQuizzes={myQuizzes} />
      </section>

      {/* Explication des types de codes */}
      <section className="rounded-2xl bg-zinc-50 border p-5 text-sm">
        <h2 className="font-display text-base tracking-wide mb-2">
          🤔 Quels types de codes existent ?
        </h2>
        <ul className="flex flex-col gap-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Code réduction</strong> :
            applique un % de remise sur un prochain paiement de quizz
            (saisis-le sur la page de paiement Stripe).
          </li>
          <li>
            <strong className="text-foreground">Code cadeau</strong> :
            débloque directement un quizz avec un plan complet, sans rien
            payer. Idéal si quelqu'un t'a offert un quizz.
          </li>
        </ul>
      </section>

      {/* Historique */}
      <section>
        <h2 className="font-display text-lg tracking-wide mb-3">
          📜 Mon historique
        </h2>
        {usedPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aucun code utilisé pour l'instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usedPayments.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border bg-white p-3 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-mono font-semibold">
                    {p.promoCode?.code ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(p.createdAt)} · Plan {p.planSlug ?? "—"}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-800 whitespace-nowrap">
                  ✓ Utilisé
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
