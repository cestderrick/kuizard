import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMessages } from "@/lib/i18n/get-locale";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "@/components/nav/user-menu";
import { DashboardNavLink } from "@/components/nav/dashboard-nav-link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "@/components/nav/mobile-nav";

/**
 * V41.3 — Navbar globale unifiée. Utilisée par la home, /escape, /tarifs et
 * toute page publique.
 *
 * V46 : retourne maintenant aussi un header pour les visiteurs NON connectés
 * avec liens Accueil / Tarifs / Escape + boutons Se connecter / Créer compte.
 */
export async function PublicNavbar() {
  const session = await auth();

  const messages = await getMessages();
  const navT = messages.nav;

  // ============ Version NON CONNECTÉ ============
  if (!session?.user?.id) {
    return (
      // V47.19 : bg-white OPAQUE (bg-white/85 translucide laissait passer
      // le hero sombre derrière → contraste pourri). Shadow léger pour
      // structurer + bordure plus visible.
      <header
        data-theme="light"
        className="sticky top-0 z-40 border-b shadow-sm"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "rgba(167,139,250,0.3)",
          colorScheme: "light",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 shrink-0"
              style={{ color: "var(--color-violet-deep)" }}
              aria-label="Accueil Kuizard"
            >
              <KuizardLogo size={28} />
              <span className="font-display text-lg font-bold tracking-[2px] hidden xs:inline">
                Kuizard
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <DashboardNavLink href="/" label="🏠 Accueil" exact />
              {/* V47.19 : raccourci vers le quiz démo public */}
              <DashboardNavLink href="/demo" label="🎮 Démo" />
              <DashboardNavLink
                href="/dashboard/quizzes/library"
                label="📚 Quizzthèque"
              />
              <DashboardNavLink href="/tarifs" label="💳 Tarifs" />
              <DashboardNavLink href="/escape" label="🗝️ Escape" />
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold border transition hover:bg-violet-50"
              style={{
                color: "var(--color-violet-deep)",
                borderColor: "rgba(85,35,187,0.3)",
              }}
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "var(--color-violet-primary)" }}
            >
              ✨ Créer un compte
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>
    );
  }

  // ============ Version CONNECTÉ ============
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";

  return (
    <header
      data-theme="light"
      className="sticky top-0 z-40 border-b border-violet-100 bg-white shadow-sm"
      style={{ colorScheme: "light" }}
    >
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
            <DashboardNavLink href="/" label={`🏠 ${navT.home}`} exact />
            <DashboardNavLink href="/dashboard" label={navT.dashboard} exact />
            <DashboardNavLink
              href="/dashboard/quizzes"
              label={navT.quizzes}
              notMatching={["/dashboard/quizzes/library", "/dashboard/mes-participations"]}
            />
            <DashboardNavLink
              href="/dashboard/quizzes/library"
              label="📚 Quizzthèque"
            />
            <DashboardNavLink href="/escape" label="🗝️ Escape" />
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
              stats: navT.stats,
            }}
          />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
