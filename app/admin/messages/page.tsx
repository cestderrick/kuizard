import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Messagerie",
};

type SearchParams = Promise<{ status?: string }>;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const activeFilter =
    status === "open" || status === "closed" ? status : null;

  const [conversations, counts] = await Promise.all([
    prisma.conversation.findMany({
      where: activeFilter ? { status: activeFilter } : undefined,
      orderBy: { lastMessageAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.groupBy({ by: ["status"], _count: true }),
  ]);

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  ) as Record<string, number>;

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          ✉️ Messagerie support
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Conversations avec les utilisateurs
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <FilterChip
          href="/admin/messages"
          label={`Tout (${(countByStatus.open ?? 0) + (countByStatus.closed ?? 0)})`}
          active={!activeFilter}
        />
        <FilterChip
          href="/admin/messages?status=open"
          label={`Ouvertes (${countByStatus.open ?? 0})`}
          active={activeFilter === "open"}
        />
        <FilterChip
          href="/admin/messages?status=closed"
          label={`Clôturées (${countByStatus.closed ?? 0})`}
          active={activeFilter === "closed"}
        />
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-8 text-center opacity-70">
          Aucune conversation.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/messages/${c.id}`}
                className="block rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] hover:border-[var(--color-gold)] p-4 transition"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {c.unreadByAdmin && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" />
                      )}
                      <p className="font-semibold truncate">{c.subject}</p>
                    </div>
                    <p className="text-xs opacity-70">
                      {c.user.name ?? "—"} · {c.user.email} ·{" "}
                      {c._count.messages} message
                      {c._count.messages > 1 ? "s" : ""} · {fmt(c.lastMessageAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${
                      c.status === "open"
                        ? "bg-green-500/20 text-green-200 border border-green-500/40"
                        : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/40"
                    }`}
                  >
                    {c.status === "open" ? "Ouverte" : "Clôturée"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full border transition ${
        active
          ? "bg-[var(--color-gold)]/20 border-[var(--color-gold)] text-[var(--color-gold-light)]"
          : "bg-[rgba(0,0,0,0.2)] border-[rgba(167,139,250,0.15)] text-[var(--color-lavender-2)] hover:border-[var(--color-lavender)]"
      }`}
    >
      {label}
    </a>
  );
}
