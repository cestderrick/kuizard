import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SiteFooterNight } from "@/components/legal/site-footer-night";

export const metadata: Metadata = {
  title: "Paiement réussi",
};

type SearchParams = Promise<{ session_id?: string }>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id } = await searchParams;

  // Récupère le payment lié à la session, puis le quizz en deux étapes
  // (Payment n'a pas de relation directe vers Quiz dans le schéma — on
  // garde le quizId nu pour simplifier et éviter les cascades non voulues).
  let quizCode: string | null = null;
  if (session_id) {
    const payment = await prisma.payment
      .findUnique({
        where: { stripeSessionId: session_id },
        select: { quizId: true },
      })
      .catch(() => null);

    if (payment?.quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: payment.quizId },
        select: { code: true },
      });
      quizCode = quiz?.code ?? null;
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-night)] text-[var(--color-lavender)]">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-10 text-center flex flex-col gap-5">
        <div className="text-7xl" aria-hidden>
          ✨
        </div>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-gold-light)]">
          Paiement confirmé !
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-90">
          Merci ! Ton quizz est maintenant débloqué avec toutes les options
          de ton plan. La magie peut opérer 🎩
        </p>
        <div className="flex flex-col gap-2">
          {quizCode ? (
            <Button asChild>
              <Link href={`/q/${quizCode}`}>
                Voir mon quizz
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/dashboard/quizzes">Mes quizz</Link>
          </Button>
        </div>
        <p className="text-xs opacity-60">
          Tu recevras une facture par email d'ici quelques minutes.
        </p>
        </div>
      </div>
      <SiteFooterNight />
    </main>
  );
}
