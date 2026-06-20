import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMyQuiz } from "@/lib/actions/quiz";
import { parseLiveState } from "@/lib/live/state";
import { QuizLibraryToggle } from "@/components/admin/quiz-library-toggle";
import { createQuestionAction } from "@/lib/actions/question";
import { LiveAdminPanel } from "@/components/quiz/live-admin-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizMetaForm } from "@/components/quiz/quiz-meta-form";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { DeleteQuestionButton } from "@/components/quiz/delete-question-button";
import { DeleteQuizButton } from "@/components/quiz/delete-quiz-button";
import { ShareSection } from "@/components/quiz/share-section";
import { AdminLeaderboard } from "@/components/quiz/admin-leaderboard";
import { PrizesEditor } from "@/components/quiz/prizes-editor";
import { ThemeEditor } from "@/components/quiz/theme-editor";
import { ImageUploader } from "@/components/quiz/image-uploader";
import {
  uploadCoverImageAction,
  removeCoverImageAction,
  setCoverImageFromUrlAction,
} from "@/lib/actions/upload";
import { parsePrizes } from "@/lib/quiz/prizes";
import { parseTheme } from "@/lib/quiz/theme";
import { getEffectivePlan } from "@/lib/plans/gating";
import { getQuizLockState } from "@/lib/quiz/lock";

export const metadata: Metadata = {
  title: "Éditer un quizz",
};

const QUESTION_TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: "QCM choix unique",
  MULTIPLE_CHOICE: "QCM choix multiples",
  TRUE_FALSE: "Vrai / Faux",
  TEXT: "Texte libre",
};

