"use client";

import { useActionState } from "react";

import { updateDemoQuizAction } from "@/lib/actions/admin-site-settings";

const initial: { ok: boolean; message?: string; errors?: Record<string, string[]> } = {
  ok: false,
};

export function DemoQuizForm({ initialCode }: { initialCode: string }) {
  const [state, formAction, isPending] = useActionState(
    updateDemoQuizAction,
    initial
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="demoQuizCode"
          type="text"
          defaultValue={initialCode}
          placeholder="Ex: ABC123 (laisse vide pour retirer)"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-[var(--color-night)] border text-[var(--color-lavender)] placeholder:text-[var(--color-lavender-2)]/40 focus:outline-none focus:border-[var(--color-gold)]"
          style={{ borderColor: "rgba(167,139,250,0.2)" }}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50 whitespace-nowrap"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          {isPending ? "..." : "💾 Définir"}
        </button>
      </div>
      {state.message && (
        <p
          className={
            "text-xs rounded-lg p-2 " +
            (state.ok
              ? "bg-green-500/10 text-green-300 border border-green-500/30"
              : "bg-red-500/10 text-red-300 border border-red-500/30")
          }
        >
          {state.ok ? "✓ " : "⚠ "}
          {state.message}
        </p>
      )}
      {initialCode && (
        <p className="text-xs text-[var(--color-lavender-2)] opacity-80">
          Quiz démo actuel : code{" "}
          <code className="font-mono px-1.5 py-0.5 rounded bg-[var(--color-night)] text-[var(--color-gold-light)]">
            {initialCode}
          </code>{" "}
          —{" "}
          <a
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--color-gold-light)]"
          >
            Tester /demo ↗
          </a>
        </p>
      )}
    </form>
  );
}
