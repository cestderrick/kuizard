"use client";

import { useState, useTransition } from "react";

import { toggleLibraryPremiumAction } from "@/lib/actions/admin/library-toggle";

/**
 * V46 — Toggle inline gratuit/premium sur la liste admin de la banque.
 * Pas besoin d'ouvrir l'éditeur du quiz.
 */
export function PremiumQuickToggle({
  quizId,
  initialIsPremium,
}: {
  quizId: string;
  initialIsPremium: boolean;
}) {
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function toggle() {
    const next = !isPremium;
    setIsPremium(next); // optimistic
    setFeedback(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("quizId", quizId);
      fd.append("isPremium", next ? "true" : "false");
      const res = await toggleLibraryPremiumAction({ ok: false }, fd);
      if (!res.ok) {
        setIsPremium(!next); // rollback
        setFeedback(res.message ?? "Erreur");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(res.message ?? "✓");
        setTimeout(() => setFeedback(null), 2000);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[1.5px] font-bold border transition disabled:opacity-50"
        style={
          isPremium
            ? {
                backgroundColor: "rgba(245,158,11,0.15)",
                borderColor: "var(--color-gold)",
                color: "var(--color-gold-light)",
              }
            : {
                backgroundColor: "rgba(16,185,129,0.15)",
                borderColor: "rgba(16,185,129,0.5)",
                color: "rgb(110, 231, 183)",
              }
        }
        title={
          isPremium
            ? "Cliquer pour passer en GRATUIT"
            : "Cliquer pour passer en PREMIUM (abo requis)"
        }
      >
        {isPending ? "..." : isPremium ? "🔒 Premium" : "🆓 Gratuit"}
      </button>
      {feedback && (
        <span className="text-[10px] text-[var(--color-gold-light)]">
          {feedback}
        </span>
      )}
    </div>
  );
}
