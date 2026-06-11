import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdate="11 juin 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>Kuizard</strong> est édité par&nbsp;:
      </p>
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
          <strong>SIRET&nbsp;:</strong> <em>10404270000013</em>.
        </li>
        <li>
          <strong>TVA&nbsp;:</strong> TVA non applicable, article 293 B du Code
          général des impôts (franchise en base de TVA).
        </li>
        <li>
          <strong>Email&nbsp;:</strong>{" "}
          <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
        </li>
        <li>
          <strong>Directeur de la publication&nbsp;:</strong> Cédric Ghironzi, en
          qualité d'éditeur du site.
        </li>
      </ul>

      <h2>2. Hébergeur</h2>
      <p>Le site Kuizard est hébergé par&nbsp;:</p>
      <ul>
        <li>
          <strong>OVH SAS</strong>.
        </li>
        <li>2 rue Kellermann, 59100 Roubaix, France.</li>
        <li>
          Site web&nbsp;:{" "}
          <a
            href="https://www.ovh.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            ovh.com
          </a>
          .
        </li>
        <li>Téléphone&nbsp;: 1007 (numéro non surtaxé).</li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments composant le site Kuizard (notamment textes,
        graphismes, logo, icônes, images, vidéos, logiciels, architecture du
        site, code source) est, sauf mention contraire, la propriété exclusive
        de Projiat.
      </p>
      <p>
        Toute reproduction, représentation, modification, adaptation, diffusion
        ou exploitation, totale ou partielle, du site ou de l'un de ses
        éléments, par quelque procédé que ce soit, sans l'autorisation écrite
        préalable de Projiat, est interdite et est susceptible de constituer une
        contrefaçon au sens du Code de la propriété intellectuelle.
      </p>
      <p>
        Les contenus (notamment quiz, questions, textes, images) créés par les
        utilisateurs via le site restent la propriété de leurs auteurs, sous
        réserve des droits que ceux-ci concèdent à Projiat pour les besoins du
        fonctionnement du service, tels que précisés dans les{" "}
        <Link href="/cgu">Conditions générales d'utilisation</Link>.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Les informations relatives au traitement des données personnelles des
        utilisateurs et des visiteurs du site Kuizard sont détaillées dans la{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Les modalités d'utilisation des cookies et autres traceurs sur le site
        Kuizard sont précisées dans la{" "}
        <Link href="/cookies">Politique de cookies</Link>.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question, écris-nous à&nbsp;:{" "}
        <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>.
      </p>
    </LegalLayout>
  );
}
