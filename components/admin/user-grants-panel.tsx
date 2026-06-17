"use client";

import { useActionState } from "react";

import {
  grantOneShotPlanAction,
  grantSubscriptionAction,
  revokeGrantAction,
  type GrantState,
} from "@/lib/actions/admin/grants";

const INITIAL: GrantState = { ok: false };

type SimplePlan = { slug: string; name: string; type: string };
type SimpleQuiz = { id: string; title: string; code: string };
type GrantRow = {
  id: string;
  planSlug: string;
  type: string;
  quizId: string | null;
  startsAt: string;
  endsAt: string | null;
  reason: string | null;
  revokedAt: string | null;
};

/* =============================================================
 * Offrir un palier à l'unité sur un quiz
 * ============================================================= */
export function GrantOneShotForm({
  userId,
  quizzes,
  oneShotPlans,
}: {
  userId: string;
  quizzes: SimpleQuiz[];
  oneShotPlans: SimplePlan[];
}) {
  const [state, action, pending] = useActionState(
    grantOneShotPlanAction,
    INITIAL
  );

  if (quizzes.length === 0) {
    return (
      <p className="text-xs italic opacity-70">
        Cet utilisateur n'a pas encore de quiz — il doit en créer un pour
        pouvoir recevoir un cadeau à l'unité.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Quiz cible
        </span>
        <select
          name="quizId"
          required
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        >
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title} ({q.code})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Palier offert
        </span>
        <select
          name="planSlug"
          required
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        >
          {oneShotPlans.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Note interne (optionnel)
        </span>
        <input
          type="text"
          name="reason"
          maxLength={500}
          placeholder="Ex : ami, early adopter, dédommagement bug..."
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      {state.message && (
        <p
          className={`text-xs ${
            state.ok ? "text-green-400" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "🎁 Offrir ce palier"}
      </button>
    </form>
  );
}

/* =============================================================
 * Offrir un abonnement pour X mois
 * ============================================================= */
export function GrantSubscriptionForm({
  userId,
  subscriptionPlans,
}: {
  userId: string;
  subscriptionPlans: SimplePlan[];
}) {
  const [state, action, pending] = useActionState(
    grantSubscriptionAction,
    INITIAL
  );

  if (subscriptionPlans.length === 0) {
    return (
      <p className="text-xs italic opacity-70">
        Aucun plan abonnement actif dans la BDD.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Abonnement offert
        </span>
        <select
          name="planSlug"
          required
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        >
          {subscriptionPlans.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Durée (mois)
        </span>
        <input
          type="number"
          name="durationMonths"
          required
          min={1}
          max={36}
          defaultValue={3}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Note interne (optionnel)
        </span>
        <input
          type="text"
          name="reason"
          maxLength={500}
          placeholder="Ex : ami, partenaire, dédommagement..."
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      {state.message && (
        <p
          className={`text-xs ${
            state.ok ? "text-green-400" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "🎁 Offrir cet abonnement"}
      </button>
    </form>
  );
}

/* =============================================================
 * Liste des cadeaux actifs avec bouton révoquer
 * ============================================================= */
export function GrantsList({ grants }: { grants: GrantRow[] }) {
  const [state, action, pending] = useActionState(revokeGrantAction, INITIAL);

  if (grants.length === 0) {
    return (
      <p className="text-xs italic opacity-70">Aucun cadeau attribué.</p>
    );
  }

  const fmt = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(
      new Date(d)
    );

  return (
    <div className="flex flex-col gap-2">
      {grants.map((g) => {
        const isActive = !g.revokedAt;
        return (
          <div
            key={g.id}
            className={`rounded-lg p-3 text-xs flex flex-col gap-1 ${
              isActive
                ? "bg-[rgba(212,160,23,0.08)] border border-[rgba(212,160,23,0.25)]"
                : "bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold">
                {g.type === "subscription" ? "🔁 Abo" : "🎯 One-shot"} ·{" "}
                {g.planSlug}
              </span>
              {!isActive && (
                <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-300">
                  Révoqué
                </span>
              )}
            </div>
            <p className="opacity-70">
              Depuis {fmt(g.startsAt)}
              {g.endsAt && ` jusqu'au ${fmt(g.endsAt)}`}
            </p>
            {g.reason && <p className="italic opacity-70">« {g.reason} »</p>}
            {isActive && (
              <form action={action} className="flex justify-end mt-1">
                <input type="hidden" name="grantId" value={g.id} />
                <button
                  type="submit"
                  disabled={pending}
                  className="text-[10px] px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/60 text-red-200"
                  onClick={(e) => {
                    if (!confirm("Révoquer ce cadeau ?")) e.preventDefault();
                  }}
                >
                  Révoquer
                </button>
              </form>
            )}
          </div>
        );
      })}
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}
