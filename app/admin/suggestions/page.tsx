import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SuggestionStatusForm } from "@/components/admin/suggestion-status-form";
import { SuggestionDeleteButton } from "@/components/admin/suggestion-delete-button";

export const metadata: Metadata = {
  title: "Admin · Suggestions",
};

type SearchParams = Promise<{ status?: string }>;

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const VALID = ["new", "seen", "done", "wont_fix"];
  const activeFilter = status && VALID.includes(status) ? status : null;

  const [suggestions, counts] = await Promise.all([
    prisma.suggestion.findMany({
      where: activeFilter ? { status: activeFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.suggestion.groupBy({ by: ["status"], _count: true }),
  ]);

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  ) as Record<string, number>;

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          💬 Boîte à idées
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Suggestions, bugs et idées remontés par les utilisateurs
        </p>
      </header>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 text-xs">
        <FilterChip
          href="/admin/suggestions"
          label={`Tout (${Object.values(countByStatus).reduce((a, b) => a + b, 0)})`}
          active={!activeFilter}
        />
        <FilterChip
          href="/admin/suggestions?status=new"
          label={`Nouveau (${countByStatus.new ?? 0})`}
          active={activeFilter === "new"}
        />
        <FilterChip
          href="/admin/suggestions?status=seen"
          label={`Vu (${countByStatus.seen ?? 0})`}
          active={activeFilter === "seen"}
        />
        <FilterChip
          href="/admin/suggestions?status=done"
          label={`Traité (${countByStatus.done ?? 0})`}
          active={activeFilter === "done"}
        />
        <FilterChip
          href="/admin/suggestions?status=wont_fix"
          label={`Ignoré (${countByStatus.wont_fix ?? 0})`}
          active={activeFilter === "wont_fix"}
        />
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-2">
        {suggestions.length === 0 ? (
          <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-8 text-center opacity-70">
            Aucune suggestion {activeFilter ? "avec ce statut" : ""}.
          </div>
        ) : (
          suggestions.map((s) => (
            <article
              key={s.id}
              className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] uppercase tracking-wide font-semibold">
                    {s.category ?? "other"}
                  </span>
                  <span className="text-xs opacity-60">
                    {fmtDate(s.createdAt)}
                  </span>
                  {s.email && (
                    <span className="text-xs font-mono opacity-80">
                      ✉️ {s.email}
                    </span>
                  )}
                  {s.userId && (
                    <span className="text-xs opacity-70 italic">
                      (user connecté)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <SuggestionStatusForm
                    id={s.id}
                    currentStatus={s.status}
                  />
                  <SuggestionDeleteButton id={s.id} />
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {s.message}
              </p>
            </article>
          ))
        )}
      </div>
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
