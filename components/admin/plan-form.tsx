"use client";

// =============================================
// V61 — Formulaire admin PlanConfig (refactor : inputs controles)
// =============================================
// Fix : les inputs sont maintenant controles (useState) donc les valeurs sont
// preservees apres une erreur de validation. Erreurs affichees par champ.

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  upsertPlanAction,
  type AdminPlanState,
} from "@/lib/actions/admin-plans";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminPlanState = { ok: false };

type PlanLimits = {
  maxQuestions?: number;
  maxParticipants?: number;
  maxActiveQuizzes?: number;
  maxTemplatesPerMonth?: number;
  customColors?: boolean;
  customPrizes?: boolean;
  finalMessage?: boolean;
  coverImage?: boolean;
  questionImages?: boolean;
  scheduledMode?: boolean;
  liveMode?: boolean;
  ranking?: boolean;
  tvDisplay?: boolean;
};

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

function toNumStr(v: unknown): string {
  if (typeof v === "number") return String(v);
  return "";
}

// V61.1 — Normalise un slug a la volee : minuscules, sans accents, espaces -> tirets,
// caracteres speciaux vires. Evite l'erreur "slug invalide" lors du submit.
function normalizeSlug(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")           // vire les accents
    .toLowerCase()
    .replace(/\s+/g, "-")            // espaces -> tirets
    .replace(/[^a-z0-9_-]/g, "")     // vire tout ce qui n'est pas autorise
    .slice(0, 40);
}

