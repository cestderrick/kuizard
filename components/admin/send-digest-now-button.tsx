"use client";

import { useState } from "react";

export function SendDigestNowButton() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  async function send() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/daily-digest?range=today", {
        method: "GET",
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setFeedback({
          ok: true,
          msg: `Récap envoyé à ${body.sentToCount} admin(s). Stats : ${body.stats?.newUsersToday ?? 0} nouveaux users, ${body.stats?.quizzesCreatedToday ?? 0} quizz créés J-1.`,
        });
      } else {
        setFeedback({
          ok: false,
          msg:
            body.error ??
            `Erreur ${res.status} : vérifie RESEND_API_KEY + au moins 1 user ADMIN avec email.`,
        });
      }
    } catch (e) {
      setFeedback({
        ok: false,
        msg: e instanceof Error ? `Erreur réseau : ${e.message}` : "Erreur",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 self-start"
        style={{
          backgroundColor: "var(--color-gold)",
          color: "var(--color-violet-deep)",
        }}
      >
        {loading ? "Envoi en cours…" : "📧 Envoyer le récap maintenant"}
      </button>
      {feedback && (
        <p
          className={
            "text-xs rounded-lg p-2 max-w-2xl " +
            (feedback.ok
              ? "bg-green-500/10 text-green-300 border border-green-500/30"
              : "bg-red-500/10 text-red-300 border border-red-500/30")
          }
        >
          {feedback.ok ? "✓ " : "⚠ "}
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
