import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Utilisateurs",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      createdAt: true,
      _count: { select: { quizzes: true } },
    },
  });

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
            👥 Utilisateurs
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
            {users.length} dernier{users.length > 1 ? "s" : ""} inscrit
            {users.length > 1 ? "s" : ""} (limite 200)
          </p>
        </div>
      </header>

      <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(0,0,0,0.25)] text-xs uppercase tracking-wide text-[var(--color-gold)]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nom</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Rôle</th>
                <th className="text-right px-4 py-3 font-semibold">Quizz</th>
                <th className="text-left px-4 py-3 font-semibold">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center opacity-70"
                  >
                    Aucun utilisateur.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[rgba(167,139,250,0.08)] hover:bg-[rgba(167,139,250,0.05)]"
                  >
                    <td className="px-4 py-2.5">{u.name ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs uppercase tracking-wide opacity-80">
                        {u.accountType === "BUSINESS" ? "🏢 Pro" : "👤 Perso"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.role === "ADMIN" ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-[var(--color-gold)]/20 text-[var(--color-gold-light)] border border-[var(--color-gold)]/40 font-semibold uppercase">
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs opacity-60">user</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-display text-[var(--color-gold-light)]">
                      {u._count.quizzes}
                    </td>
                    <td className="px-4 py-2.5 text-xs opacity-70 whitespace-nowrap">
                      {fmtDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs opacity-60">
        💡 Promotion d'un user en ADMIN : passer par SQL pour l'instant
        (V2 : bouton dédié).
      </p>
    </div>
  );
}