export default async function EditQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    used?: string;
    max?: string;
    plan?: string;
  }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const quiz = await getMyQuiz(id);
  if (!quiz) notFound();

  // Plan effectif (sert à afficher les limites + features verrouillées)
  const plan = await getEffectivePlan(quiz.id);
  // V29 : état de verrouillage (quizz déjà utilisé)
  const lock = await getQuizLockState(quiz.id);
  const limits = plan.limits;
  const usedQuestions = quiz.questions.length;
  const maxQuestions = limits.maxQuestions ?? 5;

  // Pour le panneau admin Banque de quizz
  const session = await auth();
  let isAdmin = false;
  let libraryFields = {
    isLibrary: false,
    libraryIsPremium: false,
    libraryDescription: null as string | null,
    libraryTags: [] as string[],
    libraryLanguage: null as string | null,
  };
  if (session?.user?.id) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    isAdmin = me?.role === "ADMIN";
    if (isAdmin) {
      const fullQuiz = await prisma.quiz.findUnique({
        where: { id: quiz.id },
        select: {
          isLibrary: true,
          libraryIsPremium: true,
          libraryDescription: true,
          libraryTags: true,
          libraryLanguage: true,
        },
      });
      if (fullQuiz) {
        libraryFields = {
          isLibrary: fullQuiz.isLibrary,
          libraryIsPremium: fullQuiz.libraryIsPremium,
          libraryDescription: fullQuiz.libraryDescription,
          libraryTags: fullQuiz.libraryTags,
          libraryLanguage: fullQuiz.libraryLanguage,
        };
      }
    }
  }

  // Bandeau d'erreur si la limite de questions est atteinte
  const showLimitBanner = sp.error === "question_limit";
  const limitUsed = sp.used ?? String(usedQuestions);
  const limitMax = sp.max ?? String(maxQuestions);
  const limitPlanName = sp.plan ?? plan.name;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {showLimitBanner && (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="text-3xl shrink-0">🪄</div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-amber-900 mb-1">
                Limite atteinte sur le plan {limitPlanName}
              </p>
              <p className="text-sm text-amber-900/80 mb-3">
                Tu as utilisé <strong>{limitUsed}/{limitMax}</strong> questions
                sur ce quizz. Pour en ajouter davantage, passe à un palier
                supérieur — c'est instantané et tes questions existantes sont
                conservées.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/tarifs"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  ✨ Voir les tarifs
                </Link>
                <Link
                  href={`/dashboard/quizzes/${quiz.id}/edit`}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold border border-amber-300 text-amber-900 hover:bg-amber-100/50"
                >
                  Compris
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* V29 : Banner verrouillage si quizz déjà utilisé */}
      {lock.isLocked && (
        <div
          className="rounded-2xl border-2 p-4 sm:p-5"
          style={{
            borderColor: "rgba(245,158,11,0.6)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(85,35,187,0.06))",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">🔒</div>
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-base mb-1"
                style={{ color: "var(--color-violet-deep)" }}
              >
                Ce quizz a déjà été utilisé — questions verrouillées
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {lock.reason === "finished"
                  ? "Tu as terminé une session live de ce quizz. Pour modifier les questions / le mode / les dates, "
                  : "Au moins un participant a complété ce quizz. Pour modifier les questions / le mode / les dates, "}
                duplique-le ou prends un abonnement illimité.
                <br />
                <strong>Le titre, la description, le thème et les lots restent modifiables.</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/tarifs#abonnements"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  🔁 Voir les abos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <span className="truncate">{quiz.title}</span>
      </div>

      {/* Header avec code + statut */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1
            className="font-display text-3xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {quiz.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Code <code className="font-mono">{quiz.code}</code> ·{" "}
            {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Encart Plan / Paiement */}
      <Card
        className={
          plan.slug !== "free"
            ? "border-green-300 bg-green-50/60"
            : "border-[var(--color-violet-primary)] bg-[rgba(85,35,187,0.04)]"
        }
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {plan.slug !== "free"
                ? `✓ Plan ${plan.name}`
                : "🪄 Plan Découverte (gratuit)"}
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="block">
                Questions : <strong>{usedQuestions} / {maxQuestions}</strong>{" "}
                · Participants max :{" "}
                <strong>{limits.maxParticipants ?? 20}</strong>
              </span>
              <span className="block mt-1 text-xs">
                {[
                  limits.customColors && "🎨 Couleurs",
                  limits.coverImage && "📸 Cover",
                  limits.questionImages && "🖼️ Photos questions",
                  limits.customPrizes && "🎁 Lots",
                  limits.finalMessage && "💌 Message fin",
                  limits.scheduledMode && "⏰ Créneau",
                  limits.liveMode && "🎩 Live",
                  limits.tvDisplay && "📺 TV",
                ]
                  .filter(Boolean)
                  .join(" · ") || "Aucune option activée."}
              </span>
            </CardDescription>
          </div>
          {plan.slug === "free" && (
            <Button
              asChild
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-semibold"
            >
              <Link href={`/dashboard/quizzes/${quiz.id}/upgrade`}>
                Voir les plans →
              </Link>
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* V23 : Panel live mis en évidence en haut pour les quiz LIVE_MANUAL */}
      {quiz.mode === "LIVE_MANUAL" && quiz.questions.length > 0 && (
        <div className="rounded-2xl border-2 border-[var(--color-gold)] shadow-xl bg-gradient-to-br from-[var(--color-night)] to-[#2a2243] p-1">
          <LiveAdminPanel
            quizId={quiz.id}
            code={quiz.code}
            title={quiz.title}
            questions={quiz.questions.map((q) => ({
              id: q.id,
              order: q.order,
              text: q.text,
              type: q.type,
            }))}
            initialState={{
              status: quiz.status,
              currentQuestionIndex:
                parseLiveState(quiz.liveState).currentQuestionIndex,
              isPaused: parseLiveState(quiz.liveState).isPaused,
              totalQuestions: quiz.questions.length,
            }}
          />
        </div>
      )}

      {/* Partage */}
      <ShareSection
        quizId={quiz.id}
        code={quiz.code}
        status={quiz.status}
        hasQuestions={quiz.questions.length > 0}
        expiresAt={quiz.expiresAt}
      />

      {/* Metadata du quizz */}
      <CollapsibleSection
        icon="⚙️"
        title="Paramètres du quizz"
        description="Titre, description, mode de pilotage."
        defaultOpen
      >
        <QuizMetaForm
          quizId={quiz.id}
          defaultTitle={quiz.title}
          defaultDescription={quiz.description}
          defaultMode={quiz.mode as "LIVE_MANUAL" | "SCHEDULED"}
          defaultOpenAt={quiz.scheduledOpenAt}
          defaultCloseAt={quiz.scheduledCloseAt}
        />
      </CollapsibleSection>

      {/* Liste des questions */}
      <CollapsibleSection
        icon="❓"
        title="Questions"
        description={
          quiz.questions.length === 0
            ? "Ajoute ta première question."
            : "Clique sur une question pour l'éditer."
        }
        badge={`${quiz.questions.length}/${maxQuestions === Infinity ? "∞" : maxQuestions}`}
        defaultOpen
      >
        <div className="mb-4 flex justify-end">
          <form action={createQuestionAction}>
            <input type="hidden" name="quizId" value={quiz.id} />
            <Button
              type="submit"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              + Nouvelle question
            </Button>
          </form>
        </div>
        <div>
          {quiz.questions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-5xl" aria-hidden>
                ❓
              </div>
              <p className="text-muted-foreground max-w-sm">
                Pas encore de question. Clique sur <strong>+ Nouvelle
                question</strong> pour commencer.
              </p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {quiz.questions.map((q, index) => {
                // V47.4 : flag les questions hors limite plan
                const isBeyondPlan =
                  (q.order ?? index + 1) > (plan.limits.maxQuestions ?? 5);
                return (
                  <li
                    key={q.id}
                    className="flex items-center gap-3 rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow"
                    style={
                      isBeyondPlan
                        ? {
                            backgroundColor: "rgba(245,158,11,0.06)",
                            borderColor: "rgba(245,158,11,0.3)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
                      style={
                        isBeyondPlan
                          ? {
                              backgroundColor: "rgba(245,158,11,0.15)",
                              color: "var(--color-gold-light, #f59e0b)",
                            }
                          : {
                              backgroundColor: "var(--color-lavender)",
                              color: "var(--color-violet-primary)",
                            }
                      }
                    >
                      {isBeyondPlan ? "🔒" : index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {q.text}
                        {isBeyondPlan && (
                          <span
                            className="ml-2 text-[10px] uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full font-bold align-middle"
                            style={{
                              backgroundColor: "rgba(245,158,11,0.2)",
                              color: "var(--color-violet-deep)",
                            }}
                          >
                            🔒 Hors plan
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {QUESTION_TYPE_LABEL[q.type] ?? q.type} · {q.points} pt
                        {q.points > 1 ? "s" : ""}
                        {q.timerSeconds ? ` · ${q.timerSeconds}s` : ""}
                        {isBeyondPlan && (
                          <>
                            {" · "}
                            <a
                              href="/tarifs"
                              className="underline"
                              style={{ color: "var(--color-violet-primary)" }}
                            >
                              Débloquer
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/quizzes/${quiz.id}/questions/${q.id}/edit`}
                      >
                        {isBeyondPlan ? "Voir" : "Éditer"}
                      </Link>
                    </Button>
                    <DeleteQuestionButton
                      quizId={quiz.id}
                      questionId={q.id}
                      questionPreview={q.text}
                    />
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </CollapsibleSection>

      {/* Photo de couverture */}
      <CollapsibleSection
        icon="🖼️"
        title="Photo de couverture"
        description="Affichée à l'arrivée des participants. Fortement recommandée pour l'ambiance."
        badge={quiz.coverImageUrl ? "✓" : undefined}
      >
        <ImageUploader
          currentUrl={quiz.coverImageUrl}
          uploadAction={uploadCoverImageAction}
          removeAction={removeCoverImageAction}
          setFromUrlAction={setCoverImageFromUrlAction}
          hiddenFields={{ quizId: quiz.id }}
          emptyLabel="Glisse une photo de couverture ou clique pour parcourir"
          previewHeightClass="h-56"
          disabledMessage={
            plan.limits.coverImage === false
              ? `La photo de couverture n'est pas incluse dans ton plan \"${plan.name}\". Passe à un plan supérieur pour l'activer.`
              : null
          }
        />
      </CollapsibleSection>

      {/* Apparence visuelle */}
      <CollapsibleSection
        icon="🎨"
        title="Apparence"
        description="Couleur principale et ambiance — visible côté joueur."
      >
        <ThemeEditor
          quizId={quiz.id}
          defaultTheme={parseTheme(quiz.theme)}
        />
      </CollapsibleSection>

      {/* Lots / récompenses */}
      <CollapsibleSection
        icon="🎁"
        title="Lots et récompenses"
        description="Associe un lot à un rang du classement. Modifiable à tout moment."
        badge={
          quiz.prizes && Array.isArray(quiz.prizes) && quiz.prizes.length > 0
            ? `${quiz.prizes.length} lot${quiz.prizes.length > 1 ? "s" : ""}`
            : undefined
        }
      >
        <PrizesEditor
          quizId={quiz.id}
          defaultPrizes={parsePrizes(quiz.prizes)}
        />
      </CollapsibleSection>

      {/* Classement (mini, côté admin) */}
      <CollapsibleSection
        icon="🏆"
        title="Classement"
        description="Aperçu du top 3 des participants. Lien vers la page publique."
      >
        <AdminLeaderboard code={quiz.code} />
      </CollapsibleSection>

      {/* Panneau ADMIN — Banque de quizz (visible uniquement pour admin) */}
      {isAdmin && (
        <Card className="border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              📚 Banque de quizz
              <span className="text-[10px] uppercase tracking-[2px] px-2 py-0.5 rounded-full bg-[var(--color-gold)] text-[var(--color-violet-deep)] font-bold">
                Admin only
              </span>
            </CardTitle>
            <CardDescription>
              Mettre ce quizz à disposition de tous les users dans la banque
              publique. Ils pourront le dupliquer dans leur compte pour
              l'utiliser tel quel ou le modifier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuizLibraryToggle
              quizId={quiz.id}
              isLibrary={libraryFields.isLibrary}
              libraryIsPremium={libraryFields.libraryIsPremium}
              libraryDescription={libraryFields.libraryDescription}
              libraryTags={libraryFields.libraryTags}
              libraryLanguage={libraryFields.libraryLanguage}
            />
          </CardContent>
        </Card>
      )}

      {/* Zone danger */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Supprimer le quizz
          </CardTitle>
          <CardDescription>
            La suppression d'un quizz est définitive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteQuizButton
            quizId={quiz.id}
            quizTitle={quiz.title}
            triggerLabel="Supprimer ce quizz"
            triggerClassName="text-destructive border border-destructive/40 hover:bg-destructive hover:text-white"
          />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="ghost">
          <Link href="/dashboard/quizzes">← Retour à mes quizz</Link>
        </Button>
      </div>
    </div>
  );
}
