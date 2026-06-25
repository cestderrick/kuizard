"use client";

import { useState, useTransition } from "react";
import { adminDeleteQuizAction } from "@/lib/actions/admin/quiz-moderation";

/**
 * V49.1 — Bouton de suppression admin d'un quizz (autre user).
 * Double confirmation : window.confirm + raison textuelle obligatoire.
 */
export function AdminQuizDeleteButton({
  quizId,
  code,
  title,
  owner,
}: {
  quizId: string;
  code: string;
  title: string;
  owner: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      alert("Indique une raison (5 caractères min).");
      return;
    }
    const fd = new FormData();
    fd.set("quizId", quizId);
    fd.set("reason", reason.trim());
    startTransition(async () => {
      await adminDeleteQuizAction(fd);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Supprimer le quizz ${code} de ${owner}`}
        className="text-xs px-2 py-1 rounded border border-red-400/40 text-red-300 hover:bg-red-500/10 hover:border-red-400"
      >
        🗑
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !isPending && setOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl mb-3 text-red-700">
              🗑 Supprimer le quizz
            </h2>
            <p className="text-sm mb-1">
              <strong>{title}</strong>{" "}
              <span className="font-mono text-xs opacity-60">({code})</span>
            </p>
            <p className="text-xs text-zinc-600 mb-4">
              Propriétaire : <span className="font-mono">{owner}</span>
            </p>
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-4">
              ⚠️ Action irréversible. Le quizz, ses questions et toutes les
              participations seront effacés définitivement. L&apos;action sera
              tracée dans l&apos;audit log avec ta raison.
            </p>
            <label className="block text-xs font-semibold mb-1 text-zinc-700">
              Raison de la suppression (visible dans l&apos;audit log) *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              minLength={5}
              placeholder="Ex : Contenu inapproprié signalé, demande user, doublon, etc."
              className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-3 py-2 rounded text-sm border border-zinc-300 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Suppression…" : "Confirmer la suppression"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
