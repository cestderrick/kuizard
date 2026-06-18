import type { Metadata } from "next";
import Link from "next/link";

import { listMyQuizzes } from "@/lib/actions/quiz";
import { parseLiveState } from "@/lib/live/state";
import { getMessages } from "@/lib/i18n/get-locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteQuizButton } from "@/components/quiz/delete-quiz-button";
import { LiveQuickActions } from "@/components/quiz/live-quick-actions";
import { UpgradeCTA } from "@/components/marketing/upgrade-cta";
import { getBillingContext } from "@/lib/billing/context";
import { auth } from "@/auth";
import { getActivePlans } from "@/lib/plans/config";
import { getUnusedCredits } from "@/lib/billing/credits";
import { ApplyCreditButton } from "@/components/quiz/apply-credit-button";

export const metadata: Metadata = {
  title: "Mes quizz",
};

// V23 : DRAFT est traité comme PUBLISHED côté affichage (notion virée).
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Actif",
  PUBLISHED: "Actif",
  RUNNING: "En direct",
  FINISHED: "Terminé",
  ARCHIVED: "Archivé",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-violet-100 text-violet-700",
  PUBLISHED: "bg-violet-100 text-violet-700",
  RUNNING: "bg-green-100 text-green-700",
  FINISHED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-zinc-200 text-zinc-500",
};

