import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMessages } from "@/lib/i18n/get-locale";
import { needsTermsReacceptance } from "@/lib/legal/acceptance";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { SiteFooter } from "@/components/legal/site-footer";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DashboardNavLink } from "@/components/nav/dashboard-nav-link";
import { UserMenu } from "@/components/nav/user-menu";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getActiveWeeklyFeatured } from "@/lib/weekly/featured";
import { WeeklyFeaturedPill } from "@/components/weekly/weekly-featured-pill";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

// Force le rendu dynamique pour que getLocale() soit ré-évalué à chaque
// requête au lieu de servir une version cachée.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-protection : le proxy gère déjà la redirection /login, mais on
  // garde une garde explicite côté serveur au cas où.
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Lit le rôle + acceptation CGU/CGV. Si version pas à jour → redirect
  // vers /accept-terms (sauf pour les ADMIN qui peuvent y accéder via /admin
  // si besoin — mais on les force aussi à accepter, par souci de cohérence).
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, lastAcceptedTermsVersion: true, onboardingCompletedAt: true },
  });
  if (me && needsTermsReacceptance(me.lastAcceptedTermsVersion)) {
    redirect("/accept-terms");
  }
  const isAdmin = me?.role === "ADMIN";

  // Charge les traductions selon la locale active du user
  const messages = await getMessages();
  const navT = messages.nav;
  // V29.2 : quizz de la semaine (si actif maintenant)
  const weeklyFeatured = await getActiveWeeklyFeatured();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-lavender)]">
      {/* ===========================================================
          Navbar — sticky, légère, état actif sur les pills
          =========================================================== */}
      <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-2.5">
          {/* Bloc gauche : logo + nav principale (desktop) */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 shrink-0"
              style={{ color: "var(--color-violet-deep)" }}
              aria-label="Accueil Kuizard"
            >
              <KuizardLogo size={28} />
              <span className="font-display text-lg font-bold tracking-[2px] hidden xs:inline">
                Kuizard
              </span>
            </Link>

            {/* Nav principale — visible md+ uniquement */}
            <nav className="hidden md:flex items-center gap-1">
              {/* V31 : Accueil en premier (avant le dashboard) */}
              <DashboardNavLink href="/" label={`🏠 ${navT.home}`} exact />
              <DashboardNavLink href="/dashboard" label={navT.dashboard} exact />
              <DashboardNavLink
                href="/dashboard/quizzes"
                label={navT.quizzes}
              />
              <DashboardNavLink
                href="/dashboard/quizzes/library"
                label="📚 Quizthèque"
              />
              <DashboardNavLink href="/dashboard/stats" label={navT.stats} />
              <DashboardNavLink href="/escape" label="🗝️ Escape" />
              <DashboardNavLink href="/tarifs" label="💳 Tarifs" />
            </nav>
          </div>

          {/* Bloc droit : toggle dark + cloche + menu user + burger mobile */}
          <div className="flex items-center gap-2">
            <ThemeToggle variant="light" />
            <NotificationBell />
            {/* V29.2 : pill quizz de la semaine */}
            {weeklyFeatured && <WeeklyFeaturedPill data={weeklyFeatured} />}
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
            <MobileNav />
          </div>
        </div>
      </header>

      {/* V35 : Modal d'onboarding (1ère fois uniquement) */}
      <OnboardingModal shouldShow={!me?.onboardingCompletedAt} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 md:py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
