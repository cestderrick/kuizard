"use client";

import { useState } from "react";

export function EmailDebugButton() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  async function run() {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/admin/email-debug", { cache: "no-store" });
      const body = await res.json();
      setReport(body);
    } catch (e) {
      setReport({
        ok: false,
        error: e instanceof Error ? e.message : "Erreur réseau",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 self-start"
        style={{
          backgroundColor: "rgba(167,139,250,0.2)",
          color: "var(--color-lavender)",
          border: "1px solid rgba(167,139,250,0.4)",
        }}
      >
        {loading ? "Diagnostic en cours…" : "🩺 Diagnostiquer envoi email"}
      </button>
      {report && (
        <pre
          className="text-[11px] rounded-lg p-3 max-w-4xl overflow-auto"
          style={{
            backgroundColor: "var(--color-night)",
            color: "var(--color-lavender)",
            border: "1px solid rgba(167,139,250,0.2)",
            maxHeight: "400px",
          }}
        >
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </div>
  );
}
