"use client";

import { useActionState } from "react";

import {
  upsertPromoAction,
  deletePromoAction,
  type AdminPromoState,
} from "@/lib/actions/admin-promos";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminPromoState = { ok: false };

type Promo = {
  id?: string;
  code?: string;
  description?: string | null;
  percentOff?: number | null;
  amountOffCents?: number | null;
  planSlug?: string | null;
  giftPlanSlug?: string | null;
  giftDurationDays?: number | null;
  maxRedemptions?: number | null;
  redemptions?: number;
  expiresAt?: Date | null;
  isActive?: boolean;
};

export function PromoForm({
  promo,
  planSlugs,
}: {
  promo?: Promo;
  planSlugs: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    upsertPromoAction,
    INITIAL
  );
  useActionToast(state);

  const [delState, delAction, delPending] = useActionState(
    deletePromoAction,
    INITIAL
  );
  useActionToast(delState);

  const expiresAtIso = promo?.expiresAt
    ? new Date(promo.expiresAt).toISOString().slice(0, 16)
    : "";

  return (
    <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5 flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        {promo?.id && <input type="hidden" name="id" value={promo.id} />}

        <h3 className="font-display text-base tracking-wide">
          {promo?.id ? `Code ${promo.code}` : "Nouveau code promo"}
          {promo?.id && promo.maxRedemptions ? (
            <span className="ml-2 text-xs opacity-70 font-normal">
              ({promo.redemptions ?? 0} / {promo.maxRedemptions} utilisé(s))
            </span>
          ) : null}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Code">
            <input
              name="code"
              defaultValue={promo?.code ?? ""}
              required
              readOnly={!!promo?.id}
              placeholder="WELCOME10"
              className={`kz-input uppercase ${promo?.id ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </Field>
          <Field label="Description">
            <input
              name="description"
              defaultValue={promo?.description ?? ""}
              placeholder="Bienvenue nouveau client"
              className="kz-input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="% off (1-100)">
            <input
              name="percentOff"
              type="number"
              min={0}
              max={100}
              defaultValue={promo?.percentOff ?? ""}
              className="kz-input"
            />
          </Field>
          <Field label="OU montant (cts)">
            <input
              name="amountOffCents"
              type="number"
              min={0}
              defaultValue={promo?.amountOffCents ?? ""}
              className="kz-input"
            />
          </Field>
          <Field label="Limité au plan">
            <select
              name="planSlug"
              defaultValue={promo?.planSlug ?? ""}
              className="kz-input"
            >
              <option value="">Tous</option>
              {planSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max utilisations">
            <input
              name="maxRedemptions"
              type="number"
              min={0}
              placeholder="∞"
              defaultValue={promo?.maxRedemptions ?? ""}
              className="kz-input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg p-3 bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)]">
          <Field label="🎁 Plan offert (code cadeau)">
            <select
              name="giftPlanSlug"
              defaultValue={promo?.giftPlanSlug ?? ""}
              className="kz-input"
            >
              <option value="">— (code de réduction classique)</option>
              {planSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          {/* V57 — Duree en jours si utilise a l'inscription */}
          <Field label="Durée cadeau à l'inscription (jours)">
            <input
              name="giftDurationDays"
              type="number"
              min={0}
              max={3650}
              placeholder="ex : 30"
              defaultValue={promo?.giftDurationDays ?? ""}
              className="kz-input"
            />
          </Field>
          <p className="text-[11px] opacity-70 self-end pb-2 md:col-span-1">
            Si renseigné, ce code débloque DIRECTEMENT un plan à la création
            du compte pour la durée indiquée. Sinon, code cadeau classique
            (à appliquer sur un quiz existant).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Expire le (optionnel)">
            <input
              type="datetime-local"
              name="expiresAt"
              defaultValue={expiresAtIso}
              className="kz-input"
            />
          </Field>
          <label className="flex items-center gap-2 text-xs cursor-pointer self-end pb-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={promo?.isActive ?? true}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            Code actif
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
          >
            {isPending
              ? "Enregistrement…"
              : promo?.id
              ? "Mettre à jour"
              : "Créer"}
          </button>
        </div>
      </form>

      {promo?.id && (
        <form
          action={delAction}
          onSubmit={(e) => {
            if (!confirm("Supprimer ce code promo définitivement ?")) {
              e.preventDefault();
            }
          }}
          className="flex justify-end pt-2 border-t border-[rgba(167,139,250,0.1)]"
        >
          <input type="hidden" name="id" value={promo.id} />
          <button
            type="submit"
            disabled={delPending}
            className="text-xs px-3 py-1.5 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-50"
          >
            🗑 Supprimer
          </button>
        </form>
      )}

      <style>{`
        .kz-input {
          width: 100%;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(167,139,250,0.2);
          color: var(--color-lavender);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13px;
        }
        .kz-input:focus { outline: none; border-color: var(--color-gold); }
        .kz-input:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[2px] opacity-70">
        {label}
      </span>
      {children}
    </label>
  );
}
