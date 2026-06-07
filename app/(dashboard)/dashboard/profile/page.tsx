import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ProfileForm,
  PasswordForm,
} from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Mon profil",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      accountType: true,
      createdAt: true,
      passwordHash: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          👤 Profil
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Mon profil
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Membre depuis le{" "}
          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
            user.createdAt
          )}
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg tracking-wide mb-4">
          Informations
        </h2>
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            accountType: user.accountType,
          }}
        />
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg tracking-wide mb-4">
          🔐 Mot de passe
        </h2>
        {user.passwordHash ? (
          <PasswordForm />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Tu t'es connecté via un fournisseur externe (Google, etc.). Le
            mot de passe se gère côté fournisseur.
          </p>
        )}
      </section>
    </div>
  );
}
