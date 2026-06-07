import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { SiteFooter } from "@/components/legal/site-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-protection : le proxy gère déjà la redirection /login,
  // mais on garde une garde explicite côté serveur au cas où.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-lavender)]">
      <header className="border-b border-violet-100 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-[2px]"
              style={{ color: "var(--color-violet-deep)" }}
            >
              <KuizardLogo size={32} />
              <span>Kuizard</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Accueil
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Mes quizz
              </Link>
              <Link
                href="/dashboard/stats"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Stats
              </Link>
              <Link
                href="/dashboard/payments"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Paiements
              </Link>
              <Link
                href="/dashboard/subscription"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Abo
              </Link>
              <Link
                href="/dashboard/promos"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Codes promos
              </Link>
              <Link
                href="/dashboard/messages"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Messages
              </Link>
              <Link
                href="/dashboard/suggestions"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Suggestions
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Profil
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session.user.name ?? session.user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
