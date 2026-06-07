"use client";

import { useActionState } from "react";

import {
  upsertTemplateAction,
  deleteTemplateAction,
  type AdminTemplateState,
} from "@/lib/actions/admin-templates";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: AdminTemplateState = { ok: false };

type Template = {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  theme?: string | null;
  tags?: string[];
  coverImageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  questions?: unknown;
};

const EXAMPLE_QUESTIONS = JSON.stringify(
  [
    {
      type: "SINGLE_CHOICE",
      text: "Quelle est la capitale de la France ?",
      points: 1,
      options: [
        { label: "Paris", isCorrect: true },
        { label: "Lyon", isCorrect: false },
        { label: "Marseille", isCorrect: false },
      ],
    },
    {
      type: "TRUE_FALSE",
      text: "La Terre est plate.",
      points: 1,
      options: [
        { label: "Vrai", isCorrect: false },
        { label: "Faux", isCorrect: true },
      ],
    },
  ],
  null,
  2
);

export function TemplateForm({ template }: { template?: Template }) {
  const [state, formAction, isPending] = useActionState(
    upsertTemplateAction,
    INITIAL
  );
  useActionToast(state);

  const [delState, delAction, delPending] = useActionState(
    deleteTemplateAction,
    INITIAL
  );
  useActionToast(delState);

  const questionsJson =
    template?.questions !== undefined
      ? JSON.stringify(template.questions, null, 2)
      : EXAMPLE_QUESTIONS;

  return (
    <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5 flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        {template?.id && <input type="hidden" name="id" value={template.id} />}

        <h3 className="font-display text-base tracking-wide">
          {template?.id ? `Éditer "${template.title}"` : "Nouveau template"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Slug">
            <input
              name="slug"
              defaultValue={template?.slug ?? ""}
              required
              disabled={!!template?.id}
              placeholder="mariage"
              className="kz-input"
            />
          </Field>
          <Field label="Titre">
            <input
              name="title"
              defaultValue={template?.title ?? ""}
              required
              placeholder="Quizz spécial mariage"
              className="kz-input md:col-span-2"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={template?.description ?? ""}
            required
            rows={2}
            className="kz-input"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Catégorie">
            <input
              name="category"
              defaultValue={template?.category ?? ""}
              required
              placeholder="mariage"
              className="kz-input"
            />
          </Field>
          <Field label="Thème visuel">
            <input
              name="theme"
              defaultValue={template?.theme ?? ""}
              placeholder="romantique, vintage…"
              className="kz-input"
            />
          </Field>
          <Field label="Image cover (URL)">
            <input
              name="coverImageUrl"
              defaultValue={template?.coverImageUrl ?? ""}
              placeholder="/uploads/templates/mariage.jpg"
              className="kz-input"
            />
          </Field>
        </div>

        <Field label="Tags (séparés par des virgules)">
          <input
            name="tagsCsv"
            defaultValue={(template?.tags ?? []).join(", ")}
            placeholder="famille, humour, blind-test, années 90"
            className="kz-input"
          />
        </Field>

        <Field label="Questions (JSON)">
          <textarea
            name="questionsJson"
            defaultValue={questionsJson}
            required
            rows={12}
            spellCheck={false}
            className="kz-input font-mono text-[11px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ordre affichage">
            <input
              name="displayOrder"
              type="number"
              min={0}
              defaultValue={template?.displayOrder ?? 0}
              className="kz-input"
            />
          </Field>
          <label className="flex items-center gap-2 text-xs cursor-pointer self-end pb-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={template?.isActive ?? true}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            Template actif
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-night)] text-sm font-semibold disabled:opacity-50"
          >
            {isPending
              ? "Enregistrement…"
              : template?.id
              ? "Mettre à jour"
              : "Créer"}
          </button>
        </div>
      </form>

      {template?.id && (
        <form
          action={delAction}
          onSubmit={(e) => {
            if (!confirm("Supprimer ce template ?")) e.preventDefault();
          }}
          className="flex justify-end pt-2 border-t border-[rgba(167,139,250,0.1)]"
        >
          <input type="hidden" name="id" value={template.id} />
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
