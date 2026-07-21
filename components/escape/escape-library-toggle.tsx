"use client";

// V60.4b — Bouton admin pour marquer un escape comme "library" (visible que si isAdmin=true)

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  toggleEscapeLibraryAction,
  type ToggleEscapeLibraryState,
} from "@/lib/actions/escape";

const INITIAL: ToggleEscapeLibraryState = { ok: false };

type Props = {
  escapeId: string;
  currentIsLibrary: boolean;
  currentIsPremium: boolean;
  currentDescription: string | null;
  currentTags: string[];
  currentLanguage: string | null;
};

export function EscapeLibraryToggle({
  escapeId,
  currentIsLibrary,
  currentIsPremium,
  currentDescription,
  currentTags,
  currentLanguage,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    toggleEscapeLibraryAction,
    INITIAL
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="escapeId" value={escapeId} />

      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">🗝️ Bibliotheque publique</p>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            name="isLibrary"
            defaultChecked={currentIsLibrary}
            className="w-4 h-4 accent-[var(--color-violet-primary)]"
          />
          <span>Publier dans la bibliotheque</span>
        </label>
      </div>

      {state.message && (
        <div
          className={`text-xs rounded p-2 ${
            state.ok
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="lib-desc" className="text-xs">
            Description (visible dans la bibliotheque)
          </Label>
          <textarea
            id="lib-desc"
            name="libraryDescription"
            rows={2}
            maxLength={1000}
            defaultValue={currentDescription ?? ""}
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm resize-none"
            placeholder="Un pitch pour les futurs joueurs..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="lib-tags" className="text-xs">
            Tags (separes par des virgules)
          </Label>
          <Input
            id="lib-tags"
            name="libraryTags"
            type="text"
            maxLength={500}
            defaultValue={currentTags.join(", ")}
            placeholder="mariage, evjf, halloween"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded border">
          <input
            type="checkbox"
            name="isPremium"
            defaultChecked={currentIsPremium}
            className="w-4 h-4 accent-[var(--color-violet-primary)]"
          />
          <span>Reserve aux abonnes premium</span>
        </label>
        <div className="flex flex-col gap-1">
          <Label htmlFor="lib-lang" className="text-xs">
            Langue
          </Label>
          <Input
            id="lib-lang"
            name="libraryLanguage"
            type="text"
            maxLength={20}
            defaultValue={currentLanguage ?? "fr"}
            placeholder="fr"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          {isPending ? "..." : "Enregistrer bibliotheque"}
        </Button>
      </div>
    </form>
  );
}
