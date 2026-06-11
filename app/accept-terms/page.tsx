import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LegalLayout } from "@/components/legal/legal-layout";
import { CURRENT_TERMS_DATE, CURRENT_TERMS_VERSION } from "@/lib/legal/terms-version";
import { needsTermsReacceptance } from "@/lib/legal/acceptance";
import { AcceptTermsForm } from "@/components/legal/accept-terms-form";

export const metadata: Metadata = {
  title: "Acceptation des CGU/CGV",
  robots: { index: false, follow: false },
};

export default async function AcceptTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAcceptedTermsVersion: true },
  });
  if (!user) redirect("/login");

  // Si déjà à jour, on n'a rien à faire ici → redirect vers le next ou
  // le dashboard
  const { next } = await searchParams;
  if (!needsTermsReacceptance(user.lastAcceptedTermsVersion)) {
    redirect(next && next.startsWith("/") ? next : "/dashboard");
  }

  const isFirstAcceptance = !user.lastAcceptedTermsVersion;

  return (
    <LegalLayout
      title="Acceptation des conditions"
      lastUpdate={`${CURRENT_TERMS_DATE} (version ${CURRENT_TERMS_VERSION})`}
    >
      {isFirstAcceptance ? (
        <p>
          <strong>Bienvenue !</strong> Avant d'accéder à ton espace, nous avons
          besoin que tu acceptes nos Conditions générales d'utilisation (CGU)
          et nos Conditions générales de vente (CGV).
        </p>
      ) : (
        <p>
          Nos <strong>CGU</strong> et/ou <strong>CGV</strong> ont été mises à
          jour. Pour continuer à utiliser Kuizard, nous avons besoin que tu
          acceptes la nouvelle version (
          <code>{CURRENT_TERMS_VERSION}</code>).
        </p>
      )}

      <p>
        Tu peux consulter le détail de ces documents avant d'accepter&nbsp;:
      </p>
      <ul>
        <li>
          <Link href="/cgu" target="_blank" rel="noopener noreferrer">
            Conditions générales d'utilisation (CGU)
          </Link>
        </li>
        <li>
          <Link href="/cgv" target="_blank" rel="noopener noreferrer">
            Conditions générales de vente (CGV)
          </Link>
        </li>
        <li>
          <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">
            Politique de confidentialité
          </Link>
        </li>
      </ul>

      <p>
        Une fois validée, ton acceptation sera enregistrée avec la date,
        l'adresse IP et la version (à des fins de preuve).
      </p>

      <AcceptTermsForm nextPath={next} />
    </LegalLayout>
  );
}
