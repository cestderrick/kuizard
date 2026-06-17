"use client";

import { useActionState } from "react";

import {
  toggleLibraryQuizAction,
  type LibraryToggleState,
} from "@/lib/actions/admin/library-toggle";

const INITIAL: LibraryToggleState = { ok: false };

export function QuizLibraryToggle({
  quizId,
  isLibrary,
  libraryDescription,
  libraryTags,
  libraryLanguage,
}: {
  quizId: string;
  isLibrary: boolean;
  libraryDescription: string | null;
  libraryTags: string[];
  libraryLanguage: string | null;
}) {
  const [state, action, pending] = useActionState(
    toggleLibraryQuizAction,
    INITIAL
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="quizId" value={quizId} />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isLibrary"
          defaultChecked={isLibrary}
          className="size-4 cursor-pointer accent-[var(--color-violet-primary)]"
        />
        <span className="text-sm font-semibold">
          Ajouter à la banque de quizz publique
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-semibold">
          Description (vue depuis la banque)
        </span>
        <textarea
          name="libraryDescription"
          defaultValue={libraryDescription ?? ""}
          rows={2}
          maxLength={500}
          placeholder="Ex : Quizz culture générale tout public, 20 questions"
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-semibold">
            Tags (séparés par virgule)
          </span>
          <input
            type="text"
            name="libraryTags"
            defaultValue={libraryTags.join(", ")}
            placeholder="culture-g, blind-test, soirée"
            className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-semibold">
            Langue
          </span>
          <select
            name="libraryLanguage"
            defaultValue={libraryLanguage ?? ""}
            className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
          >
            <option value="">— Non précisée —</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>
        </label>
      </div>

      {state.message && (
        <p
          className={`text-xs ${
            state.ok ? "text-green-700" : "text-red-600"
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
        {pending ? "Enregistrement…" : "💾 Mettre à jour la banque"}
      </button>
    </form>
  );
}
