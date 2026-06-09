import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { SiteFooter } from "@/components/legal/site-footer";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DashboardNavLink } from "@/components/nav/dashboard-nav-link";
import { UserMenu } from "@/components/nav/user-menu";
import { MobileNav } from "@/components/nav/mobile-nav";

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

  // Lit le rôle en BDD pour proposer l'accès admin si applicable
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";

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
              <DashboardNavLink href="/dashboard" label="Accueil" exact />
              <DashboardNavLink href="/dashboard/quizzes" label="Mes quizz" />
              <DashboardNavLink href="/dashboard/stats" label="Stats" />
              <DashboardNavLink href="/dashboard/messages" label="Messages" />
              <DashboardNavLink
                href="/dashboard/suggestions"
                label="Suggestions"
              />
            </nav>
          </div>

          {/* Bloc droit : cloche + menu user + burger mobile */}
          <div className="flex items-center gap-1">
            <NotificationBell />
            <UserMenu
              name={session.user.name ?? null}
              email={session.user.email ?? ""}
              isAdmin={isAdmin}
            />
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 md:py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
