"use client";

// =============================================
// V33 — Boutons d'achat / abonnement pour la page /tarifs
// =============================================

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSubscriptionCheckoutAction } from "@/lib/actions/subscription";
import { createCheckoutSessionAction } from "@/lib/actions/checkout";

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
        router.push(
          `/signup?next=${encodeURIComponent(`/tarifs?subscribe=${planSlug}`)}`
        );
        return { ok: false };
      }
      const result = await createSubscriptionCheckoutAction({ ok: false }, fd);
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
 * V33 : Bouton d'achat one-shot = achat d'un CRÉDIT (non lié à un quiz).
 * Au clic : dialog de confirmation (avec code promo), puis Stripe Checkout
 * direct avec quizId=null → crée un Payment de type crédit.
 * L'user pourra ensuite appliquer ce crédit à n'importe quel quiz depuis
 * /dashboard/quizzes.
 */
export function BuyOneShotButton({
  planSlug,
  planName,
  priceCents,
  isLoggedIn,
  variant = "primary",
  label,
}: {
  planSlug: string;
  planName?: string;
  priceCents?: number;
  isLoggedIn: boolean;
  variant?: "primary" | "secondary";
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  // V47.10 : flag mounted pour createPortal (évite hydration mismatch SSR)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [state, formAction, isPending] = useActionState<
    { ok: boolean; message?: string },
    FormData
  >(
    async (_prev, fd) => {
      if (!isLoggedIn) {
        router.push(
          `/signup?next=${encodeURIComponent(`/tarifs?credit=${planSlug}`)}`
        );
        return { ok: false };
      }
      const result = await createCheckoutSessionAction({ ok: false }, fd);
      return result;
    },
    { ok: false }
  );

  const priceStr =
    typeof priceCents === "number"
      ? `${(priceCents / 100).toFixed(2).replace(".", ",")} €`
      : null;

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
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
        {label ??
          (isLoggedIn ? "💳 Acheter ce crédit" : "Créer un compte et acheter")}
      </Button>

      {open && mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div
              className="px-5 py-4 border-b"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-violet-deep), var(--color-violet-primary))",
              }}
            >
              <p className="text-[10px] uppercase tracking-[3px] font-bold text-[var(--color-gold)] mb-1">
                💳 Achat d&apos;un crédit
              </p>
              <p className="text-white font-display text-lg font-bold">
                {planName ?? planSlug}
                {priceStr && (
                  <span className="ml-2 text-sm opacity-90">{priceStr}</span>
                )}
              </p>
            </div>
            <form action={formAction} className="p-5 flex flex-col gap-4">
              {/* Pas de quizId : c'est un crédit non lié */}
              <input type="hidden" name="planSlug" value={planSlug} />
              <input type="hidden" name="promoCode" value={promoCode} />

              <p className="text-sm text-muted-foreground">
                Tu vas être redirigé vers <strong>Stripe</strong>. Ce crédit
                sera disponible dans ton tableau de bord pour l&apos;appliquer
                ensuite à n&apos;importe quel quiz de ton choix.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-[2px] font-semibold text-muted-foreground">
                  Code promo (optionnel)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) =>
                    setPromoCode(e.target.value.toUpperCase().slice(0, 32))
                  }
                  placeholder="ex : KUIZARD2026"
                  className="rounded-lg border px-3 py-2 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[var(--color-violet-primary)]"
                  autoComplete="off"
                />
              </div>

              {state.message && !state.ok && (
                <p className="text-sm text-red-600 rounded-md bg-red-50 px-3 py-2">
                  {state.message}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-zinc-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  {isPending
                    ? "Redirection vers Stripe…"
                    : "🔒 Continuer vers Stripe →"}
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                Paiement sécurisé par Stripe · TVA non applicable (art. 293 B
                CGI)
              </p>
            </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
