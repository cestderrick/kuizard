"use client";

import { useActionState } from "react";

import {
  upsertPlanAction,
  type AdminPlanState,
} from "@/lib/actions/admin-plans";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminPlanState = { ok: false };

type Plan = {
  id?: string;
  slug?: string;
  name?: string;
  tagline?: string | null;
  description?: string | null;
  type?: string;
  interval?: string | null;
  priceCents?: number;
  stripePriceId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  isHighlighted?: boolean;
  limits?: Record<string, unknown>;
};

export function PlanForm({ plan }: { plan?: Plan }) {
  const [state, formAction, isPending] = useActionState(
    upsertPlanAction,
    INITIAL
  );
  useActionToast(state);

  const limits = plan?.limits ?? {};

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5"
    >
      {plan?.id && <input type="hidden" name="id" value={plan.id} />}

      <h3 className="font-display text-lg tracking-wide">
        {plan?.id ? `Éditer ${plan.name ?? plan.slug}` : "Nouveau plan"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Slug (immuable)">
          <input
            name="slug"
            defaultValue={plan?.slug ?? ""}
            required
            readOnly={!!plan?.id}
            placeholder="essentiel"
            className={`kz-input ${plan?.id ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </Field>
        <Field label="Nom affiché">
          <input
            name="name"
            defaultValue={plan?.name ?? ""}
            required
            placeholder="Essentiel"
            className="kz-input"
          />
        </Field>
        <Field label="Tagline">
          <input
            name="tagline"
            defaultValue={plan?.tagline ?? ""}
            placeholder="Pour un événement entre amis"
            className="kz-input md:col-span-2"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={plan?.description ?? ""}
          rows={2}
          className="kz-input"
        />
      </Field>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Type">
          <select
            name="type"
            defaultValue={plan?.type ?? "one_shot"}
            className="kz-input"
          >
            <option value="one_shot">Paiement unique</option>
            <option value="subscription">Abonnement</option>
          </select>
        </Field>
        <Field label="Période (abo)">
          <select
            name="interval"
            defaultValue={plan?.interval ?? ""}
            className="kz-input"
          >
            <option value="">—</option>
            <option value="month">Mensuel</option>
            <option value="year">Annuel</option>
          </select>
        </Field>
        <Field label="Prix (centimes)">
          <input
            name="priceCents"
            type="number"
            min={0}
            defaultValue={plan?.priceCents ?? 0}
            required
            className="kz-input"
          />
        </Field>
        <Field label="Ordre affichage">
          <input
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={plan?.displayOrder ?? 0}
            className="kz-input"
          />
        </Field>
      </div>

      <Field label="Stripe Price ID (optionnel)">
        <input
          name="stripePriceId"
          defaultValue={plan?.stripePriceId ?? ""}
          placeholder="price_…"
          className="kz-input"
        />
      </Field>

      <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-[rgba(167,139,250,0.15)] rounded-lg p-3">
        <legend className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] px-2">
          Limites & features
        </legend>
        <NumberLimit
          name="maxQuestions"
          label="Max questions"
          value={limits.maxQuestions as number | undefined}
        />
        <NumberLimit
          name="maxParticipants"
          label="Max participants"
          value={limits.maxParticipants as number | undefined}
        />
        <NumberLimit
          name="maxActiveQuizzes"
          label="Max quizz actifs (abo)"
          value={limits.maxActiveQuizzes as number | undefined}
        />
        <NumberLimit
          name="maxTemplatesPerMonth"
          label="🎯 Templates/mois (abo)"
          value={limits.maxTemplatesPerMonth as number | undefined}
        />
        <Toggle name="customColors" label="Couleurs personnalisées" value={limits.customColors} />
        <Toggle name="customPrizes" label="Lots personnalisés" value={limits.customPrizes} />
        <Toggle name="finalMessage" label="Message de fin" value={limits.finalMessage} />
        <Toggle name="coverImage" label="Photo de couverture" value={limits.coverImage} />
        <Toggle name="questionImages" label="Photos questions" value={limits.questionImages} />
        <Toggle name="scheduledMode" label="Mode créneau" value={limits.scheduledMode} />
        <Toggle name="liveMode" label="Mode live" value={limits.liveMode} />
        <Toggle name="ranking" label="Classement" value={limits.ranking !== false} />
        <Toggle name="tvDisplay" label="Affichage TV" value={limits.tvDisplay} />
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Toggle
          name="isActive"
          label="Plan actif"
          value={plan?.isActive ?? true}
        />
        <Toggle
          name="isHighlighted"
          label="Mis en avant (étoile)"
          value={plan?.isHighlighted}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : plan?.id ? "Mettre à jour" : "Créer"}
        </button>
      </div>

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
    </form>
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

function Toggle({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: unknown;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={!!value}
        className="w-4 h-4 accent-[var(--color-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function NumberLimit({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="opacity-70">{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        defaultValue={value ?? ""}
        className="kz-input"
      />
    </label>
  );
}
