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

      <div className="flex flex-col gap-3">
        {promos.length === 0 ? (
          <p className="text-sm opacity-60 italic text-center py-6">
            Aucun code créé pour l'instant.
          </p>
        ) : (
          promos.map((p) => (
            <PromoForm
              key={p.id}
              planSlugs={planSlugs}
              promo={{
                id: p.id,
                code: p.code,
                description: p.description,
                percentOff: p.percentOff,
                amountOffCents: p.amountOffCents,
                planSlug: p.planSlug,
                maxRedemptions: p.maxRedemptions,
                redemptions: p.redemptions,
                expiresAt: p.expiresAt,
                isActive: p.isActive,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
