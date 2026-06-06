import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "Admin · Module à venir",
};

export default async function AdminComingSoonPage() {
  await requireAdmin();

  return (
    <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-8 text-center">
      <p className="text-5xl mb-4">🪄</p>
      <h1 className="font-display text-2xl tracking-wide text-[var(--color-lavender)] mb-2">
        Module à venir
      </h1>
      <p className="text-sm text-[var(--color-lavender-2)] opacity-80 max-w-md mx-auto">
        Messagerie, gestion des abonnements, du business plan, des codes
        promos et CRUD templates seront ajoutés dans une prochaine itération
        admin (V2). Stripe + Templates dynamiques seront les déclencheurs.
      </p>
    </div>
  );
}
