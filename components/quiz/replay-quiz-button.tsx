"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { replayQuizAction } from "@/lib/actions/replay";

/**
 * V47.21 — Bouton "Rejouer ce quiz". Confirm via window.confirm puis
 * appelle l'action serveur qui clear cookie + participation BDD.
 */
export function ReplayQuizButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    if (!confirm("Tu veux vraiment rejouer ? Ton ancien score sera effacé.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("code", code);
      await replayQuizAction(fd);
      router.push(`/q/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition hover:opacity-90 disabled:opacity-50"
        style={{
          borderColor: "rgba(167,139,250,0.4)",
          color: "var(--color-lavender)",
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        {loading ? "Réinitialisation…" : "🔄 Rejouer ce quiz"}
      </button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
