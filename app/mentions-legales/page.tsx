import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdate="3 juin 2026">
      <h2>Éditeur du site</h2>
      <p>
        <strong>Kuizard</strong> est édité par :
      </p>
      <ul>
        <li>
          <strong>Projiat</strong> — Micro-entreprise individuelle
        </li>
        <li>
          Cédric Ghironzi — <em>[À COMPLÉTER : adresse postale]</em>
        </li>
        <li>SIRET : <em>[À COMPLÉTER]</em></li>
        <li>Email : <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a></li>
        <li>
          Directeur de la publication : Cédric Ghironzi
        </li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :
      </p>
      <ul>
        <li>
          <strong>OVH SAS</strong>
        </li>
        <li>2 rue Kellermann, 59100 Roubaix, France</li>
        <li>
          Site web :{" "}
          <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer">
            ovh.com
          </a>
        </li>
        <li>Téléphone : 1007 (numéro non surtaxé)</li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu du site Kuizard (textes, images, logos, code)
        est la propriété exclusive de Projiat, sauf mention contraire. Toute
        reproduction sans autorisation préalable est interdite.
      </p>
      <p>
        Les contenus créés par les utilisateurs (quizz, questions, photos)
        restent leur propriété. Ils accordent à Kuizard une licence
        d'utilisation non exclusive et limitée à la durée d'hébergement, pour
        permettre l'affichage de leurs contenus aux participants.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question : <a href="mailto:contact@kuizard.fr">contact@kuizard.fr</a>
      </p>

      <hr />
      <p className="text-sm italic text-muted-foreground">
        <strong>À COMPLÉTER avant lancement public :</strong> adresse postale,
        numéro SIRET. Le reste est correct mais ce template gagnera à être relu
        par LegalPlace ou un avocat.
      </p>
    </LegalLayout>
  );
}
