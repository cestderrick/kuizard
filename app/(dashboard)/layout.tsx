import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { KuizardLogo } from "@/components/brand/kuizard-logo";

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
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Tableau de bord
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Mes quizz
              </Link>
              <Link
                href="/"
                className="text-muted-foreground hover:text-[var(--color-violet-primary)]"
              >
                Page d'accueil
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
    </div>
  );
}
