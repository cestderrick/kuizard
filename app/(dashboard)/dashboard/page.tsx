import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Gère tes quizz Kuizard.",
};

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "magicien(ne)";

  return (
    <div className="flex flex-col gap-8">
      {/* Hero accueil */}
      <section>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          ✨ Bienvenue
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          Salut {userName} !
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Ton espace pour créer, gérer et partager des quizz personnalisés.
        </p>
      </section>

      {/* Mes quizz — état vide pour l'instant */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide">Mes quizz</CardTitle>
          <CardDescription>
            Tu n'as pas encore créé de quizz. Lance-toi !
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="text-6xl" aria-hidden>
            🎩
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Crée ton premier quizz en quelques minutes. Choisis les questions,
            les images, le thème, et partage-le avec un QR code.
          </p>
          <Button
            asChild
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            <Link href="/dashboard/quizzes/new">Créer mon premier quizz ✨</Link>
          </Button>
          <p className="text-xs text-muted-foreground italic">
            (la création arrivera au Sprint 2 — pour l'instant le bouton ne mène
            nulle part)
          </p>
        </CardContent>
      </Card>

      {/* Placeholders Sprint 2/3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base">Mes paiements</CardTitle>
            <CardDescription>Bientôt</CardDescription>
          </CardHeader>
        </Card>
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base">Statistiques</CardTitle>
            <CardDescription>Bientôt</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
