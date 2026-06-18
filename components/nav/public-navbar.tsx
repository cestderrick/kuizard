import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMessages } from "@/lib/i18n/get-locale";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "@/components/nav/user-menu";
import { DashboardNavLink } from "@/components/nav/dashboard-nav-link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Navbar globale réutilisable, à inclure sur toutes les pages publiques
 * (home, tarifs, cas d'usage, blog, etc.). Affiche :
 *  - non connecté : juste un lien retour à l'accueil
 *  - connecté : la navbar dashboard complète (Dashboard, Quizzes, Stats, etc.)
 */
export async function PublicNavbar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [me, messages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
    getMessages(),
  ]);
  const isAdmin = me?.role === "ADMIN";
  const navT = messages.nav;

  return (
    <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 shrink-0"
            style={{ color: "var(--color-violet-deep)" }}
            aria-label="Dashboard Kuizard"
          >
            <KuizardLogo size={28} />
            <span className="font-display text-lg font-bold tracking-[2px] hidden xs:inline">
              Kuizard
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DashboardNavLink href="/dashboard" label={navT.dashboard} exact />
            <DashboardNavLink href="/dashboard/quizzes" label={navT.quizzes} />
            <DashboardNavLink href="/dashboard/stats" label={navT.stats} />
            <DashboardNavLink
              href="/dashboard/messages"
              label={navT.messages}
            />
            <DashboardNavLink
              href="/dashboard/suggestions"
              label={navT.suggestions}
            />
            <DashboardNavLink href="/tarifs" label="💳 Tarifs" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="light" />
          <NotificationBell />
          <UserMenu
            name={session.user.name ?? null}
            email={session.user.email ?? ""}
            isAdmin={isAdmin}
            labels={{
              profile: navT.profile,
              subscription: navT.subscription,
              payments: navT.payments,
              promos: navT.promos,
              messages: navT.messages,
              suggestions: navT.suggestions,
              home: navT.home,
              admin: navT.admin,
              logout: navT.logout,
            }}
          />
        </div>
      </div>
    </header>
  );
}
