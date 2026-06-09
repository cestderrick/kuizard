"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "kuizard:cookies-ack:v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // localStorage indisponible (mode privé bloqué) — on n'affiche rien
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 rounded-2xl shadow-2xl border bg-white p-5 flex flex-col gap-3"
      role="region"
      aria-label="Bandeau cookies"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          🍪
        </span>
        <div className="flex-1">
          <p className="font-display text-base font-bold mb-1">
            On utilise des cookies
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uniquement les cookies techniques essentiels au service :
            <strong>session de connexion</strong> (NextAuth),{" "}
            <strong>participation aux quizz</strong> (kz_play_*),{" "}
            <strong>préférence de langue</strong> (kz_locale).
            Lors d'un paiement, Stripe pose ses propres cookies de sécurité.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Aucun tracker publicitaire</strong> · aucun analytics ·
            pas de cookies tiers en dehors du paiement.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-end items-center">
        <Link
          href="/cookies"
          className="text-xs underline text-[var(--color-violet-primary)] mr-auto"
        >
          En savoir plus
        </Link>
        <Button
          onClick={dismiss}
          size="sm"
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          Compris ✨
        </Button>
      </div>
    </div>
  );
}
