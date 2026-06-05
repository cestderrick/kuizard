import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <LegalLayout
      title="Conditions générales de vente (CGV)"
      lastUpdate="3 juin 2026"
    >
      <p>
        Les présentes CGV régissent les ventes de prestations payantes
        proposées par <strong>Projiat</strong> sur le site Kuizard
        (kuizard.fr).
      </p>

      <h2>1. Vendeur</h2>
      <ul>
        <li>
          <strong>Projiat</strong> — Micro-entreprise individuelle
        </li>
        <li>Cédric Ghironzi</li>
        <li><em>[À COMPLÉTER : adresse, SIRET]</em></li>
        <li>Email : <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a></li>
      </ul>

      <h2>2. Produits et tarifs</h2>
      <p>
        Kuizard propose des offres à l'unité et des abonnements pour
        professionnels. Tous les prix sont indiqués en euros, TTC (TVA
        applicable selon régime micro-entreprise — TVA non applicable, art. 293
        B du CGI).
      </p>

      <h3>Offres à l'unité (particuliers)</h3>
      <ul>
        <li>
          <strong>Découverte</strong> : gratuit (5 questions, 15 joueurs, 1
          mois de conservation)
        </li>
        <li>
          <strong>Essentiel</strong> : 5 € — 20 questions, 30 joueurs, photos,
          2 mois
        </li>
        <li>
          <strong>Festif</strong> : 10 € — 50 questions, 100 joueurs, classement
          + lots, 2 mois
        </li>
        <li>
          <strong>Magique</strong> : 15 € — illimité, vidéos courtes, animations
          premium
        </li>
      </ul>

      <h3>Abonnements (pros)</h3>
      <ul>
        <li>
          <strong>Bar Essentiel</strong> : 25 €/mois ou 250 €/an
        </li>
        <li>
          <strong>Bar Pro</strong> : 50 €/mois ou 500 €/an
        </li>
      </ul>
      <p>
        Les abonnements annuels offrent 2 mois (économie comparée à 12 mois
        au tarif mensuel).
      </p>

      <h2>3. Commande et paiement</h2>
      <ul>
        <li>
          La commande s'effectue depuis l'espace créateur, en sélectionnant un
          palier puis en validant via Stripe Checkout.
        </li>
        <li>
          Les paiements sont traités par <strong>Stripe Payments Europe Ltd.</strong>{" "}
          (CB, Apple Pay, Google Pay selon disponibilité).
        </li>
        <li>
          Une facture PDF est générée automatiquement et accessible depuis
          l'espace créateur.
        </li>
        <li>
          Les codes promos éventuels sont à saisir au moment du paiement et ne
          sont pas cumulables sauf mention contraire.
        </li>
      </ul>

      <h2>4. Activation du service</h2>
      <p>
        Pour les offres à l'unité : l'activation du palier est immédiate après
        validation du paiement.
      </p>
      <p>
        Pour les abonnements : reconduction automatique chaque période
        (mensuelle ou annuelle), résiliable à tout moment depuis l'espace
        client. La résiliation prend effet à la fin de la période en cours
        (pas de remboursement au prorata).
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément à l'article L221-28 du Code de la consommation, l'usage
        du service constitue un contenu numérique fourni sans support
        matériel, dont l'exécution commence dès l'achat avec l'accord de
        l'acheteur. <strong>Le droit de rétractation ne s'applique donc pas
        dès lors que la prestation a commencé</strong> (génération du quizz,
        accès aux fonctionnalités payantes).
      </p>
      <p>
        Le client renonce expressément à son droit de rétractation au moment
        de la validation du paiement.
      </p>

      <h2>6. Garantie</h2>
      <p>
        Projiat met tout en œuvre pour assurer la disponibilité du service.
        En cas d'indisponibilité majeure imputable à Projiat (&gt; 24 h
        consécutives), le client peut demander un avoir au prorata.
      </p>

      <h2>7. Données et confidentialité</h2>
      <p>
        Voir la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>8. Litiges</h2>
      <p>
        En cas de litige, le client est invité à contacter Projiat à{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a> pour
        rechercher une solution amiable. À défaut, les tribunaux français
        seront compétents.
      </p>
      <p>
        Le client consommateur peut également recourir gratuitement à un
        médiateur de la consommation (voir{" "}
        <a
          href="https://www.economie.gouv.fr/mediation-conso"
          target="_blank"
          rel="noopener noreferrer"
        >
          economie.gouv.fr/mediation-conso
        </a>
        ).
      </p>

      <hr />
      <p className="text-sm italic text-muted-foreground">
        Template construit sur la base du modèle de l'auto-entreprise française.
        À faire relire par un avocat avant lancement public, surtout les
        clauses sur la TVA et la rétractation. Numéro SIRET à compléter.
      </p>
    </LegalLayout>
  );
}
