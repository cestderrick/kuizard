"use client";

import { useActionState, useState } from "react";

import {
  applyGiftCodeAction,
  initialRedeemState,
  validatePromoCodeAction,
  type RedeemState,
} from "@/lib/actions/promo-redeem";
import { useActionToast } from "@/lib/hooks/use-action-toast";

type Quiz = { id: string; title: string; code: string; isPaid: boolean };

export function PromoRedeemForm({ myQuizzes }: { myQuizzes: Quiz[] }) {
  const [code, setCode] = useState("");

  // Étape 1 : valider le code
  const [validateState, validateAction, validatePending] = useActionState<
    RedeemState,
    FormData
  >(validatePromoCodeAction, initialRedeemState);
  useActionToast(validateState);

  // Étape 2 : appliquer le code cadeau à un quizz
  const [applyState, applyAction, applyPending] = useActionState<
    RedeemState,
    FormData
  >(applyGiftCodeAction, initialRedeemState);
  useActionToast(applyState);

  const isGift = validateState.ok && validateState.type === "gift";
  const isDiscount = validateState.ok && validateState.type === "discount";

  return (
    <div className="flex flex-col gap-5">
      {/* Étape 1 — Saisie du code */}
      <form action={validateAction} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
            J'ai un code
          </span>
          <input
            name="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10, GIFT-XYZ…"
            disabled={validatePending}
            className="w-full rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)] disabled:opacity-60 uppercase font-mono"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={validatePending || !code}
            className="px-4 py-2 rounded-lg bg-[var(--color-violet-primary)] text-white text-sm font-semibold disabled:opacity-50"
          >
            {validatePending ? "Vérification…" : "Valider le code"}
          </button>
        </div>
      </form>

      {/* Cas A — Code de réduction */}
      {isDiscount && (
        <div className="rounded-xl bg-green-50 border-2 border-green-300 p-4 text-sm">
          <p className="font-semibold text-green-900 mb-1">
            ✓ Code valide
          </p>
          <p className="text-green-800">
            {validateState.message} Va sur l'éditeur d'un quizz puis clique
            "Voir les plans →" pour l'utiliser.
          </p>
        </div>
      )}

      {/* Cas B — Code cadeau : choisir un quizz */}
      {isGift && (
        <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-4 text-sm flex flex-col gap-3">
          <p className="font-semibold text-amber-900">🎁 Code cadeau valide !</p>
          <p className="text-amber-800">
            Ce code débloque un quizz avec le plan{" "}
            <strong>{validateState.giftPlanSlug}</strong>. Choisis lequel :
          </p>

          {myQuizzes.length === 0 ? (
            <p className="text-xs italic text-amber-800">
              Tu n'as pas encore de quizz. Crée-en un, puis reviens appliquer
              ton code.
            </p>
          ) : (
            <form action={applyAction} className="flex flex-col gap-2">
              <input type="hidden" name="code" value={code} />
              <select
                name="quizId"
                required
                disabled={applyPending}
                defaultValue=""
                className="w-full rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-60"
              >
                <option value="" disabled>
                  Choisir un quizz à débloquer…
                </option>
                {myQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                    {q.isPaid ? " (déjà débloqué)" : ""}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={applyPending}
                  className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-violet-deep)] text-sm font-semibold disabled:opacity-50"
                >
                  {applyPending ? "Application…" : "🎁 Débloquer ce quizz"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
