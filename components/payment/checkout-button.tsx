"use client";

import { useActionState, useState } from "react";

import { createCheckoutSessionAction } from "@/lib/actions/checkout";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: { ok: boolean; message?: string; url?: string } = { ok: false };

export function CheckoutButton({
  quizId,
  planSlug,
  planName,
  priceCents,
  label,
  primary,
}: {
  quizId: string;
  planSlug: string;
  planName?: string;
  priceCents?: number;
  label: string;
  primary?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    createCheckoutSessionAction,
    INITIAL
  );
  useActionToast(state);
  const [open, setOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const priceStr =
    typeof priceCents === "number"
      ? `${(priceCents / 100).toFixed(2).replace(".", ",")} €`
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
          primary
            ? "bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:brightness-110"
            : "border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white"
        }`}
      >
        {isPending ? "Redirection…" : label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
                ✨ Confirmation de paiement
              </p>
              <p className="text-white font-display text-lg font-bold">
                {planName ?? label}
                {priceStr && (
                  <span className="ml-2 text-sm opacity-90">{priceStr}</span>
                )}
              </p>
            </div>

            <form action={formAction} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="quizId" value={quizId} />
              <input type="hidden" name="planSlug" value={planSlug} />
              <input type="hidden" name="promoCode" value={promoCode} />

              <p className="text-sm text-muted-foreground">
                Tu vas être redirigé vers <strong>Stripe</strong> pour payer
                en toute sécurité. Tu peux saisir un code promo
                ci-dessous, ou continuer directement.
              </p>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="promo-input"
                  className="text-xs uppercase tracking-[2px] font-semibold text-muted-foreground"
                >
                  Code promo (optionnel)
                </label>
                <input
                  id="promo-input"
                  type="text"
                  value={promoCode}
                  onChange={(e) =>
                    setPromoCode(e.target.value.toUpperCase().slice(0, 32))
                  }
                  placeholder="ex : KUIZARD2026"
                  className="rounded-lg border px-3 py-2 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[var(--color-violet-primary)]"
                  autoComplete="off"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Sans code promo, laisse vide et continue.
                </p>
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
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-zinc-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50"
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
                Paiement sécurisé par Stripe · TVA non applicable
                (art. 293 B CGI)
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
