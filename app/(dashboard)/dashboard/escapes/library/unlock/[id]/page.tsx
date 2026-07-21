import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { EscapeUnlockButton } from "@/components/escape/escape-unlock-button";

export const metadata: Metadata = {
  title: "🔓 Debloquer un escape",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EscapeUnlockPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const source = await prisma.escape.findFirst({
    where: { id, isLibrary: true },
    select: {
      id: true,
      title: true,
      libraryDescription: true,
      libraryIsPremium: true,
      coverImageUrl: true,
      _count: { select: { steps: true } },
      timerMinutes: true,
    },
  });
  if (!source) notFound();

  // Plans one-shot disponibles
  const oneShotPlans = await prisma.planConfig.findMany({
    where: { isActive: true, type: "one_shot", priceCents: { gt: 0 } },
    orderBy: [{ displayOrder: "asc" }, { priceCents: "asc" }],
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link
        href="/dashboard/escapes/library"
        className="text-sm opacity-70 hover:opacity-100"
      >
        ← Retour a la bibliotheque
      </Link>

      <header className="text-center flex flex-col items-center gap-3">
        {source.coverImageUrl && (
          <img
            src={source.coverImageUrl}
            alt=""
            className="w-32 h-32 object-cover rounded-2xl shadow-md"
          />
        )}
        <h1 className="font-display text-3xl">🔓 Debloquer {source.title}</h1>
        {source.libraryDescription && (
          <p className="opacity-80 max-w-md">{source.libraryDescription}</p>
        )}
        <div className="flex gap-3 text-xs opacity-70">
          <span>🧩 {source._count.steps} etapes</span>
          {source.timerMinutes && <span>⏱ {source.timerMinutes} min</span>}
        </div>
      </header>

      <div className="rounded-2xl border bg-white p-5">
        <p className="text-sm mb-4">
          <strong>Deux options</strong> pour dupliquer ce scenario chez toi :
        </p>
        <div className="rounded-lg border-2 border-dashed border-violet-200 p-4 mb-4 text-sm bg-violet-50/30">
          <p className="font-bold mb-1">🌟 Option 1 : Abonnement</p>
          <p className="opacity-80">
            Debloque TOUS les scenarios premium + toutes les fonctionnalites
            avancees, tant que ton abonnement est actif.
          </p>
          <Link
            href="/tarifs#abonnements"
            className="inline-block mt-2 text-xs font-bold underline underline-offset-2"
            style={{ color: "var(--color-violet-primary)" }}
          >
            Voir les abonnements →
          </Link>
        </div>

        <p className="text-sm font-bold mb-3">
          💫 Option 2 : Debloquer uniquement ce scenario
        </p>
        {oneShotPlans.length === 0 ? (
          <p className="text-sm opacity-70 italic">
            Aucun plan one-shot disponible pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {oneShotPlans.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">
                    {p.isHighlighted && "⭐ "}
                    {p.name}
                  </p>
                  <p className="text-xs opacity-70">
                    {p.tagline ?? p.description ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl">
                    {(p.priceCents / 100).toFixed(2)}€
                  </span>
                  <EscapeUnlockButton
                    escapeLibraryId={source.id}
                    planSlug={p.slug}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
