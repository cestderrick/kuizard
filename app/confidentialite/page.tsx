import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      lastUpdate="3 juin 2026"
    >
      <p>
        Cette page explique <strong>ce qu'on collecte</strong>,{" "}
        <strong>pourquoi</strong> et <strong>combien de temps</strong> on le
        conserve. On essaie de rester concis et clair.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Projiat (micro-entreprise) — voir{" "}
        <a href="/mentions-legales">mentions légales</a> pour les coordonnées.
      </p>

      <h2>Données collectées</h2>

      <h3>1. Création de compte</h3>
      <p>Quand tu crées un compte créateur, on collecte :</p>
      <ul>
        <li>Ton email</li>
        <li>Ton nom (ou pseudo)</li>
        <li>Ton mot de passe (stocké hashé avec bcrypt, jamais en clair)</li>
        <li>Le type de compte (particulier ou pro)</li>
      </ul>

      <h3>2. Création de quizz</h3>
      <p>
        Tout ce que tu saisis dans tes quizz (titre, questions, photos, lots,
        thème, dates) est conservé pour te permettre de les éditer et les
        partager.
      </p>

      <h3>3. Participation à un quizz</h3>
      <p>Quand tu joues à un quizz (sans compte), on collecte :</p>
      <ul>
        <li>Ton pseudo (saisi par toi)</li>
        <li>Tes réponses</li>
        <li>Ton score calculé</li>
        <li>
          Un cookie temporaire (<code>kz_play_*</code>) pour t'identifier sur
          ce quizz précis
        </li>
      </ul>
      <p>
        On ne collecte <strong>pas</strong> ton email, ton IP, ton appareil ou
        toute autre donnée personnelle au-delà du pseudo et des réponses.
      </p>

      <h3>4. Pas de tracking publicitaire</h3>
      <p>
        Kuizard n'utilise <strong>aucun tracker publicitaire</strong>, aucun
        Google Analytics, aucun Facebook Pixel. Nos cookies sont uniquement
        techniques (session, csrf, identifiant de participation).
      </p>

      <h2>Finalités</h2>
      <ul>
        <li>Te permettre de créer, gérer et partager tes quizz</li>
        <li>Calculer les scores et afficher les classements</li>
        <li>
          Te facturer si tu choisis une offre payante (via Stripe — voir
          ci-dessous)
        </li>
        <li>Te répondre si tu nous écris</li>
      </ul>

      <h2>Durée de conservation</h2>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Compte créateur (email, nom)</td>
            <td>Jusqu'à suppression de ton compte</td>
          </tr>
          <tr>
            <td>Quizz et participations (offre Découverte)</td>
            <td>1 mois après publication</td>
          </tr>
          <tr>
            <td>Quizz et participations (offre Essentiel/Festif/Magique)</td>
            <td>2 mois après publication</td>
          </tr>
          <tr>
            <td>Quizz et participations (offre Bar)</td>
            <td>6 mois après publication</td>
          </tr>
          <tr>
            <td>Photos uploadées</td>
            <td>1 mois après la fin du quizz puis suppression auto</td>
          </tr>
          <tr>
            <td>Logs serveur (PM2, nginx)</td>
            <td>7 jours puis rotation</td>
          </tr>
          <tr>
            <td>Données de facturation (paiements Stripe)</td>
            <td>10 ans (obligation comptable)</td>
          </tr>
        </tbody>
      </table>

      <h2>Sous-traitants</h2>
      <ul>
        <li>
          <strong>OVH</strong> (France) — hébergement serveur + base de données
        </li>
        <li>
          <strong>Cloudflare</strong> — DNS, protection DDoS, CDN
        </li>
        <li>
          <strong>Stripe</strong> — traitement des paiements
        </li>
      </ul>

      <h2>Tes droits (RGPD)</h2>
      <p>Tu peux à tout moment :</p>
      <ul>
        <li>Accéder à tes données (sur ton tableau de bord)</li>
        <li>
          Demander la rectification ou la suppression en écrivant à{" "}
          <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>
        </li>
        <li>
          Déposer une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            cnil.fr
          </a>
          )
        </li>
      </ul>

      <h2>Sécurité</h2>
      <p>
        Les mots de passe sont hashés (bcrypt). Le site est en HTTPS (TLS 1.2
        et 1.3). Les sauvegardes de la base sont chiffrées. L'accès au serveur
        est restreint par clé SSH.
      </p>

      <hr />
      <p className="text-sm italic text-muted-foreground">
        Cette politique est rédigée sur la base de notre stack technique
        réelle. À relire par un avocat avant lancement public si tu veux la
        sécurité juridique maximale.
      </p>
    </LegalLayout>
  );
}
