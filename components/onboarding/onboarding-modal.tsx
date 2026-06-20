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
    desc: "Crée des quizz personnalisés en quelques minutes et anime tes événements, soirées ou bars. Voyons ensemble comment lancer ton premier quizz.",
    cta: "C'est parti ! →",
    link: null as string | null,
  },
  {
    emoji: "✨",
    title: "Étape 1 — Crée ton premier quizz",
    desc: "Donne-lui un titre, une description, choisis un mode (Pilotage live ou Créneau horaire), et c'est parti. Tu pourras le modifier à tout moment.",
    cta: "Créer un quizz",
    link: "/dashboard/quizzes/new" as string | null,
  },
  {
    emoji: "❓",
    title: "Étape 2 — Ajoute tes questions",
    desc: "Texte de la question, 2 à 4 réponses (avec une ou plusieurs bonnes selon le type), nombre de points, et un timer optionnel par question. Tu peux aussi ajouter une image.",
    cta: "Suivant →",
    link: null,
  },
  {
    emoji: "📚",
    title: "Astuce — La Quizzthèque",
    desc: "Pas envie de tout créer toi-même ? Pioche dans notre Quizzthèque : 70+ quizz prêts à l'emploi (Star Wars, Friends, Tarantino…). Duplique en 1 clic.",
    cta: "Suivant →",
    link: "/dashboard/quizzes/library" as string | null,
  },
  {
    emoji: "🎯",
    title: "Étape 3 — Partage et lance",
    desc: "Une fois ton quizz prêt, tu obtiens un QR code et un code à 6 lettres. Tes participants scannent, rejoignent, et c'est parti pour la magie ! En mode TV pour les bars, on a même un affichage plein écran avec QR géant.",
    cta: "🚀 J'ai compris, à moi de jouer !",
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
