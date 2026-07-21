import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createEscapeAction } from "@/lib/actions/escape";

export const metadata: Metadata = {
  title: "Mes escapes",
};

export default async function EscapesListPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const escapes = await prisma.escape.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      createdAt: true,
      _count: { select: { steps: true, teams: true } },
    },
  });

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(d);

  const statusLabel = (s: string) =>
    ({ DRAFT: "Brouillon", PUBLISHED: "Publie", RUNNING: "En cours", FINISHED: "Termine", ARCHIVED: "Archive" }[s] ?? s);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide">🗝️ Mes escapes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cree un escape game digital multi-equipes : enigmes sequentielles,
            chrono, indices deblocables.
          </p>
        </div>
        <form action={createEscapeAction}>
          <input
            type="text"
            name="title"
            required
            minLength={2}
            maxLength={100}
            placeholder="Titre du nouvel escape"
            className="border border-input bg-background rounded-md h-9 px-3 text-sm mr-2"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90"
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            + Creer
          </button>
        </form>
      </header>

      {escapes.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-lg mb-2">Aucun escape pour l&apos;instant</p>
          <p className="text-sm text-muted-foreground">
            Saisis un titre ci-dessus pour creer ton premier escape game.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Titre</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Etapes</th>
                <th className="text-right px-4 py-3">Equipes</th>
                <th className="text-left px-4 py-3">Cree le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {escapes.map((e) => (
                <tr key={e.id} className="border-t hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-mono text-xs uppercase">
                    {e.code}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{e.title}</td>
                  <td className="px-4 py-2.5 text-xs">{statusLabel(e.status)}</td>
                  <td className="px-4 py-2.5 text-right">{e._count.steps}</td>
                  <td className="px-4 py-2.5 text-right">{e._count.teams}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {fmtDate(e.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/dashboard/escapes/${e.id}/edit`}
                      className="text-xs font-bold underline underline-offset-2"
                      style={{ color: "var(--color-violet-primary)" }}
                    >
                      Editer →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
