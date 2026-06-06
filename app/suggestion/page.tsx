import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { SuggestionForm } from "@/components/feedback/suggestion-form";
import { SiteFooterNight } from "@/components/legal/site-footer-night";

export const metadata: Metadata = {
  title: "Suggestion d'amélioration",
  description:
    "Une idée, un bug, un retour ? Partage-le avec l'équipe Kuizard, on t'écoute.",
};

export default async function SuggestionPage() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 bg-[var(--color-night)] text-[var(--color-lavender)] relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(85, 35, 187, 0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6">
        <header className="text-center">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-[3px] text-[var(--color-lavender)]"
          >
            Kuizard
          </Link>
        </header>

        <div className="text-center">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
            ✨ Suggestions
          </p>
          <h1 className="font-display text-3xl tracking-wide mb-2">
            Une idée pour Kuizard ?
          </h1>
          <p className="text-sm text-[var(--color-lavender-2)] opacity-80 max-w-md mx-auto">
            Bug, fonctionnalité, retour design, n'importe quoi — on lit tout
            attentivement.
          </p>
        </div>

        <SuggestionForm defaultEmail={session?.user?.email ?? undefined} />

        <p className="text-center text-xs text-[var(--color-lavender-2)] opacity-60">
          ←{" "}
          <Link href="/" className="underline">
            Retour à l'accueil
          </Link>
        </p>
      </div>

      <div className="relative z-10 w-full mt-12">
        <SiteFooterNight />
      </div>
    </main>
  );
}
