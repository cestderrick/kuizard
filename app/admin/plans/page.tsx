import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatStripeAmount } from "@/lib/stripe/client";
import { PlanForm } from "@/components/admin/plan-form";

export const metadata: Metadata = {
  title: "Admin · Plans & tarifs",
};

export default async function AdminPlansPage() {
  await requireAdmin();

  const plans = await prisma.planConfig.findMany({
    orderBy: [{ displayOrder: "asc" }, { priceCents: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          💳 Plans & tarifs
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Configure les offres uniques et les abonnements. Les changements de
          prix s'appliquent immédiatement aux nouveaux paiements.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Plans existants ({plans.length})
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {plans.map((p) => (
            <li
              key={p.id}
              className={`rounded-lg p-3 border text-sm flex items-center justify-between gap-3 ${
                p.isActive
                  ? "bg-[var(--color-night-2)] border-[rgba(167,139,250,0.15)]"
                  : "bg-[rgba(0,0,0,0.4)] border-[rgba(167,139,250,0.05)] opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {p.isHighlighted && "⭐ "}
                  {p.name}{" "}
                  <span className="opacity-50 font-mono text-xs">
                    ({p.slug})
                  </span>
                </p>
                <p className="text-xs opacity-70">
                  {p.type === "one_shot" ? "💸 One-shot" : `🔁 Abo ${p.interval ?? ""}`}{" "}
                  · {formatStripeAmount(p.priceCents)}
                  {!p.isActive && " · DÉSACTIVÉ"}
                </p>
              </div>
              <a
                href={`#plan-${p.id}`}
                className="text-xs underline opacity-70 hover:opacity-100"
              >
                Éditer ↓
              </a>
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4">
        <summary className="cursor-pointer font-semibold text-sm">
          + Créer un nouveau plan
        </summary>
        <div className="mt-4">
          <PlanForm />
        </div>
      </details>

      <div className="flex flex-col gap-4">
        {plans.map((p) => (
          <div key={p.id} id={`plan-${p.id}`}>
            <PlanForm
              plan={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                tagline: p.tagline,
                description: p.description,
                type: p.type,
                interval: p.interval,
                priceCents: p.priceCents,
                stripePriceId: p.stripePriceId,
                displayOrder: p.displayOrder,
                isActive: p.isActive,
                isHighlighted: p.isHighlighted,
                limits: (p.limits as Record<string, unknown>) ?? {},
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
