import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { countUnreadForAdmin } from "@/lib/actions/messages";
import { LogoutButton } from "@/components/auth/logout-button";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { SiteFooterNight } from "@/components/legal/site-footer-night";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  const unreadConvos = await countUnreadForAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-night)] text-[var(--color-lavender)]">
      <header className="border-b border-[rgba(167,139,250,0.15)] bg-[var(--color-night-2)]">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-[2px] text-[var(--color-lavender)]"
            >
              <KuizardLogo size={32} />
              <span>Admin</span>
              <span className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] px-2 py-0.5 rounded-full border border-[var(--color-gold)] ml-2">
                Staff
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="text-[var(--color-lavender-2)] hover:text-[var(--color-gold)] text-xs"
            >
              ← Mon dashboard
            </Link>
            <span className="text-[var(--color-lavender-2)] hidden sm:block">
              {user.name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="md:sticky md:top-6 self-start">
          <nav className="flex flex-row md:flex-col gap-1 text-sm overflow-x-auto">
            <AdminNavLink href="/admin" label="📊 Tableau de bord" />
            <AdminNavLink href="/admin/users" label="👥 Utilisateurs" />
            <AdminNavLink href="/admin/quizzes" label="🎩 Quizz" />
            <AdminNavLink
              href="/admin/suggestions"
              label="💬 Suggestions"
            />
            <AdminNavLink
              href="/admin/messages"
              label="✉️ Messagerie"
              badge={unreadConvos > 0 ? unreadConvos : undefined}
            />
            <div className="mt-2 pt-2 border-t border-[rgba(167,139,250,0.1)]">
              <p className="px-3 text-[10px] uppercase tracking-[2px] opacity-50 mb-1">
                Monétisation
              </p>
            </div>
            <AdminNavLink href="/admin/plans" label="💳 Plans & tarifs" />
            <AdminNavLink href="/admin/promos" label="🎟️ Codes promos" />
            <AdminNavLink href="/admin/payments" label="💰 Paiements" />
            <AdminNavLink
              href="/admin/subscriptions"
              label="🔁 Abonnements"
            />
            <AdminNavLink href="/admin/templates" label="📝 Templates (structures)" />
            <AdminNavLink href="/admin/library" label="📚 Banque de quizz" />
            <AdminNavLink href="/admin/weekly" label="🎁 Quizz de la semaine" />
            <AdminNavLink href="/admin/public-stats" label="🌍 Stats publiques" />
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <SiteFooterNight />
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg hover:bg-[rgba(167,139,250,0.1)] text-[var(--color-lavender-2)] hover:text-[var(--color-lavender)] whitespace-nowrap inline-flex items-center justify-between gap-2"
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-night)] min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
