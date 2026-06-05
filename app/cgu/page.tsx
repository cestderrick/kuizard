import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation (CGU)"
      lastUpdate="3 juin 2026"
    >
      <p>
        Les présentes CGU régissent l'usage du service{" "}
        <strong>Kuizard</strong> (kuizard.fr / kuizard.com), édité par Projiat.
        L'utilisation du service implique l'acceptation pleine et entière des
        présentes conditions.
      </p>

      <h2>1. Objet du service</h2>
      <p>
        Kuizard est une plateforme web permettant à des particuliers et à des
        professionnels de créer, partager et animer des quizz personnalisés à
        l'occasion d'événements (mariages, anniversaires, soirées bars, etc.).
      </p>

      <h2>2. Inscription et compte</h2>
      <ul>
        <li>
          La création d'un compte créateur est gratuite et nécessite la
          fourniture d'un email valide, d'un mot de passe et d'un pseudo.
        </li>
        <li>
          L'utilisateur s'engage à fournir des informations exactes et à
          maintenir la confidentialité de son mot de passe.
        </li>
        <li>
          La participation à un quizz en tant que joueur ne requiert pas de
          compte.
        </li>
        <li>
          Tout compte peut être supprimé à la demande de l'utilisateur via{" "}
          <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
        </li>
      </ul>

      <h2>3. Engagements de l'utilisateur</h2>
      <p>L'utilisateur s'engage à :</p>
      <ul>
        <li>
          Ne pas publier de contenu illicite, diffamatoire, raciste, haineux,
          pornographique ou portant atteinte à la dignité humaine
        </li>
        <li>
          Ne pas publier de contenu protégé par le droit d'auteur sans
          autorisation
        </li>
        <li>
          <strong>Respecter le droit à l'image</strong> : toute photo ajoutée à
          un quizz doit avoir reçu l'accord des personnes représentées
        </li>
        <li>
          Ne pas utiliser le service à des fins frauduleuses ou pour porter
          atteinte à la sécurité d'autrui
        </li>
        <li>
          Ne pas tenter d'accéder à des données qui ne lui appartiennent pas,
          ni de compromettre l'intégrité du service
        </li>
      </ul>

      <h2>4. Modération</h2>
      <p>
        Projiat se réserve le droit de supprimer tout contenu contraire aux
        présentes CGU ou à la loi, et de suspendre ou résilier tout compte
        l'enfreignant, sans préavis ni indemnité.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        Projiat met tout en œuvre pour assurer la disponibilité du service,
        mais ne peut être tenu responsable d'interruptions ponctuelles
        (maintenance, panne, force majeure). Le service est fourni{" "}
        <em>« tel quel »</em>, sans garantie d'aptitude à un usage particulier.
      </p>
      <p>
        Projiat n'est pas responsable du contenu créé par les utilisateurs.
        L'utilisateur est seul responsable de ses créations et de leur
        diffusion.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        Le code source, le design, le nom et le logo Kuizard sont la propriété
        exclusive de Projiat. Les contenus créés par les utilisateurs leur
        appartiennent ; ils accordent à Projiat une licence d'usage limitée
        pour permettre la diffusion auprès des participants.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>8. Modification des CGU</h2>
      <p>
        Projiat peut modifier les présentes CGU à tout moment. Les
        utilisateurs seront informés des modifications substantielles par
        email. L'usage continu du service après modification vaut acceptation
        des nouvelles CGU.
      </p>

      <h2>9. Loi applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige
        relèvera de la compétence des tribunaux français.
      </p>

      <h2>10. Contact</h2>
      <p>
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>
      </p>

      <hr />
      <p className="text-sm italic text-muted-foreground">
        Template à faire relire par un avocat ou un service comme LegalPlace
        avant lancement public.
      </p>
    </LegalLayout>
  );
}
