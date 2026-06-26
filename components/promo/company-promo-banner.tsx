"use client";

// =============================================
// V51 — Bandeau code promo société sur le quiz
// =============================================

import { useState } from "react";

export type CompanyPromoBannerData = {
  id: string;
  code: string;
  description: string;
  discountPercent: number | null;
  validUntil: string | null; // ISO
};

export function CompanyPromoBanner({
  promo,
  quizId,
}: {
  promo: CompanyPromoBannerData;
  quizId?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      // Log copy event (silently)
      fetch("/api/promo/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCodeId: promo.id,
          quizId: quizId ?? null,
          action: "copy",
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // navigator.clipboard pas dispo : fallback prompt
      window.prompt("Copie le code ci-dessous :", promo.code);
    }
  }

  const validLabel =
    promo.validUntil &&
    new Date(promo.validUntil).getTime() > Date.now() &&
    `Valable jusqu'au ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(promo.validUntil))}`;

  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 justify-center text-center sm:text-left"
      style={{
        background:
          "linear-gradient(135deg, var(--color-gold), #d4a017)",
        color: "var(--color-violet-deep)",
        border: "2px solid #92410d",
      }}
    >
      <span className="text-2xl shrink-0" aria-hidden>
        🎁
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm sm:text-base leading-tight">
          {promo.discountPercent
            ? `${promo.discountPercent}% de réduction `
            : "Offre exclusive "}
          avec le code{" "}
          <span className="font-mono uppercase">{promo.code}</span>
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          {promo.description}
          {validLabel && ` · ${validLabel}`}
        </p>
      </div>
      <button
        type="button"
        onClick={copyCode}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition hover:opacity-90"
        style={{
          backgroundColor: "var(--color-violet-deep)",
          color: "#ffffff",
        }}
      >
        {copied ? "✓ Copié !" : "📋 Copier"}
      </button>
    </div>
  );
}
