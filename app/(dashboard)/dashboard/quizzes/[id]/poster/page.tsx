import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateQrSvg, buildQuizPlayUrl } from "@/lib/quiz/qrcode";
import { parseTheme } from "@/lib/quiz/theme";
import { PosterPrintBar } from "@/components/quiz/poster-print-bar";

export const metadata: Metadata = {
  title: "Affiche à imprimer",
};

export default async function PosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const quiz = await prisma.quiz.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      theme: true,
    },
  });
  if (!quiz) notFound();

  const url = buildQuizPlayUrl(quiz.code);
  const theme = parseTheme(quiz.theme);
  // QR code en haute qualité (correction d'erreur "H" pour résister à l'impression)
  const qrSvg = await generateQrSvg(url, {
    color: "#0F0A2E",
    backgroundColor: "#FFFFFF",
    margin: 2,
  });

  return (
    <>
      {/* Style print-only — applique le format A4 et masque l'UI hors affiche */}
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { background: white !important; }
          /* Masquer tout sauf l'affiche */
          body > *:not(#poster-root),
          .no-print { display: none !important; }
          #poster-root {
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Barre d'action — masquée à l'impression */}
      <PosterPrintBar
        quizId={quiz.id}
        title={quiz.title}
      />

      {/* L'affiche elle-même */}
      <div className="flex justify-center p-8 bg-[var(--color-lavender)] min-h-screen">
        <article
          id="poster-root"
          className="w-[210mm] h-[297mm] bg-white text-[var(--color-foreground)] shadow-2xl relative flex flex-col"
          style={{
            background: `linear-gradient(160deg, #FAF7FF 0%, #FFFFFF 50%, ${theme.primaryColor}15 100%)`,
          }}
        >
          {/* Bandeau du haut */}
          <header
            className="px-12 py-8 flex items-center justify-between"
            style={{
              borderBottom: `4px solid ${theme.primaryColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="font-display text-2xl font-bold tracking-[3px]"
                style={{ color: theme.primaryColor }}
              >
                Kuizard
              </span>
              <span className="text-lg">✨</span>
            </div>
            <p className="text-sm italic text-muted-foreground">
              pour un moment magique
            </p>
          </header>

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col items-center justify-center px-12 py-8 text-center gap-6">
            <p
              className="text-xs uppercase tracking-[5px] font-bold"
              style={{ color: theme.primaryColor }}
            >
              ✨ Quizz Kuizard ✨
            </p>

            <h1
              className="font-display font-bold tracking-wide leading-tight"
              style={{
                color: "var(--color-violet-deep)",
                fontSize: "48px",
                maxWidth: "16ch",
              }}
            >
              {quiz.title}
            </h1>

            {quiz.description && (
              <p
                className="text-base text-muted-foreground"
                style={{ maxWidth: "40ch" }}
              >
                {quiz.description}
              </p>
            )}

            {/* QR code géant */}
            <div
              className="rounded-2xl p-4 bg-white border-4"
              style={{ borderColor: theme.primaryColor }}
            >
              <div
                style={{ width: "85mm", height: "85mm" }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p
              className="text-sm uppercase tracking-[3px] font-semibold"
              style={{ color: theme.primaryColor }}
            >
              Scanne ce code pour jouer
            </p>

            {/* Code court */}
            <div
              className="rounded-xl px-6 py-3 text-center"
              style={{
                backgroundColor: theme.primaryColor,
                color: "white",
              }}
            >
              <p className="text-xs uppercase tracking-[3px] opacity-90 mb-1">
                ou tape le code sur kuizard.fr
              </p>
              <p
                className="font-display font-bold"
                style={{ fontSize: "44px", letterSpacing: "8px" }}
              >
                {quiz.code}
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer
            className="px-12 py-4 text-center text-xs text-muted-foreground"
            style={{
              borderTop: `1px solid ${theme.primaryColor}40`,
            }}
          >
            {url}
          </footer>

          {/* Décor : petites étoiles dans les coins */}
          <div
            aria-hidden
            className="absolute top-24 left-8 text-3xl opacity-30"
            style={{ color: theme.primaryColor }}
          >
            ✦
          </div>
          <div
            aria-hidden
            className="absolute top-32 right-12 text-2xl opacity-30"
            style={{ color: theme.primaryColor }}
          >
            ✧
          </div>
          <div
            aria-hidden
            className="absolute bottom-24 left-12 text-2xl opacity-30"
            style={{ color: theme.primaryColor }}
          >
            ✧
          </div>
          <div
            aria-hidden
            className="absolute bottom-28 right-8 text-3xl opacity-30"
            style={{ color: theme.primaryColor }}
          >
            ✦
          </div>
        </article>
      </div>
    </>
  );
}
