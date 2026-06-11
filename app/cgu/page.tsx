import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { CURRENT_TERMS_DATE, CURRENT_TERMS_VERSION } from "@/lib/legal/terms-version";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation (CGU)"
      lastUpdate={`${CURRENT_TERMS_DATE} (version ${CURRENT_TERMS_VERSION})`}
    >
      <p>
        Les présentes Conditions générales d'utilisation (ci-après les
        «&nbsp;CGU&nbsp;») régissent l'utilisation du service{" "}
        <strong>Kuizard</strong>, accessible aux adresses kuizard.fr et
        kuizard.com (ci-après le «&nbsp;Site&nbsp;»), édité par Projiat.
      </p>
      <p>
        En accédant au Site ou en utilisant le service, l'utilisateur reconnaît
        avoir pris connaissance des présentes CGU et les accepter sans réserve.
        Lors de la création de son compte, il marque explicitement son
        acceptation via une case dédiée.
      </p>

      <h2>1. Objet du service</h2>
      <p>
        Kuizard est une plateforme web permettant à des particuliers et à des
        professionnels de créer, partager et animer des quiz personnalisés, à
        l'occasion d'événements (mariages, anniversaires, soirées en bar,
        événements d'entreprise, etc.).
      </p>

      <h2>2. Inscription et compte</h2>
      <p>
        La création d'un compte créateur est <strong>gratuite</strong> et
        nécessite de fournir&nbsp;:
      </p>
      <ul>
        <li>une adresse email valide&nbsp;;</li>
        <li>un mot de passe&nbsp;;</li>
        <li>un pseudo ou un nom affiché.</li>
      </ul>
      <p>
        Pour les comptes professionnels, le SIRET, la raison sociale et le
        numéro de TVA peuvent être demandés en complément.
      </p>
      <p>L'utilisateur s'engage à&nbsp;:</p>
      <ul>
        <li>fournir des informations exactes, à jour et complètes&nbsp;;</li>
        <li>maintenir la confidentialité de son mot de passe&nbsp;;</li>
        <li>
          être seul responsable de toute activité réalisée via son compte.
        </li>
      </ul>
      <p>
        La participation à un quiz en tant que joueur ne requiert pas de compte.
      </p>
      <p>
        L'utilisateur doit être majeur ou, à défaut, utiliser le service sous la
        responsabilité d'une personne majeure.
      </p>
      <p>
        Tout compte peut être supprimé à la demande de l'utilisateur depuis son
        espace «&nbsp;Profil&nbsp;» ou en écrivant à{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>. Projiat peut
        être amené à conserver certaines données liées au compte supprimé pour
        répondre à ses obligations légales ou comptables, conformément à la{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>3. Engagements de l'utilisateur</h2>
      <p>
        L'utilisateur s'engage à respecter la loi et les présentes CGU. À ce
        titre, il s'interdit notamment de&nbsp;:
      </p>
      <ul>
        <li>
          publier ou diffuser tout contenu illicite, diffamatoire, injurieux,
          raciste, haineux, discriminatoire, pornographique, incitant à la
          violence ou portant atteinte à la dignité humaine&nbsp;;
        </li>
        <li>
          publier ou diffuser tout contenu portant atteinte aux droits de
          propriété intellectuelle de tiers (droits d'auteur, marques, etc.)
          sans autorisation&nbsp;;
        </li>
        <li>
          porter atteinte au droit à l'image — toute photo ou vidéo ajoutée à un
          quiz ne doit être utilisée qu'avec l'accord des personnes
          identifiables&nbsp;;
        </li>
        <li>
          utiliser le service à des fins frauduleuses, malveillantes ou pour
          porter atteinte à la sécurité d'autrui&nbsp;;
        </li>
        <li>
          tenter d'accéder à des données qui ne lui appartiennent pas, de
          contourner les mesures de sécurité ou de compromettre l'intégrité ou
          le bon fonctionnement du service (attaque informatique, injection de
          code, etc.).
        </li>
      </ul>
      <p>
        L'utilisateur est responsable des contenus qu'il crée, personnalise et
        diffuse via Kuizard, ainsi que de leurs conséquences auprès des
        participants.
      </p>

      <h2>4. Modération et suspension</h2>
      <p>
        Projiat ne contrôle pas systématiquement l'ensemble des contenus mis en
        ligne par les utilisateurs. Toutefois, Projiat se réserve le droit&nbsp;:
      </p>
      <ul>
        <li>
          de supprimer, sans préavis ni indemnité, tout contenu manifestement
          contraire aux présentes CGU ou à la loi&nbsp;;
        </li>
        <li>
          de suspendre ou résilier, sans préavis ni indemnité, le compte d'un
          utilisateur en cas de violation grave ou répétée des présentes CGU ou
          de comportement portant atteinte au bon fonctionnement du service ou
          aux droits de tiers.
        </li>
      </ul>
      <p>
        Tout utilisateur peut signaler un contenu problématique en écrivant à{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        Projiat met tout en œuvre pour assurer l'accès et le bon fonctionnement
        du service Kuizard. Toutefois, l'utilisateur reconnaît que&nbsp;:
      </p>
      <ul>
        <li>
          le service est fourni «&nbsp;en l'état&nbsp;» («&nbsp;as is&nbsp;»)
          et en fonction de sa disponibilité&nbsp;;
        </li>
        <li>
          Projiat ne peut garantir l'absence totale d'erreurs, de pannes,
          d'interruptions, de défauts de sécurité ou de virus&nbsp;;
        </li>
        <li>
          des opérations de maintenance, mises à jour ou évolutions peuvent
          entraîner des interruptions temporaires du service.
        </li>
      </ul>
      <p>En conséquence, Projiat ne pourra être tenu responsable&nbsp;:</p>
      <ul>
        <li>
          des interruptions ponctuelles du service (maintenance, panne, mise à
          jour, force majeure, fait d'un tiers, etc.)&nbsp;;
        </li>
        <li>
          des dommages indirects, immatériels ou prévisibles (perte de données,
          perte de chance, préjudice commercial, etc.) résultant de
          l'utilisation ou de l'impossibilité d'utiliser le service&nbsp;;
        </li>
        <li>
          du contenu des quiz et informations créés ou diffusés par les
          utilisateurs, dont ces derniers demeurent seuls responsables.
        </li>
      </ul>

      <h2>6. Propriété intellectuelle et contenus utilisateurs</h2>
      <p>
        Le code source, le design, le nom et le logo Kuizard, ainsi que
        l'ensemble des éléments composant le Site (textes, images, graphismes,
        vidéos, sons, structure, etc.), sont la propriété exclusive de Projiat,
        sauf mention contraire.
      </p>
      <p>
        Toute reproduction, représentation, adaptation, traduction, modification
        ou exploitation, totale ou partielle, du Site ou de l'un de ses
        éléments, sans l'autorisation écrite préalable de Projiat, est
        interdite.
      </p>
      <p>
        Les contenus (notamment quiz, questions, textes, images, photos,
        visuels) créés par les utilisateurs via le service restent la propriété
        de leurs auteurs.
      </p>
      <p>
        En mettant en ligne des contenus sur Kuizard, l'utilisateur concède à
        Projiat, pour les besoins exclusifs du fonctionnement du service&nbsp;:
      </p>
      <ul>
        <li>
          une licence non exclusive, mondiale, gratuite&nbsp;;
        </li>
        <li>
          pour la durée de mise en ligne des contenus sur le service.
        </li>
      </ul>
      <p>Cette licence autorise Projiat à&nbsp;:</p>
      <ul>
        <li>
          héberger, stocker, reproduire techniquement et représenter ces
          contenus sur le Site&nbsp;;
        </li>
        <li>
          les communiquer et les rendre accessibles aux autres utilisateurs et
          aux participants aux quiz concernés&nbsp;;
        </li>
        <li>
          effectuer les adaptations techniques nécessaires à leur affichage et à
          leur bon fonctionnement (redimensionnement d'images, compression,
          etc.).
        </li>
      </ul>
      <p>
        L'utilisateur garantit disposer de tous les droits nécessaires sur les
        contenus qu'il met en ligne et garantit Projiat contre toute réclamation
        ou action d'un tiers liée à ces contenus.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données personnelles des utilisateurs et des visiteurs
        du Site (création de compte, gestion des quiz, statistiques, paiements,
        etc.) est détaillé dans la{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>
      <p>
        L'utilisateur est invité à la consulter pour obtenir des informations
        complètes sur les traitements réalisés et sur ses droits.
      </p>

      <h2>8. Modification des CGU</h2>
      <p>
        Projiat se réserve le droit de modifier à tout moment les présentes
        CGU, notamment pour tenir compte de l'évolution du service ou de la
        législation applicable.
      </p>
      <p>
        En cas de modification substantielle, les utilisateurs disposant d'un
        compte&nbsp;:
      </p>
      <ul>
        <li>
          sont informés par email et par une notification sur le Site&nbsp;;
        </li>
        <li>
          devront <strong>ré-accepter explicitement</strong> les nouvelles CGU
          lors de leur prochaine connexion, via une page dédiée&nbsp;;
        </li>
        <li>
          ne pourront accéder à leur espace tant que cette ré-acceptation n'a
          pas été effectuée.
        </li>
      </ul>
      <p>
        La version applicable est identifiée par un numéro (
        <code>{CURRENT_TERMS_VERSION}</code> à ce jour). L'historique des
        acceptations de chaque utilisateur (version, date, adresse IP) est
        conservé à des fins de preuve.
      </p>

      <h2>9. Loi applicable et juridiction compétente</h2>
      <p>Les présentes CGU sont soumises au droit français.</p>
      <p>
        En cas de litige relatif à l'interprétation ou l'exécution des présentes
        CGU, et à défaut de résolution amiable, les tribunaux français
        compétents seront seuls compétents.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative au service Kuizard ou aux présentes CGU,
        écris-nous à{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
      </p>
    </LegalLayout>
  );
}
