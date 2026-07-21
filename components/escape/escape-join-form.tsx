"use client";

// V60.3 — Formulaire pour rejoindre un escape avec une equipe

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  joinEscapeAction,
  type EscapePlayState,
} from "@/lib/actions/escape-play";

const INITIAL: EscapePlayState = { ok: false };

export function EscapeJoinForm({ escapeCode }: { escapeCode: string }) {
  const [state, formAction, isPending] = useActionState(joinEscapeAction, INITIAL);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="escapeCode" value={escapeCode} />

      {state.message && (
        <div className="text-sm rounded-lg p-3 bg-red-50 border border-red-200 text-red-900">
          {state.message}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="teamName">Nom d&apos;equipe *</Label>
        <Input
          id="teamName"
          name="teamName"
          type="text"
          required
          minLength={2}
          maxLength={50}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Les detectives"
          autoComplete="off"
        />
        {state.errors?.teamName && (
          <p className="text-sm text-red-700">
            {state.errors.teamName.join(" ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="playerNames">Joueurs (optionnel)</Label>
        <textarea
          id="playerNames"
          name="playerNames"
          rows={2}
          maxLength={500}
          value={players}
          onChange={(e) => setPlayers(e.target.value)}
          placeholder="Marie, Paul, Théo…"
          className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground -mt-1">
          Sépare les prénoms par des virgules. Facultatif.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending || teamName.trim().length < 2}
        className="mt-2"
        style={{
          backgroundColor: "var(--color-violet-primary)",
          color: "white",
        }}
      >
        {isPending ? "Connexion..." : "🚪 Rejoindre l'escape"}
      </Button>
    </form>
  );
}
