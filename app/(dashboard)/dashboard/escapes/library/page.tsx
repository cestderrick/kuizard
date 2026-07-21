import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { duplicateLibraryEscapeAction } from "@/lib/actions/escape";

export const metadata: Metadata = {
  title: "🗝️ Bibliotheque d'escapes",
};

export default async function EscapeLibraryPage() {
  const session = await auth();
  const isAuth = !!session?.user?.id;

  // Determiner si le user a un abo actif (pour dire "debloque" ou "premium")
  let hasActiveSub = false;
  if (isAuth) {
    const now = new Date();
    const [sub, gift] = await Promise.all([
      prisma.subscription.findFirst({
        where: {
          userId: session!.user!.id!,
          status: { in: ["active", "trialing"] },
        },
      }),
      prisma.grantedPlan.findFirst({
        where: {
          userId: session!.user!.id!,
          type: "subscription",
          revokedAt: null,
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      }),
    ]);
    hasActiveSub = !!(sub || gift);
  }

  const escapes = await prisma.escape.findMany({
    where: { isLibrary: true },
    orderBy: [{ libraryIsPremium: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      title: true,
      coverImageUrl: true,
      libraryDescription: true,
      libraryIsPremium: true,
      libraryTags: true,
      libraryLanguage: true,
      timerMinutes: true,
      hintCostPoints: true,
      _count: { select: { steps: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}>
          🗝️ Bibliotheque d&apos;escapes
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Scenarios prets a l&apos;emploi, cree par la team Kuizard.{" "}
          <strong>Duplique</strong> celui qui te plait dans ton compte pour le
          jouer / le personnaliser. Les scenarios gratuits sont marques{" "}
          <span className="text-green-700">Demo</span>, les autres sont
          reserves aux abonnes.
        </p>
      </header>

      {escapes.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center bg-white">
          <p className="text-lg mb-1">Aucun scenario disponible pour l&apos;instant</p>
          <p className="text-sm opacity-70">
            La bibliotheque se remplit progressivement. Reviens bientot !
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escapes.map((e) => {
            const canPlay = !e.libraryIsPremium || hasActiveSub;
            return (
              <li
                key={e.id}
                className="rounded-2xl border bg-white overflow-hidden flex flex-col"
              >
                {e.coverImageUrl && (
                  <img
                    src={e.coverImageUrl}
                    alt=""
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg leading-tight">
                      {e.title}
                    </h2>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                      style={
                        e.libraryIsPremium
                          ? {
                              backgroundColor: "rgba(85,35,187,0.12)",
                              color: "var(--color-violet-primary)",
                            }
                          : {
                              backgroundColor: "rgba(34,197,94,0.12)",
                              color: "#166534",
                            }
                      }
                    >
                      {e.libraryIsPremium ? "Premium" : "Demo"}
                    </span>
                  </div>

                  {e.libraryDescription && (
                    <p className="text-sm opacity-80 leading-relaxed">
                      {e.libraryDescription}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap text-xs">
                    <span className="rounded bg-zinc-100 px-2 py-0.5">
                      🧩 {e._count.steps} enigme{e._count.steps > 1 ? "s" : ""}
                    </span>
                    {e.timerMinutes && (
                      <span className="rounded bg-zinc-100 px-2 py-0.5">
                        ⏱ {e.timerMinutes} min
                      </span>
                    )}
                    {e.libraryLanguage && (
                      <span className="rounded bg-zinc-100 px-2 py-0.5">
                        {e.libraryLanguage}
                      </span>
                    )}
                  </div>

                  {e.libraryTags && e.libraryTags.length > 0 && (
                    <div className="flex gap-1 flex-wrap text-[11px] opacity-70">
                      {e.libraryTags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-3 flex justify-end">
                    {!isAuth ? (
                      <Link
                        href="/login?from=/dashboard/escapes/library"
                        className="text-sm font-bold rounded-lg px-4 py-2 hover:opacity-90"
                        style={{
                          backgroundColor: "var(--color-violet-primary)",
                          color: "white",
                        }}
                      >
                        Se connecter pour dupliquer
                      </Link>
                    ) : canPlay ? (
                      <form action={duplicateLibraryEscapeAction}>
                        <input type="hidden" name="sourceEscapeId" value={e.id} />
                        <button
                          type="submit"
                          className="text-sm font-bold rounded-lg px-4 py-2 hover:opacity-90"
                          style={{
                            backgroundColor: "var(--color-violet-primary)",
                            color: "white",
                          }}
                        >
                          📥 Dupliquer chez moi
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={`/tarifs?from=escape-library&escape=${encodeURIComponent(e.title)}`}
                        className="text-sm font-bold rounded-lg px-4 py-2 hover:opacity-90 border-2"
                        style={{
                          borderColor: "var(--color-violet-primary)",
                          color: "var(--color-violet-primary)",
                        }}
                      >
                        🔒 Voir les abonnements
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
