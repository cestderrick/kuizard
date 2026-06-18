"use client";

// =============================================
// Boutons d'achat / abonnement pour la page /tarifs
// =============================================
// - SubscribeButton : checkout abonnement direct (Stripe)
// - BuyOneShotButton : un quiz one-shot s'achète depuis un quiz spécifique →
//   on redirige vers /dashboard/quizzes en pré-sélectionnant le plan slug.

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSubscriptionCheckoutAction } from "@/lib/actions/subscription";

type SubscribeState = { ok: boolean; message?: string; url?: string };

export function SubscribeButton({
  planSlug,
  isLoggedIn,
  variant = "primary",
  label,
}: {
  planSlug: string;
  isLoggedIn: boolean;
  variant?: "primary" | "secondary";
  label?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    SubscribeState,
    FormData
  >(
    async (_prev, fd) => {
      if (!isLoggedIn) {
        // Sauvegarde le plan choisi pour reprise post-signup
        router.push(
          `/signup?next=${encodeURIComponent(
            `/tarifs?subscribe=${planSlug}`
          )}`
        );
        return { ok: false };
      }
      const result = await createSubscriptionCheckoutAction(
        { ok: false },
        fd
      );
      // L'action redirige si succès (Stripe URL via next/navigation redirect)
      return result;
    },
    { ok: false }
  );

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="planSlug" value={planSlug} />
      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        style={
          variant === "primary"
            ? {
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }
            : {
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.3)",
              }
        }
        className="font-bold w-full"
      >
        {isPending
          ? "Redirection vers Stripe…"
          : label ?? (isLoggedIn ? "S'abonner ✨" : "Créer mon compte pour s'abonner")}
      </Button>
      {state.message && (
        <p className="mt-2 text-xs text-red-300 text-center">{state.message}</p>
      )}
    </form>
  );
}

/**
 * Bouton d'achat one-shot. Comme un paiement à l'unité s'applique à UN quiz
 * précis, on redirige l'utilisateur vers sa liste de quizz pour qu'il
 * choisisse lequel upgrader (pré-sélection du plan via query string).
 */
export function BuyOneShotButton({
  planSlug,
  isLoggedIn,
  variant = "primary",
  label,
}: {
  planSlug: string;
  isLoggedIn: boolean;
  variant?: "primary" | "secondary";
  label?: string;
}) {
  const href = isLoggedIn
    ? `/dashboard/quizzes?upgrade=${planSlug}`
    : `/signup?next=${encodeURIComponent(
        `/dashboard/quizzes?upgrade=${planSlug}`
      )}`;
  return (
    <Button
      asChild
      size="lg"
      style={
        variant === "primary"
          ? {
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }
          : {
              backgroundColor: "white",
              color: "var(--color-violet-primary)",
              border: "1.5px solid var(--color-violet-primary)",
            }
      }
      className="font-bold w-full"
    >
      <a href={href}>
        {label ??
          (isLoggedIn
            ? "Acheter ce plan pour un quizz"
            : "Créer mon compte et acheter")}
      </a>
    </Button>
  );
}
