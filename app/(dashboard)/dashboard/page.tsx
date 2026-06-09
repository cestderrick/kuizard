import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listMyQuizzes } from "@/lib/actions/quiz";
import { countUnreadForUser } from "@/lib/actions/messages";
import { PublicStats } from "@/components/stats/public-stats";
import { getMessages } from "@/lib/i18n/get-locale";

const FB = {
  welcome_eyebrow: "✨ Bienvenue",
  welcome_title: "Salut {name} !",
  welcome_subtitle:
    "Ton espace pour créer, gérer et partager des quizz personnalisés.",
  recent_quizzes_title: "Mes quizz récents",
  recent_quizzes_empty: "Tu n'as pas encore créé de quizz. Lance-toi !",
  recent_quizzes_summary: "{count} quizz au total — derniers en haut.",
  see_all: "Voir tous mes quizz",
  create_first: "Créer mon premier quizz ✨",
  create_new: "+ Créer un nouveau quizz",
  questions_count: "{count} questions",
  players_count: "{count} joueurs",
  edit_button: "Éditer",
  payments_card: "Mes paiements",
  payments_card_desc:
    "Historique des achats de quizz et abonnements, accès aux factures.",
  stats_card: "Statistiques",
  stats_card_desc:
    "Vue globale de l'activité : participations, top quizz, performances.",
};
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
  const messages = await getMessages();
  const t = messages.dashboard;
  const dt = {
    welcome_eyebrow: t?.welcome_eyebrow ?? FB.welcome_eyebrow,
    welcome_title: (t?.welcome_title ?? FB.welcome_title).replace(
      "{name}",
      userName
    ),
    welcome_subtitle: t?.welcome_subtitle ?? FB.welcome_subtitle,
    recent_quizzes_title:
      t?.recent_quizzes_title ?? FB.recent_quizzes_title,
    recent_quizzes_empty:
      t?.recent_quizzes_empty ?? FB.recent_quizzes_empty,
    recent_quizzes_summary: (
      t?.recent_quizzes_summary ?? FB.recent_quizzes_summary
    ).replace("{count}", String(quizzes.length)),
    see_all: t?.see_all ?? FB.see_all,
    create_first: t?.create_first ?? FB.create_first,
    create_new: t?.create_new ?? FB.create_new,
    edit_button: t?.edit_button ?? FB.edit_button,
    payments_card: t?.payments_card ?? FB.payments_card,
    payments_card_desc: t?.payments_card_desc ?? FB.payments_card_desc,
    stats_card: t?.stats_card ?? FB.stats_card,
    stats_card_desc: t?.stats_card_desc ?? FB.stats_card_desc,
    questions_template: t?.questions_count ?? FB.questions_count,
    players_template: t?.players_count ?? FB.players_count,
  };

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
              {dt.welcome_eyebrow}
            </p>
            <h1
              className="font-display text-4xl md:text-5xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {dt.welcome_title}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              {dt.welcome_subtitle}
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
              {dt.recent_quizzes_title}
            </CardTitle>
            <CardDescription>
              {quizzes.length === 0
                ? dt.recent_quizzes_empty
                : dt.recent_quizzes_summary}
            </CardDescription>
          </div>
          {quizzes.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/quizzes">{dt.see_all}</Link>
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
                  {dt.create_first}
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
                      {dt.questions_template.replace(
                        "{count}",
                        String(quiz._count.questions)
                      )}{" "}
                      ·{" "}
                      {dt.players_template.replace(
                        "{count}",
                        String(quiz._count.participations)
                      )}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                      {dt.edit_button}
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
                <Link href="/dashboard/quizzes/new">{dt.create_new}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats publiques (si activé par l'admin) */}
      <PublicStats variant="light" />

      {/* Accès rapides */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/payments"
          className="group rounded-lg border bg-white p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-display text-base tracking-wide group-hover:text-[var(--color-violet-primary)]">
              💳 {dt.payments_card}
            </p>
            <span className="text-muted-foreground group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {dt.payments_card_desc}
          </p>
        </Link>
        <Link
          href="/dashboard/stats"
          className="group rounded-lg border bg-white p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-display text-base tracking-wide group-hover:text-[var(--color-violet-primary)]">
              📊 {dt.stats_card}
            </p>
            <span className="text-muted-foreground group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {dt.stats_card_desc}
          </p>
        </Link>
      </div>
    </div>
  );
}
