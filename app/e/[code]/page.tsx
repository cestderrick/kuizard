import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { EscapeJoinForm } from "@/components/escape/escape-join-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `🗝️ Rejoins l'escape ${code.toUpperCase()}`,
  };
}

export default async function EscapeJoinPage({ params }: Props) {
  const { code: codeRaw } = await params;
  const code = codeRaw.toUpperCase();

  const escape = await prisma.escape.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      coverImageUrl: true,
      status: true,
      timerMinutes: true,
      hintCostPoints: true,
      _count: { select: { steps: true, teams: true } },
    },
  });
  if (!escape) notFound();

  if (escape.status === "DRAFT" || escape.status === "ARCHIVED") {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-3">🚧</div>
        <h1 className="font-display text-2xl mb-2">Escape indisponible</h1>
        <p className="text-sm opacity-70">
          Cet escape n&apos;est pas accessible aux joueurs.
        </p>
      </div>
    );
  }
  // V60.4a — Pas d'etapes = injouable, message explicite
  if (escape._count.steps === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-3">🚧</div>
        <h1 className="font-display text-2xl mb-2">Escape en preparation</h1>
        <p className="text-sm opacity-70">
          L&apos;organisateur n&apos;a pas encore ajoute d&apos;etapes. Reviens plus tard.
        </p>
      </div>
    );
  }

  // Si le joueur a deja un cookie pour cet escape, on le redirige direct au jeu
  const cookieStore = await cookies();
  const teamCookie = cookieStore.get(`kz_escape_${escape.id}`)?.value;
  if (teamCookie) {
    const team = await prisma.escapeTeam.findFirst({
      where: { id: teamCookie, escapeId: escape.id },
      select: { id: true },
    });
    if (team) redirect(`/e/${escape.code}/play`);
  }

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-6">
      {escape.coverImageUrl && (
        <img
          src={escape.coverImageUrl}
          alt=""
          className="w-full rounded-2xl object-cover max-h-64"
        />
      )}

      <header className="text-center">
        <p className="text-xs opacity-60 font-mono mb-1">Code : {escape.code}</p>
        <h1 className="font-display text-3xl">{escape.title}</h1>
        {escape.description && (
          <p className="text-sm opacity-80 mt-2 leading-relaxed">
            {escape.description}
          </p>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border p-2 bg-white">
          <p className="font-bold text-lg">{escape._count.steps}</p>
          <p className="opacity-70">enigmes</p>
        </div>
        <div className="rounded-lg border p-2 bg-white">
          <p className="font-bold text-lg">
            {escape.timerMinutes ? `${escape.timerMinutes}min` : "∞"}
          </p>
          <p className="opacity-70">chrono</p>
        </div>
        <div className="rounded-lg border p-2 bg-white">
          <p className="font-bold text-lg">{escape._count.teams}</p>
          <p className="opacity-70">equipe{escape._count.teams > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-display text-lg mb-3">Rejoindre l&apos;escape</h2>
        <EscapeJoinForm escapeCode={escape.code} />
      </div>
    </div>
  );
}
