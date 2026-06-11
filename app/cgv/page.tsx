import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { getActivePlans } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";
import {
  CURRENT_TERMS_DATE,
  CURRENT_TERMS_VERSION,
} from "@/lib/legal/terms-version";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

export default async function CgvPage() {
  // Tarifs lus dynamiquement depuis la table PlanConfig (l'admin peut modifier
  // sans toucher au code). L'historique tarifaire est garanti par les snapshots
  // Stripe (priceCents figé dans Payment, stripePriceId figé dans Subscription).
  const [oneShotPlans, subscriptionPlans] = await Promise.all([
    getActivePlans("one_shot"),
    getActivePlans("subscription"),
  ]);

  return (
    <LegalLayout
      title="Conditions générales de vente (CGV)"
      lastUpdate={`${CURRENT_TERMS_DATE} (version ${CURRENT_TERMS_VERSION})`}
    >
      <p>
        Les présentes Conditions générales de vente (ci-après les «&nbsp;CGV&nbsp;»)
        régissent les ventes de prestations payantes proposées par Projiat sur
        le site <strong>Kuizard</strong>, accessible aux adresses kuizard.fr et
        kuizard.com (ci-après le «&nbsp;Site&nbsp;»).
      </p>
      <p>
        Toute commande passée sur le Site implique l'acceptation pleine et
        entière des présentes CGV. Lors de chaque achat, le client confirme
        explicitement son acceptation des CGV.
      </p>

      <h2>1. Vendeur</h2>
      <p>Les prestations payantes Kuizard sont commercialisées par&nbsp;:</p>
      <ul>
        <li>
          <strong>Projiat</strong> — entreprise individuelle (micro-entrepreneur).
        </li>
        <li>
          <strong>Titulaire&nbsp;:</strong> Cédric Ghironzi.
        </li>
        <li>
          <strong>Adresse&nbsp;:</strong> 8 place Bir-Hakeim, 69003 Lyon, France.
        </li>
        <li>
          <strong>SIRET&nbsp;:</strong> 10404270000013.
        </li>
        <li>
          <strong>Email&nbsp;:</strong>{" "}
          <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
        </li>
        <li>
          <strong>TVA&nbsp;:</strong> TVA non applicable, article 293 B du Code
          général des impôts (franchise en base de TVA).
        </li>
      </ul>

      <h2>2. Produits et tarifs</h2>
      <p>Kuizard propose&nbsp;:</p>
      <ul>
        <li>
          des <strong>offres à l'unité</strong>, destinées aux particuliers et
          aux professionnels organisant un événement ponctuel&nbsp;;
        </li>
        <li>
          des <strong>abonnements mensuels ou annuels</strong>, destinés aux
          particuliers et aux professionnels organisant plusieurs événements par
          an (notamment bars, hôtels, restaurants, lieux événementiels).
        </li>
      </ul>
      <p>
        Les prix sont indiqués en euros. Dans le cadre du régime de la
        micro-entreprise, la TVA n'est pas applicable (article 293 B du CGI)
        — les tarifs affichés sont donc des prix nets.
      </p>

      <h3>2.1. Offres à l'unité</h3>
      {oneShotPlans.length === 0 ? (
        <p>
          <em>(Aucune offre à l'unité active actuellement.)</em>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Offre</th>
              <th>Prix</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {oneShotPlans.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  {p.isHighlighted && <span title="Recommandé"> ⭐</span>}
                </td>
                <td>
                  {p.priceCents === 0
                    ? "Gratuit"
                    : formatStripeAmount(p.priceCents)}
                </td>
                <td>{p.description ?? p.tagline ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>2.2. Abonnements</h3>
      {subscriptionPlans.length === 0 ? (
        <p>
          <em>(Aucun abonnement actif actuellement.)</em>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Offre</th>
              <th>Prix</th>
              <th>Période</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionPlans.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  {p.isHighlighted && <span title="Recommandé"> ⭐</span>}
                </td>
                <td>{formatStripeAmount(p.priceCents)}</td>
                <td>{p.interval === "year" ? "Par an" : "Par mois"}</td>
                <td>{p.description ?? p.tagline ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        Les abonnements annuels offrent généralement un avantage tarifaire
        équivalant à environ 2 mois offerts par rapport au paiement mensuel sur
        12 mois.
      </p>
      <p>
        Les caractéristiques détaillées de chaque offre (fonctionnalités,
        limites techniques, durée de conservation des données, etc.) sont
        précisées sur la{" "}
        <Link href="/dashboard/subscription">page d'abonnement</Link> et au
        moment de la commande.
      </p>

      <h3>2.3. Modification des tarifs</h3>
      <p>
        Projiat se réserve le droit de modifier ses tarifs à l'avenir. Les prix
        applicables à toute commande sont ceux <strong>en vigueur au moment de
        la commande</strong>.
      </p>
      <p>Concrètement&nbsp;:</p>
      <ul>
        <li>
          <strong>Offres à l'unité</strong> — le tarif payé est figé dans le
          paiement (notre table <code>Payment</code> conserve le montant exact
          en centimes ainsi que l'identifiant Stripe du paiement). Toute
          modification de tarif s'appliquera aux commandes futures, jamais
          rétroactivement.
        </li>
        <li>
          <strong>Abonnements en cours</strong> — chaque abonnement est rattaché
          à un identifiant de prix Stripe (
          <code>stripePriceId</code>). En cas d'augmentation tarifaire, les
          abonnés actuels continuent à payer leur tarif initial jusqu'à
          résiliation ou modification volontaire de leur abonnement. Le nouveau
          tarif ne s'applique qu'aux nouveaux abonnés.
        </li>
      </ul>
      <p>
        Une baisse de tarif sera, le cas échéant, communiquée par email aux
        abonnés actifs afin qu'ils puissent décider de basculer sur le nouveau
        tarif.
      </p>

      <h2>3. Commande et paiement</h2>
      <p>
        La commande s'effectue depuis l'espace créateur du client, après
        connexion à son compte.
      </p>
      <p>Les paiements sont traités par&nbsp;:</p>
      <ul>
        <li>
          <strong>Stripe Payments Europe Ltd.</strong> — carte bancaire, Apple
          Pay, Google Pay (selon disponibilités techniques).
        </li>
      </ul>
      <p>
        Une facture PDF est générée automatiquement après validation du paiement
        et est accessible depuis l'espace{" "}
        <Link href="/dashboard/payments">Paiements</Link> du client.
      </p>
      <p>
        Les éventuels codes promotionnels sont à saisir au moment du paiement.
        Sauf mention contraire&nbsp;:
      </p>
      <ul>
        <li>ils ne sont pas cumulables entre eux&nbsp;;</li>
        <li>ils ne sont valables que pendant leur période d'application.</li>
      </ul>

      <h2>4. Activation du service et durée</h2>

      <h3>4.1. Offres à l'unité</h3>
      <p>
        Pour les offres à l'unité, l'activation du palier est immédiate après
        validation du paiement (sous réserve du bon encaissement).
      </p>
      <p>
        Chaque offre comporte une durée de conservation des données du quiz
        (par exemple&nbsp;: 1 mois, 2 mois, etc.), indiquée dans la description
        de l'offre. À l'issue de cette durée, les contenus et/ou données
        associés peuvent être supprimés ou archivés selon ce qui est précisé
        sur le Site.
      </p>

      <h3>4.2. Abonnements</h3>
      <p>
        Les abonnements (mensuels ou annuels) prennent effet dès la validation
        du paiement initial et sont conclus pour une durée correspondant à la
        période choisie (un mois ou un an).
      </p>
      <p>
        Les abonnements sont à <strong>reconduction tacite</strong> à chaque
        période (mensuelle ou annuelle), jusqu'à résiliation par le client.
      </p>
      <p>
        La résiliation peut être effectuée à tout moment depuis l'espace{" "}
        <Link href="/dashboard/subscription">Abonnement</Link> du client, qui
        donne accès au portail Stripe. Elle prend effet à la fin de la période
        en cours&nbsp;:
      </p>
      <ul>
        <li>il n'y a pas de remboursement au prorata de la période déjà entamée&nbsp;;</li>
        <li>
          le client conserve l'accès aux fonctionnalités jusqu'à l'échéance de
          la période payée.
        </li>
      </ul>

      <h2>5. Droit de rétractation</h2>

      <h3>5.1. Contenus numériques et renonciation</h3>
      <p>
        Les prestations proposées par Kuizard sont des contenus et services
        numériques fournis sans support matériel, dont l'exécution commence
        immédiatement après la validation de la commande (activation de
        l'offre, accès aux fonctionnalités payantes, génération ou utilisation
        de quiz, etc.).
      </p>
      <p>
        Conformément à l'article L.221-28 du Code de la consommation, le droit
        de rétractation ne s'applique pas aux contrats&nbsp;:
      </p>
      <ul>
        <li>de fourniture de contenus numériques non fournis sur un support matériel&nbsp;;</li>
        <li>lorsque l'exécution a commencé après accord préalable exprès du consommateur&nbsp;;</li>
        <li>et renoncement exprès à son droit de rétractation.</li>
      </ul>
      <p>En validant sa commande, le client consommateur&nbsp;:</p>
      <ul>
        <li>
          reconnaît que l'exécution du service commence immédiatement après le
          paiement&nbsp;;
        </li>
        <li>donne son accord exprès pour ce commencement immédiat&nbsp;;</li>
        <li>renonce expressément à son droit de rétractation.</li>
      </ul>

      <h3>5.2. Clients professionnels</h3>
      <p>
        Pour les clients professionnels, le droit de rétractation ne s'applique
        pas, sauf dispositions particulières impératives.
      </p>

      <h2>6. Garantie de disponibilité</h2>
      <p>
        Projiat met tout en œuvre pour assurer la disponibilité et le bon
        fonctionnement du service Kuizard.
      </p>
      <p>
        En cas d'<strong>indisponibilité majeure</strong> imputable à Projiat
        (interruption continue de plus de 24 heures consécutives du service
        payant souscrit, hors maintenances planifiées, cas de force majeure,
        fait d'un tiers, problème d'accès Internet du client, etc.), le client
        pourra solliciter l'octroi d'un avoir au prorata de la durée
        d'indisponibilité avérée.
      </p>
      <p>
        Toute demande d'avoir doit être adressée à{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>, en décrivant
        la période d'indisponibilité constatée.
      </p>
      <p>
        En tout état de cause, la responsabilité de Projiat est limitée au
        montant effectivement payé par le client au titre de la période
        concernée.
      </p>

      <h2>7. Données personnelles et confidentialité</h2>
      <p>
        Les traitements de données personnelles réalisés dans le cadre des
        commandes, de la gestion des comptes clients et de l'utilisation du
        service Kuizard sont décrits dans la{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>
      <p>
        Le client est invité à la consulter pour connaître le détail des
        traitements mis en œuvre, leurs finalités, leurs durées de
        conservation, ainsi que ses droits (accès, rectification, effacement,
        opposition, limitation, portabilité, etc.).
      </p>

      <h2>8. Litiges, médiation et droit applicable</h2>
      <p>
        En cas de difficulté ou de litige relatif à une commande ou à
        l'exécution d'une prestation, le client est invité à contacter Projiat
        en priorité afin de rechercher une solution amiable, à l'adresse&nbsp;:{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
      </p>
      <p>Les présentes CGV sont soumises au droit français.</p>

      <h3>8.1. Médiation de la consommation (clients consommateurs)</h3>
      <p>
        En l'absence de désignation d'un médiateur spécifique à ce jour, le
        client consommateur peut consulter la liste des médiateurs agréés et,
        le cas échéant, saisir un médiateur compétent pour son secteur&nbsp;:
      </p>
      <ul>
        <li>
          <a
            href="https://www.economie.gouv.fr/mediation-conso"
            target="_blank"
            rel="noopener noreferrer"
          >
            economie.gouv.fr/mediation-conso
          </a>{" "}
          — annuaire officiel des médiateurs de la consommation.
        </li>
        <li>
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>{" "}
          — plateforme européenne de règlement en ligne des litiges (RLL).
        </li>
      </ul>

      <h3>8.2. Juridiction compétente</h3>
      <p>
        À défaut d'accord amiable ou de solution trouvée via la médiation (pour
        les consommateurs), tout litige sera porté devant les tribunaux
        français compétents.
      </p>

      <h2>9. Modification des CGV</h2>
      <p>
        Projiat se réserve le droit de modifier à tout moment les présentes CGV.
        En cas de modification substantielle&nbsp;:
      </p>
      <ul>
        <li>
          les clients sont informés par email et par une notification sur le
          Site&nbsp;;
        </li>
        <li>
          les clients devront <strong>ré-accepter explicitement</strong> les
          nouvelles CGV lors de leur prochaine connexion&nbsp;;
        </li>
        <li>
          les commandes en cours d'exécution restent régies par les CGV en
          vigueur au moment de leur conclusion.
        </li>
      </ul>
      <p>
        La version applicable est identifiée par un numéro (
        <code>{CURRENT_TERMS_VERSION}</code> à ce jour). L'historique des
        acceptations de chaque client (version, date, adresse IP) est conservé
        à des fins de preuve.
      </p>
    </LegalLayout>
  );
}
