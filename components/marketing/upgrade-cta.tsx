import Link from "next/link";

/**
 * Bandeau CTA pour pousser l'achat à l'unité ou l'abonnement.
 * À placer là où l'utilisateur risque d'avoir besoin de débloquer plus de
 * fonctionnalités : dashboard, liste quizz, éditeur, etc.
 *
 * Le composant est "muet" sur les détails plan : il pousse vers /tarifs.
 * Pour un CTA contextuel à un quizz précis (ex: dépasser la limite), utiliser
 * plutôt le lien direct vers /dashboard/quizzes/[id]/upgrade.
 */
export function UpgradeCTA({
  variant = "default",
  compact = false,
}: {
  variant?: "default" | "subtle";
  compact?: boolean;
}) {
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
              Paie un quizz à l'unité <strong>dès 5 €</strong> ou prends un
              abonnement <strong>illimité</strong> pour ton bar / ta boîte.
            </p>
          )}
        </div>

        <div className="flex flex-col xs:flex-row gap-2 shrink-0">
          <Link
            href="/tarifs"
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
