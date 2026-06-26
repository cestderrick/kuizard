"use client";

// =============================================
// V35 — Modal d'onboarding 5 étapes pour les nouveaux users
// =============================================
// Affiché si User.onboardingCompletedAt est null. Le user peut faire le tour
// complet ou skip à tout moment. À la complétion, on flag son user.

import { useState, useTransition } from "react";
import Link from "next/link";

import { completeOnboardingAction } from "@/lib/actions/onboarding";

const STEPS = [
  {
    emoji: "🎩",
    title: "Bienvenue sur Kuizard !",
    desc: "Cree des quizz personnalises en quelques minutes et anime tes evenements, soirees ou bars. Suis le tour pour decouvrir toutes les fonctionnalites.",
    cta: "C'est parti ! →",
    link: null as string | null,
  },
  {
    emoji: "✨",
    title: "Etape 1 — Cree ton quizz",
    desc: "Titre, description, mode (Pilotage live ou Creneau horaire ouvert), couleur principale et photo de couverture. Tu peux tout modifier a tout moment.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "❓",
    title: "Etape 2 — Ajoute tes questions",
    desc: "Plusieurs types disponibles : QCM choix unique ou multiple, vrai/faux, reponse libre. Chaque question a son texte, ses reponses, et une ou plusieurs bonnes reponses.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "⏱",
    title: "Etape 3 — Points & chrono par question",
    desc: "Tu attribues un nombre de points par question (par defaut 1) et un timer optionnel en secondes. Plus la question est dure, plus tu peux donner de points. Le chrono pousse a l'instinct et booste l'ambiance.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "📷",
    title: "Etape 4 — Photos et personnalisation",
    desc: "Ajoute une photo a chaque question (facon « C'est qui ? »). Personnalise les couleurs aux teintes de ton evenement. Disponible des l'offre a 3€.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "📚",
    title: "Astuce — La Quizztheque",
    desc: "Pas envie de tout creer toi-meme ? Pioche dans notre Quizztheque : quizz prets a l'emploi (mariage, cinema, series, sport...). Duplique en 1 clic et personnalise.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "📲",
    title: "Etape 5 — Partage par QR code",
    desc: "Une fois pret, tu obtiens un QR code et un code a 6 caracteres. Imprime l'affiche A4 prete a l'emploi. Tes invites scannent depuis leur telephone — aucune app a installer.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "📺",
    title: "Etape 6 — Mode TV + classement live",
    desc: "Projette le classement en temps reel sur ecran : podium, scores, chrono. Mode TV plein ecran avec QR geant pour les bars. Ideal pour animer cocktail, soiree ou evenement pro.",
    cta: "Suivant →",
    link: null as string | null,
  },
  {
    emoji: "🎯",
    title: "C'est tout — a toi de jouer !",
    desc: "Tu as toutes les cles. Cree ton premier quizz maintenant ou explore la Quizztheque si tu veux demarrer rapidement.",
    cta: "🚀 Creer mon premier quizz",
    link: "/dashboard/quizzes/new",
  },
];

export function OnboardingModal({
  shouldShow,
}: {
  shouldShow: boolean;
}) {
  const [open, setOpen] = useState(shouldShow);
  const [step, setStep] = useState(0);
  const [, startTransition] = useTransition();

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  function close() {
    setOpen(false);
    startTransition(async () => {
      await completeOnboardingAction();
    });
  }

  function next() {
    if (isLast) {
      close();
      return;
    }
    setStep((s) => s + 1);
  }

  function prev() {
    if (isFirst) return;
    setStep((s) => s - 1);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header coloré */}
        <div
          className="px-6 py-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, var(--color-violet-deep), var(--color-violet-primary))",
            color: "white",
          }}
        >
          <div className="text-6xl mb-2" aria-hidden>
            {current.emoji}
          </div>
          <h2
            id="onboarding-title"
            className="font-display text-xl sm:text-2xl tracking-wide"
          >
            {current.title}
          </h2>
        </div>

        {/* Contenu */}
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {current.desc}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  backgroundColor:
                    i <= step
                      ? "var(--color-violet-primary)"
                      : "rgba(167,139,250,0.25)",
                }}
              />
            ))}
          </div>

          {/* Boutons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 items-center justify-between pt-2">
            <button
              type="button"
              onClick={close}
              className="text-xs underline-offset-2 hover:underline text-muted-foreground"
            >
              Skip le tour
            </button>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prev}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-zinc-100"
                >
                  ← Retour
                </button>
              )}
              {current.link ? (
                <Link
                  href={current.link}
                  onClick={close}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold inline-flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  {current.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  {current.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
