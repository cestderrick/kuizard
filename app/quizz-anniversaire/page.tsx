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
        howTo: {
          name: "Comment animer un anniversaire avec un quizz personnalisé",
          description: "Le quizz qui réunit toutes les générations autour du même jeu.",
          totalTime: "PT10M",
          steps: [
                    {
                              name: "Crée ton compte Kuizard gratuit",
                              text: "30 secondes, juste un email."
                    },
                    {
                              name: "Recueille des questions sur la personne fêtée",
                              text: "Demande aux proches : enfance, métier, voyages, anecdotes secrètes."
                    },
                    {
                              name: "Mélange questions persos et culture générale",
                              text: "Pour que les plus jeunes et les plus âgés trouvent leur compte, alterne questions sur la personne et culture générale."
                    },
                    {
                              name: "Imprime ton QR code à mettre sur les tables",
                              text: "Affiche A4 prête à imprimer fournie par Kuizard."
                    },
                    {
                              name: "Lance le quizz au milieu du repas",
                              text: "Idéal après l'entrée — l'attention est au max, et ça aide à la digestion."
                    }
          ]
},
        faqs: [
          {
                    question: "À partir de quel âge peut-on jouer ?",
                    answer: "Dès que les enfants savent lire et utiliser un smartphone (env. 7-8 ans). Pour les plus petits, ils jouent en équipe avec un adulte."
          },
          {
                    question: "Combien de questions pour un quizz anniversaire ?",
                    answer: "Entre 10 et 20 questions, en comptant 30 secondes par question. Évite de dépasser 30 minutes total."
          },
          {
                    question: "Comment faire participer les grands-parents qui n'ont pas de smartphone ?",
                    answer: "Ils peuvent jouer en équipe avec un petit-enfant ou utiliser un téléphone partagé. Une équipe = un téléphone = un compte joueur."
          },
          {
                    question: "Combien coûte un quizz anniversaire ?",
                    answer: "Gratuit pour la version basique (10 questions, 100 joueurs). À partir de 3€ pour ajouter photos, couleurs et mode TV."
          },
          {
                    question: "Peut-on rejouer le quizz l'année suivante ?",
                    answer: "Oui, tu peux dupliquer ton quizz et ajouter de nouvelles questions chaque année. Tu construis un quizz familial qui devient une tradition."
          },
        ],
      }}
    />
  );
}