const MODE_LABEL: Record<string, string> = {
  LIVE_MANUAL: "Pilotage live",
  SCHEDULED: "Créneau horaire",
};

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams?: Promise<{ upgrade?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const upgradeSlug = sp.upgrade ?? null;
  const [quizzes, messages, session, oneShotPlans] = await Promise.all([
    listMyQuizzes(),
    getMessages(),
    auth(),
    getActivePlans("one_shot"),
  ]);
  const billing = await getBillingContext(session?.user?.id);
  const credits = await getUnusedCredits(session?.user?.id);
  const paidOneShotPrices = oneShotPlans
    .filter((p) => p.priceCents > 0)
    .map((p) => p.priceCents);
  const minOneShotPriceCents = paidOneShotPrices.length
    ? Math.min(...paidOneShotPrices)
    : null;
  const upgradePlan = upgradeSlug
    ? oneShotPlans.find((p) => p.slug === upgradeSlug) ?? null
    : null;
  const t = messages.quizzes;
  const dt = messages.dashboard;

  const labels = {
    page_title: t?.page_title ?? "Mes quizz",
    page_subtitle:
      quizzes.length === 0
        ? t?.empty_title ?? "Tu n'as pas encore créé de quizz."
        : `${quizzes.length} ${t?.page_subtitle ?? "quizz dans ta collection."}`,
    new_quiz: t?.new_quiz ?? "+ Nouveau quizz",
    from_template: t?.from_template ?? "✨ Depuis un template",
    empty_subtitle:
      t?.empty_subtitle ??
      "Crée ton premier quizz en quelques minutes — titre, questions, thème — et partage-le avec un lien et un QR code.",
    create_first: dt?.create_first ?? "Créer mon premier quizz ✨",
    questions_label: t?.questions_label ?? "questions",
    players_label: t?.players_label ?? "joueurs",
    status_draft: t?.status_draft ?? "Actif",
    status_published: t?.status_published ?? "Publié",
    status_running: t?.status_running ?? "En direct",
    status_finished: t?.status_finished ?? "Terminé",
    status_archived: t?.status_archived ?? "Archivé",
  };

  const STATUS_LABEL_I18N: Record<string, string> = {
    DRAFT: labels.status_draft,
    PUBLISHED: labels.status_published,
    RUNNING: labels.status_running,
    FINISHED: labels.status_finished,
    ARCHIVED: labels.status_archived,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display text-3xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {labels.page_title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.page_subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/mes-participations">🕘 Historique</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/quizzes/library">📚 Quizthèque</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/quizzes/templates">
              {labels.from_template}
            </Link>
          </Button>
          <Button
            asChild
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            <Link href="/dashboard/quizzes/new">{labels.new_quiz}</Link>
          </Button>
        </div>
      </div>

      {/* V27 : Bandeau d'invite quand on arrive depuis /tarifs?upgrade=... */}
      {upgradePlan && quizzes.length > 0 && (
        <div
          className="rounded-2xl border-2 p-4 sm:p-5"
          style={{
            borderColor: "var(--color-gold)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(85,35,187,0.06))",
          }}
        >
          <p
            className="font-bold text-base mb-1"
            style={{ color: "var(--color-violet-deep)" }}
          >
            ✨ Tu as choisi le plan{" "}
            <span style={{ color: "var(--color-violet-primary)" }}>
              {upgradePlan.name}
            </span>{" "}
            ({(upgradePlan.priceCents / 100).toFixed(2).replace(".", ",")} €)
          </p>
          <p className="text-sm text-muted-foreground">
            Clique sur <strong>✨ Booster avec {upgradePlan.name}</strong> du
            quizz à upgrader ci-dessous. Tu paieras avec Stripe sur la page
            suivante.
          </p>
        </div>
      )}
      {upgradePlan && quizzes.length === 0 && (
        <div
          className="rounded-2xl border-2 p-4 sm:p-5"
          style={{
            borderColor: "var(--color-gold)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(85,35,187,0.06))",
          }}
        >
          <p
            className="font-bold text-base mb-1"
            style={{ color: "var(--color-violet-deep)" }}
          >
            ✨ Tu as choisi le plan {upgradePlan.name}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Crée d'abord un quizz, tu pourras l'upgrader ensuite.
          </p>
        </div>
      )}

      {/* V24 : CTA paiement à l'unité / abonnement */}
      <UpgradeCTA billing={billing} variant="subtle" minOneShotPriceCents={minOneShotPriceCents} />

      {/* V33 : Banner crédits disponibles */}
      {credits.length > 0 && (
        <div
          className="rounded-2xl border-2 p-4 sm:p-5"
          style={{
            borderColor: "var(--color-gold)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(85,35,187,0.08))",
          }}
        >
          <p
            className="font-bold text-base mb-1"
            style={{ color: "var(--color-violet-deep)" }}
          >
            ✨ Tu as {credits.length} crédit{credits.length > 1 ? "s" : ""}{" "}
            non utilisé{credits.length > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Clique sur <strong>✨ Appliquer mon crédit</strong> sur le quiz à
            débloquer dans la liste ci-dessous.
            {credits.length > 0 && (
              <span className="block mt-1 text-xs">
                Crédits disponibles :{" "}
                {credits
                  .map(
                    (c) =>
                      `${c.planName ?? c.planSlug} (${(c.amountCents / 100).toFixed(0)} €)`
                  )
                  .join(", ")}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Liste ou état vide */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="text-6xl" aria-hidden>
              🎩
            </div>
            <p className="text-center text-muted-foreground max-w-sm">
              {labels.empty_subtitle}
            </p>
            <Button
              asChild
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              <Link href="/dashboard/quizzes/new">{labels.create_first}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-display text-lg tracking-wide truncate">
                      {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium ${
                      STATUS_COLOR[quiz.status] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {STATUS_LABEL_I18N[quiz.status] ?? quiz.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono px-2 py-1 bg-zinc-50 rounded">
                    {quiz.code}
                  </span>
                  <span>·</span>
                  <span>{MODE_LABEL[quiz.mode] ?? quiz.mode}</span>
                  <span>·</span>
                  <span>
                    {quiz._count.questions} {labels.questions_label}
                  </span>
                  <span>·</span>
                  <span>
                    {quiz._count.participations} {labels.players_label}
                  </span>
                </div>

                {/* V23 : Panel live inline pour les quiz LIVE_MANUAL */}
                {quiz.mode === "LIVE_MANUAL" && quiz._count.questions > 0 && (
                  <LiveQuickActions
                    quizId={quiz.id}
                    code={quiz.code}
                    initialState={{
                      status: quiz.status,
                      currentQuestionIndex:
                        parseLiveState(quiz.liveState).currentQuestionIndex,
                      isPaused: parseLiveState(quiz.liveState).isPaused,
                      totalQuestions: quiz._count.questions,
                    }}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  {/* V33 : bouton apply crédit si dispo et quiz pas encore payé */}
                  {credits.length > 0 && quiz.status !== "FINISHED" && (
                    <ApplyCreditButton
                      quizId={quiz.id}
                      quizTitle={quiz.title}
                      credits={credits.map((c) => ({
                        id: c.id,
                        planName: c.planName,
                        planSlug: c.planSlug,
                        amountCents: c.amountCents,
                      }))}
                    />
                  )}
                  {upgradePlan && (
                    <Button
                      asChild
                      size="sm"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-violet-deep)",
                      }}
                      className="font-bold"
                    >
                      <Link
                        href={`/dashboard/quizzes/${quiz.id}/upgrade?plan=${upgradePlan.slug}`}
                      >
                        ✨ Booster avec {upgradePlan.name}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                      Éditer
                    </Link>
                  </Button>
                  <DeleteQuizButton
                    quizId={quiz.id}
                    quizTitle={quiz.title}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
