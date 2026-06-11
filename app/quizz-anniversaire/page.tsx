import type { Metadata } from "next";
import { UseCasePage } from "@/components/use-case/use-case-page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizz anniversaire personnalisé — questions sur la personne fêtée",
  description:
    "Crée un quizz anniversaire personnalisé : 18 ans, 30 ans, 40 ans, 50 ans, 70 ans. Questions sur la personne fêtée, QR code à scanner, classement, lots. Anniversaire inoubliable.",
  alternates: { canonical: `${BASE_URL}/quizz-anniversaire` },
  openGraph: {
    title: "Quizz anniversaire — combien tu connais bien la personne fêtée ?",
    description:
      "Quizz personnalisé sur la personne fêtée. QR code à scanner. Idéal pour 18, 30, 40, 50 ans et au-delà.",
    url: `${BASE_URL}/quizz-anniversaire`,
  },
};

export default function Page() {
  return (
    <UseCasePage
      config={{
        slug: "quizz-anniversaire",
        emoji: "🎉",
        eyebrow: "Quizz anniversaire",
        h1: "Le quizz anniversaire qui fait briller la personne fêtée",
        intro:
          "30, 40, 50, 70 ans — peu importe l'âge, un quizz personnalisé sur l'invité d'honneur transforme une soirée d'anniversaire ordinaire en moment mémorable. Prépare les questions avec ses proches, génère le QR code, et toute la salle joue ensemble depuis son téléphone. Plus besoin de chercher une animation : ton quizz devient le clou de la soirée.",
        benefits: [
          {
            icon: "🎂",
            title: "Adapté à tous les âges",
            desc: "18 ans, 30 ans, 70 ans : tu choisis les questions selon la personne. Anecdotes d'enfance, voyages, passions, manies — tout passe.",
          },
          {
            icon: "👥",
            title: "Famille + amis ensemble",
            desc: "Mode équipes (famille vs amis, génération vs génération) pour pimenter l'ambiance. Le grand classique qui marche toujours.",
          },
          {
            icon: "🏆",
            title: "Discours bonus du gagnant",
            desc: "Le gagnant doit faire un discours sur la personne fêtée. Un grand classique qui crée des moments d'émotion.",
          },
        ],
        sampleQuestions: [
          "Quel était son premier métier d'été ?",
          "Quelle est son plus grand échec professionnel raconté avec humour ?",
          "Quel pays a-t-il toujours rêvé de visiter ?",
          "Quel est son plat doudou quand il est triste ?",
          "Quelle célébrité rencontrerait-il s'il pouvait choisir ?",
          "Quel surnom lui donnait sa grand-mère ?",
          "Quel est son défaut le plus avoué ?",
          "Quel film peut-il regarder en boucle sans s'en lasser ?",
          "Quelle chanson dansait-il à 20 ans à toutes les soirées ?",
          "Qu'est-ce qu'il rêverait de faire à la retraite ?",
        ],
        whyKuizard: [
          "Crée ton quizz en 5 minutes — un titre, des questions, une couleur, c'est plié.",
          "Mode live : tu pilotes pendant l'apéro, le diner, le dessert — à toi de gérer le rythme.",
          "Mode créneau ouvert : tes invités jouent toute la soirée à leur rythme, le classement se met à jour en temps réel.",
          "Personnalise avec sa couleur préférée, une photo de couverture, un message d'intro.",
          "Imprime le QR code sur l'invitation ou sur la décoration de table.",
          "Conservation 2 mois après l'évènement — parfait pour partager le classement avec les absents.",
        ],
        internalLinks: [
          { label: "Voir tous les tarifs", href: "/tarifs" },
          { label: "Idée pour un EVJF ?", href: "/quizz-evjf" },
          { label: "Idée pour un mariage ?", href: "/quizz-mariage" },
        ],
      }}
    />
  );
}
