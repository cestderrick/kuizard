import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité de Kuizard"
      lastUpdate="11 juin 2026"
    >
      <p>
        Cette page explique quelles données nous collectons, pourquoi, pendant
        combien de temps et quels sont tes droits.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données personnelles collectées via le
        site Kuizard (kuizard.fr / kuizard.com) est&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Projiat</strong> — entreprise individuelle (micro-entrepreneur).
        </li>
        <li>
          <strong>Titulaire&nbsp;:</strong> Cédric Ghironzi.
        </li>
        <li>
          <strong>Coordonnées complètes&nbsp;:</strong> voir les{" "}
          <Link href="/mentions-legales">Mentions légales</Link>.
        </li>
      </ul>
      <p>
        Email de contact pour les questions liées aux données personnelles&nbsp;:{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
      </p>

      <h2>2. Données collectées</h2>

      <h3>2.1. Création de compte créateur</h3>
      <p>Lorsque tu crées un compte créateur, nous collectons&nbsp;:</p>
      <ul>
        <li>ton email&nbsp;;</li>
        <li>ton nom ou pseudo&nbsp;;</li>
        <li>
          ton mot de passe (stocké hashé avec bcrypt, jamais en clair)&nbsp;;
        </li>
        <li>le type de compte (particulier ou professionnel)&nbsp;;</li>
        <li>
          le SIRET, la raison sociale et le numéro de TVA — uniquement si compte
          professionnel.
        </li>
      </ul>

      <h3>2.2. Création de quiz</h3>
      <p>Lorsque tu crées et gères tes quiz, nous conservons&nbsp;:</p>
      <ul>
        <li>le titre du quiz&nbsp;;</li>
        <li>les questions, réponses, messages, thèmes&nbsp;;</li>
        <li>
          les photos éventuellement ajoutées (pour des questions illustrées,
          stockées sur Cloudflare R2)&nbsp;;
        </li>
        <li>
          les lots et informations d'organisation (dates, événements, etc.).
        </li>
      </ul>
      <p>
        Ces données sont nécessaires pour te permettre de créer, éditer, tester
        et partager tes quiz.
      </p>

      <h3>2.3. Participation à un quiz (joueurs)</h3>
      <p>
        Lorsque tu participes à un quiz <em>sans compte</em>, nous collectons
        uniquement&nbsp;:
      </p>
      <ul>
        <li>le pseudo que tu saisis pour jouer&nbsp;;</li>
        <li>tes réponses aux questions&nbsp;;</li>
        <li>ton score calculé&nbsp;;</li>
        <li>
          un cookie temporaire (<code>kz_play_&lt;quizId&gt;</code>) pour
          t'identifier sur ce quiz précis (conservation de ton score, prévention
          du re-jeu, etc.).
        </li>
      </ul>
      <p>
        Nous ne collectons pas ton email, ton adresse IP, ni des informations
        techniques détaillées sur ton appareil dans ce cadre, au-delà de ce qui
        est strictement nécessaire au fonctionnement technique du site.
      </p>

      <h3>2.4. Cookies et traceurs</h3>
      <p>
        Kuizard n'utilise aucun tracker publicitaire, pas de Google Analytics,
        pas de Facebook Pixel. Les seuls cookies posés sont techniques (session,
        CSRF, participation, langue).
      </p>
      <p>
        Pour le détail complet, consulte la{" "}
        <Link href="/cookies">Politique de cookies</Link>.
      </p>

      <h2>3. Finalités et bases légales</h2>
      <p>Nous utilisons tes données uniquement pour&nbsp;:</p>
      <ul>
        <li>te permettre de créer, gérer et partager tes quiz&nbsp;;</li>
        <li>
          permettre la participation des joueurs, le calcul des scores et
          l'affichage des classements&nbsp;;
        </li>
        <li>
          gérer la facturation et les paiements si tu choisis une offre payante
          (via Stripe)&nbsp;;
        </li>
        <li>
          t'envoyer les emails transactionnels (confirmation de compte, facture,
          notification de quiz, etc.) via Resend&nbsp;;
        </li>
        <li>répondre à tes demandes de contact ou de support.</li>
      </ul>
      <p>Bases légales (RGPD)&nbsp;:</p>
      <ul>
        <li>
          <strong>Exécution du contrat</strong> (art. 6.1.b RGPD) — création et
          gestion de ton compte créateur, gestion de tes quiz, accès aux offres
          payantes souscrites.
        </li>
        <li>
          <strong>Intérêt légitime</strong> (art. 6.1.f RGPD) — sécurisation du
          site, prévention des abus, amélioration du service, gestion technique
          (logs, sécurité serveur).
        </li>
        <li>
          <strong>Obligation légale</strong> (art. 6.1.c RGPD) — conservation
          des données de facturation, comptabilité, lutte contre la fraude.
        </li>
      </ul>

      <h2>4. Durées de conservation</h2>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Durée de conservation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Compte créateur (email, nom/pseudo, type de compte)</td>
            <td>
              Jusqu'à suppression de ton compte (ou inactivité prolongée avec
              information préalable).
            </td>
          </tr>
          <tr>
            <td>Quiz et participations — offre « Découverte »</td>
            <td>1 mois après la fin du quiz.</td>
          </tr>
          <tr>
            <td>
              Quiz et participations — offres « Essentiel / Festif / Magique »
            </td>
            <td>2 mois après la fin du quiz.</td>
          </tr>
          <tr>
            <td>Quiz et participations — abonnements « Bar »</td>
            <td>6 mois après la fin du quiz.</td>
          </tr>
          <tr>
            <td>Photos uploadées (stockées sur Cloudflare R2)</td>
            <td>Selon la durée de l'offre, puis suppression automatique.</td>
          </tr>
          <tr>
            <td>Logs serveur (PM2, nginx)</td>
            <td>Environ 7 jours, puis rotation/écrasement.</td>
          </tr>
          <tr>
            <td>Données de facturation (paiements, factures Stripe)</td>
            <td>
              Jusqu'à 10 ans, pour respecter nos obligations comptables et
              fiscales.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Passés ces délais, les données sont supprimées ou anonymisées lorsqu'elles
        ne sont plus nécessaires.
      </p>

      <h2>5. Sous-traitants et hébergement</h2>
      <p>
        Pour faire fonctionner Kuizard, nous faisons appel à des prestataires
        (sous-traitants au sens du RGPD)&nbsp;:
      </p>
      <ul>
        <li>
          <strong>OVH</strong> (France) — hébergement du serveur et de la base
          de données.{" "}
          <a
            href="https://www.ovh.com/fr/protection-donnees-personnelles/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité OVH
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare</strong> — DNS, protection DDoS, CDN (mise en cache
          et protection réseau).{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité Cloudflare
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare R2</strong> — stockage des photos uploadées dans
          tes quiz.
        </li>
        <li>
          <strong>Stripe</strong> — traitement des paiements (carte bancaire,
          wallets Apple Pay / Google Pay, etc.).{" "}
          <a
            href="https://stripe.com/fr/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité Stripe
          </a>
          .
        </li>
        <li>
          <strong>Resend</strong> — envoi des emails transactionnels
          (inscription, factures, notifications).{" "}
          <a
            href="https://resend.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité Resend
          </a>
          .
        </li>
        <li>
          <strong>API Sirene / INSEE</strong> — vérification du SIRET pour les
          comptes professionnels. Aucune donnée personnelle n'est transmise à
          l'INSEE&nbsp;; seul le SIRET (information publique) est interrogé.
        </li>
      </ul>
      <p>
        Ces prestataires peuvent traiter certaines de tes données pour notre
        compte, dans le cadre strict des services utilisés. Ils appliquent leurs
        propres mesures de sécurité et de conformité (notamment RGPD pour les
        services opérant en Europe).
      </p>

      <h3>5.1. Transferts hors Union européenne</h3>
      <p>
        Certains de ces prestataires (en particulier Stripe, Cloudflare et
        Resend) sont des groupes internationaux pouvant héberger des données
        hors de l'Union européenne. Lorsque c'est le cas, ces transferts sont
        encadrés par les mécanismes prévus par le RGPD (clauses contractuelles
        types, décisions d'adéquation, etc.) mis en place par ces prestataires.
      </p>

      <h2>6. Tes droits (RGPD)</h2>
      <p>
        Conformément au RGPD, tu disposes des droits suivants sur tes données
        personnelles&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Droit d'accès</strong> — obtenir la confirmation que nous
          traitons ou non des données te concernant, et en recevoir une copie.
        </li>
        <li>
          <strong>Droit de rectification</strong> — corriger des données
          inexactes ou incomplètes.
        </li>
        <li>
          <strong>Droit d'effacement (« droit à l'oubli »)</strong> — demander
          la suppression de tes données, dans les limites de nos obligations
          légales (par exemple, conservation des factures).
        </li>
        <li>
          <strong>Droit d'opposition</strong> — t'opposer, pour des raisons
          tenant à ta situation particulière, à certains traitements fondés sur
          notre intérêt légitime.
        </li>
        <li>
          <strong>Droit à la limitation du traitement</strong> — demander que le
          traitement de tes données soit temporairement gelé.
        </li>
        <li>
          <strong>Droit à la portabilité</strong> — récupérer les données que tu
          nous as fournies, dans un format structuré et lisible par machine.
        </li>
      </ul>
      <p>Tu peux exercer ces droits&nbsp;:</p>
      <ul>
        <li>
          en accédant à ton compte créateur (pour certaines données directement
          modifiables depuis le tableau de bord)&nbsp;;
        </li>
        <li>
          ou en nous écrivant à{" "}
          <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
        </li>
      </ul>
      <p>
        Nous pourrons être amenés à te demander un justificatif d'identité en
        cas de doute raisonnable sur ton identité.
      </p>
      <p>
        Tu disposes également du droit d'introduire une réclamation auprès de
        l'autorité de contrôle compétente&nbsp;:
      </p>
      <ul>
        <li>
          <strong>
            CNIL — Commission Nationale de l'Informatique et des Libertés
          </strong>
          .
        </li>
        <li>
          Site web&nbsp;:{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            cnil.fr
          </a>
          .
        </li>
      </ul>

      <h2>7. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles pour
        protéger tes données&nbsp;:
      </p>
      <ul>
        <li>mots de passe hashés avec bcrypt (jamais stockés en clair)&nbsp;;</li>
        <li>
          chiffrement des échanges entre ton navigateur et le site via HTTPS
          (TLS 1.2 / 1.3)&nbsp;;
        </li>
        <li>
          accès au serveur restreint (clé SSH, contrôle des accès
          administrateurs)&nbsp;;
        </li>
        <li>sauvegardes de la base de données chiffrées&nbsp;;</li>
        <li>
          mises à jour régulières des composants techniques et surveillance de
          l'infrastructure.
        </li>
      </ul>
      <p>
        Aucun système n'est parfaitement sécurisé, mais nous faisons tout notre
        possible pour limiter les risques de fuite ou d'accès non autorisé.
      </p>

      <h2>8. Mise à jour de la politique</h2>
      <p>
        La présente politique de confidentialité peut être amenée à évoluer,
        notamment en cas de&nbsp;:
      </p>
      <ul>
        <li>modification du service Kuizard&nbsp;;</li>
        <li>évolution légale ou réglementaire&nbsp;;</li>
        <li>changement de sous-traitants ou de technologies.</li>
      </ul>
      <p>
        En cas de modification importante, nous t'en informerons (par exemple
        via un message sur le site ou un email aux comptes créateurs). La
        version à jour est toujours disponible sur cette page.
      </p>
    </LegalLayout>
  );
}
