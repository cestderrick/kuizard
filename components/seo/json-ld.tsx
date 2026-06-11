/**
 * Composant utilitaire pour injecter du JSON-LD (Schema.org) dans le <head>
 * d'une page. Next.js gère bien `<script type="application/ld+json">` même
 * placé dans le body — le crawler Googlebot l'exécute correctement.
 */
export function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      // Sérialisation safe : on échappe les < pour éviter d'injecter une
      // fermeture de script malicieuse si jamais on a une string contenant
      // "</script>" dans les données.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
