import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mes messages",
};

export default async function MyMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      subject: true,
      status: true,
      lastMessageAt: true,
      unreadByUser: true,
      _count: { select: { messages: true } },
    },
  });

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
            ✉️ Messagerie
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide" style={{ color: "var(--color-violet-deep)" }}>
            Mes échanges avec l'équipe
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl">
            Pose tes questions, signale un bug, partage une idée. On te
            répond dans la journée (jours ouvrés).
          </p>
        </div>
        <Button
          asChild
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          <Link href="/dashboard/messages/new">+ Nouveau message</Link>
        </Button>
      </header>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="text-5xl mb-3">📬</p>
          <p className="text-muted-foreground mb-4">
            Tu n'as pas encore de conversation.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/messages/new">Démarrer un échange</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {c.unreadByUser && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-violet-primary)] animate-pulse" />
                    )}
                    <p className="font-medium truncate">{c.subject}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c._count.messages} message
                    {c._count.messages > 1 ? "s" : ""} · {fmtDate(c.lastMessageAt)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${
                    c.status === "open"
                      ? "bg-green-100 text-green-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {c.status === "open" ? "Ouverte" : "Clôturée"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