export function PlanForm({ plan }: { plan?: Plan }) {
  const [state, formAction, isPending] = useActionState(
    upsertPlanAction,
    INITIAL
  );
  useActionToast(state);

  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  const initLimits = (plan?.limits ?? {}) as PlanLimits;

  // ------- Etats controles pour TOUS les champs -------
  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [tagline, setTagline] = useState(plan?.tagline ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [type, setType] = useState(plan?.type ?? "one_shot");
  const [interval, setInterval] = useState(plan?.interval ?? "");
  const [priceCents, setPriceCents] = useState(String(plan?.priceCents ?? 0));
  const [stripePriceId, setStripePriceId] = useState(plan?.stripePriceId ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    String(plan?.displayOrder ?? 0)
  );
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [isHighlighted, setIsHighlighted] = useState(
    plan?.isHighlighted ?? false
  );

  // Limits numeriques
  const [maxQuestions, setMaxQuestions] = useState(toNumStr(initLimits.maxQuestions));
  const [maxParticipants, setMaxParticipants] = useState(toNumStr(initLimits.maxParticipants));
  const [maxActiveQuizzes, setMaxActiveQuizzes] = useState(toNumStr(initLimits.maxActiveQuizzes));
  const [maxTemplatesPerMonth, setMaxTemplatesPerMonth] = useState(toNumStr(initLimits.maxTemplatesPerMonth));

  // Limits booleens
  const [customColors, setCustomColors] = useState(!!initLimits.customColors);
  const [customPrizes, setCustomPrizes] = useState(!!initLimits.customPrizes);
  const [finalMessage, setFinalMessage] = useState(!!initLimits.finalMessage);
  const [coverImage, setCoverImage] = useState(!!initLimits.coverImage);
  const [questionImages, setQuestionImages] = useState(!!initLimits.questionImages);
  const [scheduledMode, setScheduledMode] = useState(!!initLimits.scheduledMode);
  const [liveMode, setLiveMode] = useState(!!initLimits.liveMode);
  const [ranking, setRanking] = useState(initLimits.ranking !== false);
  const [tvDisplay, setTvDisplay] = useState(!!initLimits.tvDisplay);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5"
    >
      {plan?.id && <input type="hidden" name="id" value={plan.id} />}

      <h3 className="font-display text-lg tracking-wide">
        {plan?.id ? `Editer ${plan.name ?? plan.slug}` : "Nouveau plan"}
      </h3>

      {state.message && (
        <div
          className={`text-sm rounded-md p-2.5 ${
            state.ok
              ? "bg-green-500/15 border border-green-500/40 text-green-200"
              : "bg-red-500/15 border border-red-500/40 text-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Slug (immuable)" error={state.errors?.slug}>
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(normalizeSlug(e.target.value))}
            required
            readOnly={!!plan?.id}
            placeholder="essentiel"
            className={`kz-input ${plan?.id ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <p className="text-[11px] opacity-60 -mt-0.5">
            Format auto : minuscules, chiffres, - ou _ (ex: <code>bar-pro</code>)
          </p>
        </Field>
        <Field label="Nom affiche" error={state.errors?.name}>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Essentiel"
            className="kz-input"
          />
        </Field>
        <Field label="Tagline" error={state.errors?.tagline}>
          <input
            name="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Pour un evenement entre amis"
            className="kz-input md:col-span-2"
          />
        </Field>
      </div>

      <Field label="Description" error={state.errors?.description}>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="kz-input"
        />
      </Field>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Type" error={state.errors?.type}>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="kz-input"
          >
            <option value="one_shot">Paiement unique</option>
            <option value="subscription">Abonnement</option>
          </select>
        </Field>
        <Field label="Periode (abo)" error={state.errors?.interval}>
          <select
            name="interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="kz-input"
          >
            <option value="">—</option>
            <option value="month">Mensuel</option>
            <option value="year">Annuel</option>
          </select>
        </Field>
        <Field label="Prix (centimes)" error={state.errors?.priceCents}>
          <input
            name="priceCents"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            required
            className="kz-input"
          />
        </Field>
        <Field label="Ordre affichage" error={state.errors?.displayOrder}>
          <input
            name="displayOrder"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="kz-input"
          />
        </Field>
      </div>

      <Field label="Stripe Price ID (optionnel)" error={state.errors?.stripePriceId}>
        <input
          name="stripePriceId"
          value={stripePriceId}
          onChange={(e) => setStripePriceId(e.target.value)}
          placeholder="price_..."
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
          value={maxQuestions}
          onChange={setMaxQuestions}
        />
        <NumberLimit
          name="maxParticipants"
          label="Max participants"
          value={maxParticipants}
          onChange={setMaxParticipants}
        />
        <NumberLimit
          name="maxActiveQuizzes"
          label="Max quizz actifs (abo)"
          value={maxActiveQuizzes}
          onChange={setMaxActiveQuizzes}
        />
        <NumberLimit
          name="maxTemplatesPerMonth"
          label="🎯 Templates/mois (abo)"
          value={maxTemplatesPerMonth}
          onChange={setMaxTemplatesPerMonth}
        />
        <Toggle name="customColors" label="Couleurs personnalisees" value={customColors} onChange={setCustomColors} />
        <Toggle name="customPrizes" label="Lots personnalises" value={customPrizes} onChange={setCustomPrizes} />
        <Toggle name="finalMessage" label="Message de fin" value={finalMessage} onChange={setFinalMessage} />
        <Toggle name="coverImage" label="Photo de couverture" value={coverImage} onChange={setCoverImage} />
        <Toggle name="questionImages" label="Photos questions" value={questionImages} onChange={setQuestionImages} />
        <Toggle name="scheduledMode" label="Mode creneau" value={scheduledMode} onChange={setScheduledMode} />
        <Toggle name="liveMode" label="Mode live" value={liveMode} onChange={setLiveMode} />
        <Toggle name="ranking" label="Classement" value={ranking} onChange={setRanking} />
        <Toggle name="tvDisplay" label="Affichage TV" value={tvDisplay} onChange={setTvDisplay} />
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Toggle
          name="isActive"
          label="Plan actif"
          value={isActive}
          onChange={setIsActive}
        />
        <Toggle
          name="isHighlighted"
          label="Mis en avant (etoile)"
          value={isHighlighted}
          onChange={setIsHighlighted}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? "Enregistrement..." : plan?.id ? "Mettre a jour" : "Creer"}
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
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[2px] opacity-70">
        {label}
      </span>
      {children}
      {error && error.length > 0 && (
        <span className="text-[11px] text-red-300 mt-0.5">
          {error.join(" ")}
        </span>
      )}
    </label>
  );
}

function Toggle({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
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
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="opacity-70">{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="kz-input"
      />
    </label>
  );
}
