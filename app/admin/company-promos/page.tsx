import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CompanyPromoAdminForm } from "@/components/admin/company-promo-admin-form";

export const metadata: Metadata = {
  title: "Admin · Codes promo société",
};

export default async function AdminCompanyPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const search = (sp.q ?? "").trim();

  // Codes existants (avec compteur d'usages)
  const codes = await prisma.companyPromoCode.findMany({
    where: search
      ? {
          OR: [
            { code: { contains: search.toUpperCase() } },
            {
              user: {
                email: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true, accountType: true } },
      _count: { select: { usages: true } },
    },
  });

  // Liste users BUSINESS pour le select du form
  const businessUsers = await prisma.user.findMany({
    where: { accountType: "BUSINESS" },
    select: { id: true, email: true, name: true, companyName: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🎁 Codes promo société
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Attribue des codes promo aux comptes pros. Ils peuvent ensuite les
          afficher en bandeau de leur quiz.
        </p>
      </header>

      <CompanyPromoAdminForm businessUsers={businessUsers} />

      <form method="GET" action="/admin/company-promos" className="flex gap-2 max-w-xl">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Rechercher par code ou email société…"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.25)] text-[var(--color-lavender)] placeholder:text-[rgba(229,220,245,0.4)] focus:outline-none focus:border-[var(--color-gold)]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          🔎
        </button>
      </form>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-3 py-3">Code</th>
                <th className="text-left px-3 py-3">Société</th>
                <th className="text-left px-3 py-3">Description</th>
                <th className="text-right px-3 py-3">% Off</th>
                <th className="text-right px-3 py-3">Usages</th>
                <th className="text-left px-3 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center opacity-70">
                    Aucun code promo enregistré.
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-[rgba(167,139,250,0.08)]"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs uppercase text-[var(--color-gold-light)]">
                      {c.code}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="opacity-90">
                        {c.user.name ?? "—"}
                      </div>
                      <div className="opacity-60 font-mono">{c.user.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs max-w-[260px] truncate">
                      {c.description}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      {c.discountPercent != null
                        ? `${c.discountPercent}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      {c.currentUses}
                      {c.maxUses != null && `/${c.maxUses}`}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {c.active ? (
                        <span className="text-green-400">✓ Actif</span>
                      ) : (
                        <span className="opacity-60">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
