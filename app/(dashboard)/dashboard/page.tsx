import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listMyQuizzes } from "@/lib/actions/quiz";
import { countUnreadForUser } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Gère tes quizz Kuizard.",
};

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "magicien(ne)";
  const quizzes = await listMyQuizzes();
  const recent = quizzes.slice(0, 3);

  // Lien admin discret, visible uniquement si rôle ADMIN
  const me = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
    : null;
  const isAdmin = me?.role === "ADMIN";

  // Badge messages non lus
  const unreadMessages = session?.user?.id
    ? await countUnreadForUser(session.user.id)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero accueil */}
      <section>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
              ✨ Bienvenue
            </p>
            <h1
              className="font-display text-4xl md:text-5xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Salut {userName} !
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Ton espace pour créer, gérer et partager des quizz personnalisés.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/messages"
              className="relative text-xs uppercase tracking-[2px] px-3 py-2 rounded-full border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white transition font-semibold whitespace-nowrap"
            >
              ✉️ Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-gold)] text-white min-w-[18px] text-center">
                  {unreadMessages}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs uppercase tracking-[2px] px-3 py-2 rounded-full border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white transition font-semibold whitespace-nowrap"
              >
                🛡️ Admin
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Mes quizz (récents) */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display tracking-wide">
              Mes quizz récents
            </CardTitle>
            <CardDescription>
              {quizzes.length === 0
                ? "Tu n'as pas encore créé de quizz. Lance-toi !"
                : `${quizzes.length} quizz au total — derniers en haut.`}
            </CardDescription>
          </div>
          {quizzes.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/quizzes">Voir tous mes quizz</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="text-6xl" aria-hidden>
                🎩
              </div>
              <p className="text-center text-muted-foreground max-w-sm">
                Crée ton premier quizz en quelques minutes. Choisis les questions,
                les images, le thème, et partage-le avec un QR code.
              </p>
              <Button
                asChild
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                <Link href="/dashboard/quizzes/new">
                  Créer mon premier quizz ✨
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{quiz.code}</span> ·{" "}
                      {quiz._count.questions} questions ·{" "}
                      {quiz._count.participations} joueurs
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                      Éditer
                    </Link>
                  </Button>
                </div>
              ))}
              <Button
                asChild
                variant="outline"
                style={{
                  borderColor: "var(--color-violet-primary)",
                  color: "var(--color-violet-primary)",
                }}
                className="mt-2"
              >
                <Link href="/dashboard/quizzes/new">+ Créer un nouveau quizz</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholders Sprint 3/4 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base">Mes paiements</CardTitle>
            <CardDescription>Bientôt (Sprint 4)</CardDescription>
          </CardHeader>
        </Card>
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base">Statistiques</CardTitle>
            <CardDescription>Bientôt (V1.2)</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
