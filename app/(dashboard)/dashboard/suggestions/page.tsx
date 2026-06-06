import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mes suggestions",
};

export default async function MySuggestionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // On retourne les suggestions liées au userId connecté.
  // Note : les suggestions envoyées sans login (mais avec le même email) ne
  // sont pas remontées ici — on ne croise pas l'email pour éviter des fuites.
  const suggestions = await prisma.suggestion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
            💬 Boîte à idées
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Mes suggestions
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl">
            Voici les idées, bugs et retours que tu nous as envoyés.
          </p>
        </div>
        <Button
          asChild
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          <Link href="/suggestion">+ Nouvelle suggestion</Link>
        </Button>
      </header>

      {suggestions.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="text-5xl mb-3">💡</p>
          <p className="text-muted-foreground mb-4">
            Tu n'as pas encore envoyé de suggestion.
          </p>
          <Button asChild variant="outline">
            <Link href="/suggestion">Partager une idée</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border bg-white p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(85,35,187,0.1)] text-[var(--color-violet-primary)] uppercase tracking-wide font-semibold">
                    {s.category ?? "other"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fmt(s.createdAt)}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md ${statusBadge(s.status)}`}
                >
                  {statusLabel(s.status)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {s.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusLabel(s: string): string {
  return (
    {
      new: "📬 Reçue",
      seen: "👀 Vue par l'équipe",
      done: "✓ Traitée",
      wont_fix: "Pas retenue",
    }[s] ?? s
  );
}
function statusBadge(s: string): string {
  return (
    {
      new: "bg-amber-100 text-amber-800",
      seen: "bg-blue-100 text-blue-800",
      done: "bg-green-100 text-green-800",
      wont_fix: "bg-zinc-100 text-zinc-700",
    }[s] ?? "bg-zinc-100 text-zinc-700"
  );
}
