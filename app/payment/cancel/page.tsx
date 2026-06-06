import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Paiement annulé",
};

type SearchParams = Promise<{ quiz_id?: string }>;

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { quiz_id } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)]">
      <div className="max-w-md w-full rounded-3xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-10 text-center flex flex-col gap-5">
        <div className="text-6xl" aria-hidden>
          🪄
        </div>
        <h1 className="font-display text-2xl tracking-wide">
          Paiement annulé
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-90">
          Pas de souci, rien n'a été débité. Tu peux reprendre quand tu
          veux.
        </p>
        <div className="flex flex-col gap-2">
          {quiz_id && (
            <Button asChild>
              <Link href={`/dashboard/quizzes/${quiz_id}/upgrade`}>
                Reprendre le paiement
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/dashboard/quizzes">Mes quizz</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
