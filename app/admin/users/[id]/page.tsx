import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { StartConvoForm } from "@/components/admin/start-convo-form";

export const metadata: Metadata = {
  title: "Admin · Profil utilisateur",
};

type Params = Promise<{ id: string }>;

export default async function AdminUserDetailPage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          quizzes: true,
          conversations: true,
          payments: true,
          subscriptions: true,
        },
      },
    },
  });
  if (!user) notFound();

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/users"
        className="text-sm text-[var(--color-lavender-2)] hover:text-[var(--color-gold)]"
      >
        ← Utilisateurs
      </Link>

      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          👤 {user.name ?? "Sans nom"}
        </h1>
        <p className="text-sm opacity-80 mt-1 font-mono">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {user.role === "ADMIN" && (
            <span className="px-2 py-1 rounded-md bg-[var(--color-gold)]/20 text-[var(--color-gold-light)] border border-[var(--color-gold)]/40 font-semibold uppercase">
              Admin
            </span>
          )}
          <span className="px-2 py-1 rounded-md bg-[rgba(167,139,250,0.15)] border border-[rgba(167,139,250,0.3)]">
            {user.accountType === "BUSINESS" ? "🏢 Pro" : "👤 Perso"}
          </span>
          <span className="px-2 py-1 rounded-md bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.15)]">
            Inscrit le {fmt(user.createdAt)}
          </span>
        </div>

        {/* Fiche entreprise si compte pro */}
        {user.accountType === "BUSINESS" && (user.siret || user.companyName) && (
          <div className="mt-4 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-night-2)] p-4 text-sm">
            <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold mb-2">
              🏢 Entreprise
            </p>
            <p className="font-display">{user.companyName ?? "—"}</p>
            <p className="text-xs opacity-80 mt-1 font-mono">
              SIRET : {user.siret ?? "—"}
            </p>
            {user.vatNumber && (
              <p className="text-xs opacity-80 font-mono">
                TVA : {user.vatNumber}
              </p>
            )}
          </div>
        )}
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Quizz créés" value={user._count.quizzes} />
        <Stat label="Conversations" value={user._count.conversations} />
        <Stat label="Paiements" value={user._count.payments} />
        <Stat label="Abos" value={user._count.subscriptions} />
      </section>

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
        <h2 className="font-display text-lg tracking-wide mb-4 text-[var(--color-lavender)]">
          ✉️ Envoyer un message
        </h2>
        <StartConvoForm userId={user.id} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-3">
      <p className="text-[10px] uppercase tracking-wider opacity-60">{label}</p>
      <p className="font-display text-2xl text-[var(--color-gold-light)]">
        {value}
      </p>
    </div>
  );
}
