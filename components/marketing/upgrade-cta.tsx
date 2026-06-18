import Link from "next/link";

import type { BillingContext } from "@/lib/billing/context";

/**
 * Bandeau CTA contextuel selon le BillingContext.
 *  - "free"       → push complet (À l'unité + Abonnement)
 *  - "oneshot"    → remerciement + upsell abo seulement
 *  - "subscriber" → message discret "Plan X actif" + lien gérer
 *
 * Accepte `billing=null` pour les pages publiques sans contexte (rend free).
 */
export function UpgradeCTA({
  billing,
  variant = "default",
  compact = false,
  minOneShotPriceCents,
}: {
  billing?: BillingContext | null;
  variant?: "default" | "subtle";
  compact?: boolean;
  /** V33 : prix du plus petit plan one-shot, affiché dans le sous-texte */
  minOneShotPriceCents?: number | null;
}) {
  const minPriceStr =
    typeof minOneShotPriceCents === "number" && minOneShotPriceCents > 0
      ? `${(minOneShotPriceCents / 100).toFixed(0)} €`
      : "5 €";
  const tier = billing?.tier ?? "free";

  // === Cas 1 : abonné actif → message neutre ===
  if (tier === "subscriber" && billing?.subscription) {
    const sub = billing.subscription;
    const expiresStr = sub.currentPeriodEnd
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(sub.currentPeriodEnd)
      : null;
    return (
      <div
        className="rounded-2xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
        style={{
          borderColor: "rgba(16,185,129,0.4)",
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(85,35,187,0.05))",
        }}
      >
        <div className="text-2xl shrink-0" aria-hidden>
          ✓
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Abonnement <strong>{sub.planName ?? sub.planSlug}</strong> actif
          </p>
          <p className="text-xs text-muted-foreground">
            {sub.cancelAtPeriodEnd
              ? `Sera résilié le ${expiresStr ?? "?"}`
              : expiresStr
              ? `Renouvellement le ${expiresStr}`
              : "Renouvellement automatique"}
            {billing.oneShotCount > 0 && (
              <>
                {" "}
                · {billing.oneShotCount} quizz acheté
                {billing.oneShotCount > 1 ? "s" : ""} à l'unité
              </>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/subscription"
          className="text-xs underline-offset-2 hover:underline shrink-0"
          style={{ color: "var(--color-violet-primary)" }}
        >
          Gérer mon abo →
        </Link>
      </div>
    );
  }

  // === Cas 2 : a déjà payé à l'unité, pas d'abo → remerciement + upsell abo ===
  if (tier === "oneshot" && billing) {
    return (
      <div
        className="rounded-2xl border-2 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{
          borderColor: "rgba(245,158,11,0.4)",
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(85,35,187,0.05))",
        }}
      >
        <div className="text-2xl shrink-0" aria-hidden>
          🎩
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Merci pour ton soutien — {billing.oneShotCount} quizz acheté
            {billing.oneShotCount > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Tu organises souvent ? Un abonnement débloque les quizz
            illimités à partir de 25 €/mois.
          </p>
        </div>
        <Link
          href="/tarifs#abonnements"
          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold transition hover:opacity-90 whitespace-nowrap shrink-0"
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          🔁 Voir les abos
        </Link>
      </div>
    );
  }

  // === Cas 3 : free / visiteur → push complet ===
  const isSubtle = variant === "subtle";
  return (
    <div
      className={`rounded-2xl border-2 ${compact ? "p-3" : "p-4 sm:p-5"} relative overflow-hidden`}
      style={{
        background: isSubtle
          ? "linear-gradient(135deg, rgba(85,35,187,0.06), rgba(245,158,11,0.06))"
          : "linear-gradient(135deg, var(--color-violet-deep), var(--color-violet-primary))",
        borderColor: "var(--color-gold)",
      }}
    >
      {!isSubtle && (
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 65%)",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs uppercase tracking-[2px] font-bold mb-1 ${compact ? "" : "sm:text-sm"}`}
            style={{ color: isSubtle ? "var(--color-violet-deep)" : "#f5cc3a" }}
          >
            ✨ Booste ton événement
          </p>
          <p
            className={compact ? "text-sm" : "text-sm sm:text-base"}
            style={{
              color: isSubtle ? "var(--color-foreground)" : "#ffffff",
              fontWeight: 600,
            }}
          >
            Plus de questions, plus de participants, lots, couleurs perso,
            photos, mode TV…
          </p>
          {!compact && (
            <p
              className="text-xs mt-1"
              style={{ color: isSubtle ? "#525252" : "#e9d5ff" }}
            >
              Paie un quizz à l'unité <strong>dès {minPriceStr}</strong> ou
              prends un abonnement pour ton bar / ton entreprise.
            </p>
          )}
        </div>

        <div className="flex flex-col xs:flex-row gap-2 shrink-0">
          <Link
            href="/tarifs#unite"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition hover:opacity-90 whitespace-nowrap"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-violet-deep)",
            }}
          >
            💳 À l'unité
          </Link>
          <Link
            href="/tarifs#abonnements"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition hover:opacity-90 whitespace-nowrap border-2"
            style={{
              backgroundColor: isSubtle
                ? "var(--color-violet-primary)"
                : "transparent",
              color: isSubtle ? "white" : "#ffffff",
              borderColor: isSubtle
                ? "var(--color-violet-primary)"
                : "rgba(255,255,255,0.4)",
            }}
          >
            🔁 Abonnement
          </Link>
        </div>
      </div>
    </div>
  );
}
