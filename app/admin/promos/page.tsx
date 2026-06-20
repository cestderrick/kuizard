import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PromoForm } from "@/components/admin/promo-form";

export const metadata: Metadata = {
  title: "Admin · Codes promos",
};

export default async function AdminPromosPage() {
  await requireAdmin();

  const [promos, plans] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.planConfig.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { displayOrder: "asc" },
    }),
  ]);
  const planSlugs = plans.map((p) => p.slug);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🎟️ Codes promos
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Chaque code est synchronisé en Coupon Stripe. Le user le saisit
          au moment du paiement.
        </p>
      </header>

      <details
        open={promos.length === 0}
        className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4"
      >
        <summary className="cursor-pointer font-semibold text-sm">
          + Créer un nouveau code
        </summary>
        <div className="mt-4">
          <PromoForm planSlugs={planSlugs} />
        </div>
      </details>

      {/* V47.10 : chaque code promo plié dans un <details>, click summary pour déplier */}
      <div className="flex flex-col gap-3">
        {promos.length === 0 ? (
          <p className="text-sm opacity-60 italic text-center py-6">
            Aucun code créé pour l'instant.
          </p>
        ) : (
          promos.map((p) => {
            const discountLabel = p.percentOff
              ? `-${p.percentOff}%`
              : p.amountOffCents
              ? `-${(p.amountOffCents / 100).toFixed(2)} €`
              : p.giftPlanSlug
              ? `🎁 ${p.giftPlanSlug}`
              : "—";
            const isExpired =
              p.expiresAt !== null && p.expiresAt.getTime() < Date.now();
            const isExhausted =
              p.maxRedemptions !== null && p.redemptions >= p.maxRedemptions;
            return (
              <details
                key={p.id}
                className="group rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden hover:border-[var(--color-gold)]/50 transition"
              >
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 list-none">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl shrink-0" aria-hidden>🎟️</span>
                    <div className="min-w-0">
                      <p
                        className="font-semibold truncate"
                        style={{ color: "var(--color-lavender)" }}
                      >
                        <code className="font-mono">{p.code}</code>
                        <span
                          className="ml-2 text-sm font-bold align-middle"
                          style={{ color: "var(--color-gold-light)" }}
                        >
                          {discountLabel}
                        </span>
                        {!p.isActive && (
                          <span
                            className="ml-2 text-[10px] uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full font-bold align-middle"
                            style={{
                              backgroundColor: "rgba(239,68,68,0.2)",
                              color: "rgb(252, 165, 165)",
                            }}
                          >
                            désactivé
                          </span>
                        )}
                        {isExpired && (
                          <span
                            className="ml-2 text-[10px] uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full font-bold align-middle"
                            style={{
                              backgroundColor: "rgba(245,158,11,0.2)",
                              color: "var(--color-gold-light)",
                            }}
                          >
                            expiré
                          </span>
                        )}
                        {isExhausted && (
                          <span
                            className="ml-2 text-[10px] uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-full font-bold align-middle"
                            style={{
                              backgroundColor: "rgba(245,158,11,0.2)",
                              color: "var(--color-gold-light)",
                            }}
                          >
                            épuisé
                          </span>
                        )}
                      </p>
                      <p className="text-xs opacity-70 mt-0.5">
                        {p.redemptions}
                        {p.maxRedemptions ? ` / ${p.maxRedemptions}` : ""}{" "}
                        utilisation{p.redemptions > 1 ? "s" : ""}
                        {p.planSlug ? ` · plan ${p.planSlug}` : " · tous plans"}
                        {p.description ? ` · ${p.description.slice(0, 40)}${p.description.length > 40 ? "…" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs opacity-60 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden
                  >
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-[rgba(167,139,250,0.15)]">
                  <PromoForm
                    planSlugs={planSlugs}
                    promo={{
                      id: p.id,
                      code: p.code,
                      description: p.description,
                      percentOff: p.percentOff,
                      amountOffCents: p.amountOffCents,
                      planSlug: p.planSlug,
                      giftPlanSlug: p.giftPlanSlug,
                      maxRedemptions: p.maxRedemptions,
                      redemptions: p.redemptions,
                      expiresAt: p.expiresAt,
                      isActive: p.isActive,
                    }}
                  />
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
