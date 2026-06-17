import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Audit log",
};

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  ban: { emoji: "🚫", label: "Bannissement" },
  unban: { emoji: "✓", label: "Levée de ban" },
  promote: { emoji: "👑", label: "Promotion ADMIN" },
  demote: { emoji: "↓", label: "Rétrogradation USER" },
  grant_one_shot: { emoji: "🎁", label: "Cadeau quiz" },
  grant_subscription: { emoji: "🎁", label: "Cadeau abonnement" },
  revoke_grant: { emoji: "🗑", label: "Cadeau révoqué" },
  weekly_set: { emoji: "✨", label: "Quizz semaine activé" },
  weekly_remove: { emoji: "🗑", label: "Quizz semaine retiré" },
  library_toggle: { emoji: "📚", label: "Banque (toggle)" },
  template_upsert: { emoji: "📝", label: "Template édité" },
  template_delete: { emoji: "🗑", label: "Template supprimé" },
  plan_upsert: { emoji: "💳", label: "Plan édité" },
  plan_delete: { emoji: "🗑", label: "Plan supprimé" },
  promo_upsert: { emoji: "🎟️", label: "Code promo édité" },
  promo_delete: { emoji: "🗑", label: "Code promo supprimé" },
};

type SearchParams = Promise<{ action?: string; admin?: string }>;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { action, admin: adminFilter } = await searchParams;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (adminFilter) where.adminId = adminFilter;

  const [logs, allAdmins] = await Promise.all([
    prisma.adminAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
    }),
  ]);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(d);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          📋 Audit log
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Trace de toutes les actions des admins. 200 dernières affichées.
        </p>
      </header>

      {/* Filtres */}
      <section className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <span className="text-[10px] uppercase tracking-[2px] opacity-60">
            Filtrer par action
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/admin/audit-log"
              className={`text-xs px-2.5 py-1 rounded ${
                !action
                  ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-semibold"
                  : "bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)]"
              }`}
            >
              Toutes
            </Link>
            {Object.entries(ACTION_LABELS).map(([key, { emoji, label }]) => (
              <Link
                key={key}
                href={`/admin/audit-log?action=${key}${
                  adminFilter ? `&admin=${adminFilter}` : ""
                }`}
                className={`text-xs px-2.5 py-1 rounded ${
                  action === key
                    ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-semibold"
                    : "bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)]"
                }`}
              >
                {emoji} {label}
              </Link>
            ))}
          </div>
        </div>

        {allAdmins.length > 1 && (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-[10px] uppercase tracking-[2px] opacity-60">
              Filtrer par admin
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={action ? `/admin/audit-log?action=${action}` : "/admin/audit-log"}
                className={`text-xs px-2.5 py-1 rounded ${
                  !adminFilter
                    ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-semibold"
                    : "bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)]"
                }`}
              >
                Tous
              </Link>
              {allAdmins.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/audit-log?admin=${a.id}${
                    action ? `&action=${action}` : ""
                  }`}
                  className={`text-xs px-2.5 py-1 rounded ${
                    adminFilter === a.id
                      ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-semibold"
                      : "bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)]"
                  }`}
                >
                  {a.name ?? a.email}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Liste des logs */}
      {logs.length === 0 ? (
        <p className="text-sm italic opacity-60 text-center py-8">
          Aucune action enregistrée pour ces filtres.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => {
            const meta = ACTION_LABELS[log.action] ?? {
              emoji: "•",
              label: log.action,
            };
            const payload = log.payload as Record<string, unknown> | null;
            return (
              <div
                key={log.id}
                className="rounded-lg bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.1)] p-3 text-sm flex items-start gap-3"
              >
                <span className="text-xl shrink-0 mt-0.5">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold">{meta.label}</span>
                    <span className="text-xs opacity-60">
                      par <strong>{log.adminEmail}</strong>
                    </span>
                  </p>
                  {log.targetUserEmail && (
                    <p className="text-xs opacity-80 mt-1">
                      Cible :{" "}
                      <Link
                        href={`/admin/users/${log.targetUserId}`}
                        className="underline hover:text-[var(--color-gold)]"
                      >
                        {log.targetUserEmail}
                      </Link>
                    </p>
                  )}
                  {log.targetQuizId && (
                    <p className="text-xs opacity-80 mt-1">
                      Quiz : <code>{log.targetQuizId}</code>
                    </p>
                  )}
                  {payload && Object.keys(payload).length > 0 && (
                    <pre className="text-[10px] opacity-60 mt-2 bg-[rgba(0,0,0,0.3)] p-2 rounded overflow-x-auto">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-[10px] opacity-50 shrink-0 font-mono">
                  {fmt(log.createdAt)}
                  {log.ipAddress && (
                    <span className="block mt-0.5">{log.ipAddress}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
