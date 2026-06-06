import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMyQuiz } from "@/lib/actions/quiz";
import { createQuestionAction } from "@/lib/actions/question";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizMetaForm } from "@/components/quiz/quiz-meta-form";
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
} from "@/lib/actions/upload";
import { parsePrizes } from "@/lib/quiz/prizes";
import { parseTheme } from "@/lib/quiz/theme";
import { getEffectivePlan } from "@/lib/plans/gating";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getMyQuiz(id);
  if (!quiz) notFound();

  // Plan effectif (sert à afficher les limites + features verrouillées)
  const plan = await getEffectivePlan(quiz.id);
  const limits = plan.limits;
  const usedQuestions = quiz.questions.length;
  const maxQuestions = limits.maxQuestions ?? 5;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
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
            {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}{" "}
            · statut {quiz.status.toLowerCase()}
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

      {/* Partage et publication */}
      <ShareSection
        quizId={quiz.id}
        code={quiz.code}
        status={quiz.status}
        hasQuestions={quiz.questions.length > 0}
        expiresAt={quiz.expiresAt}
      />

      {/* Metadata du quizz */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">
            Paramètres du quizz
          </CardTitle>
          <CardDescription>
            Titre, description, mode de pilotage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizMetaForm
            quizId={quiz.id}
            defaultTitle={quiz.title}
            defaultDescription={quiz.description}
            defaultMode={quiz.mode as "LIVE_MANUAL" | "SCHEDULED"}
            defaultOpenAt={quiz.scheduledOpenAt}
            defaultCloseAt={quiz.scheduledCloseAt}
          />
        </CardContent>
      </Card>

      {/* Liste des questions */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display tracking-wide">
              Questions ({quiz.questions.length})
            </CardTitle>
            <CardDescription>
              {quiz.questions.length === 0
                ? "Ajoute ta première question."
                : "Clique sur une question pour l'éditer."}
            </CardDescription>
          </div>
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
        </CardHeader>
        <CardContent>
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
              {quiz.questions.map((q, index) => (
                <li
                  key={q.id}
                  className="flex items-center gap-3 rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--color-lavender)] text-[var(--color-violet-primary)] flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{q.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {QUESTION_TYPE_LABEL[q.type] ?? q.type} · {q.points} pt
                      {q.points > 1 ? "s" : ""}
                      {q.timerSeconds ? ` · ${q.timerSeconds}s` : ""}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/dashboard/quizzes/${quiz.id}/questions/${q.id}/edit`}
                    >
                      Éditer
                    </Link>
                  </Button>
                  <DeleteQuestionButton
                    quizId={quiz.id}
                    questionId={q.id}
                    questionPreview={q.text}
                  />
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Photo de couverture */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">
            🖼️ Photo de couverture
          </CardTitle>
          <CardDescription>
            Affichée à l'arrivée des participants sur le quizz. Fortement
            recommandée pour l'ambiance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            currentUrl={quiz.coverImageUrl}
            uploadAction={uploadCoverImageAction}
            removeAction={removeCoverImageAction}
            hiddenFields={{ quizId: quiz.id }}
            emptyLabel="Glisse une photo de couverture ou clique pour parcourir"
            previewHeightClass="h-56"
          />
        </CardContent>
      </Card>

      {/* Apparence visuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">
            🎨 Apparence
          </CardTitle>
          <CardDescription>
            Couleur principale et ambiance — visible côté joueur sur la page de
            jeu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeEditor
            quizId={quiz.id}
            defaultTheme={parseTheme(quiz.theme)}
          />
        </CardContent>
      </Card>

      {/* Lots / récompenses */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">
            🎁 Lots et récompenses
          </CardTitle>
          <CardDescription>
            Associe un lot à un rang du classement. Visible sur la page de
            classement publique. Tu peux les modifier à tout moment, même après
            la fin du quizz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrizesEditor
            quizId={quiz.id}
            defaultPrizes={parsePrizes(quiz.prizes)}
          />
        </CardContent>
      </Card>

      {/* Classement (mini, côté admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">
            🏆 Classement
          </CardTitle>
          <CardDescription>
            Aperçu du top 3 des participants. Lien vers la page publique en
            dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLeaderboard code={quiz.code} />
        </CardContent>
      </Card>

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
