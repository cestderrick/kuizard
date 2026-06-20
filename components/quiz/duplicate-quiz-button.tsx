"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { duplicateOwnQuizAction } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/button";

/**
 * V41 — Bouton "Dupliquer" sur les cards Mes quizz.
 * Ouvre une confirmation simple, puis appelle l'action serveur qui
 * recopie titre/questions/thème et redirige vers l'éditeur de la copie.
 */
export function DuplicateQuizButton({
  quizId,
  quizTitle,
}: {
  quizId: string;
  quizTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const res = await duplicateOwnQuizAction({ ok: false }, formData);
    if (!res.ok) {
      setError(res.message ?? "Erreur inconnue.");
    }
    // Si ok, redirect server-side a déjà eu lieu (vers l'éditeur de la copie)
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        📑 Dupliquer
      </Button>
    );
  }

  return (
    <div
      className="rounded-xl p-3 border-2 flex flex-col gap-2"
      style={{
        borderColor: "var(--color-violet-primary)",
        background: "rgba(85,35,187,0.05)",
      }}
    >
      <p className="text-xs font-semibold" style={{ color: "var(--color-violet-deep)" }}>
        Dupliquer « {quizTitle} » ?
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Une copie sera créée en brouillon avec le suffixe « (copie) ». Toutes
        les questions seront recopiées, mais pas les participations ni le
        paiement éventuel.
      </p>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
          {error}
        </p>
      )}
      <form action={action} className="flex gap-2">
        <input type="hidden" name="quizId" value={quizId} />
        <SubmitButton />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setOpen(false);
          }}
        >
          Annuler
        </Button>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      style={{
        backgroundColor: "var(--color-violet-primary)",
        color: "white",
      }}
    >
      {pending ? "Duplication…" : "📑 Confirmer"}
    </Button>
  );
}
