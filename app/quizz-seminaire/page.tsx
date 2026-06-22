import type { Metadata } from "next";
import { UseCasePage } from "@/components/use-case/use-case-page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizz séminaire & team building — animation interactive entreprise",
  description:
    "Anime ton séminaire ou ton team building avec un quizz interactif Kuizard. Brise-glace, formation ludique, défi par équipe. QR code à scanner, classement en direct. Solution simple, sans pub.",
  alternates: { canonical: `${BASE_URL}/quizz-seminaire` },
  openGraph: {
    title: "Quizz séminaire — brise-glace et team building moderne",
    description:
      "Mode live, classement par équipe, formation ludique. La solution simple pour ton événement pro.",
    url: `${BASE_URL}/quizz-seminaire`,
  },
};

export default function Page() {
  return (
    <UseCasePage
      config={{
        slug: "quizz-seminaire",
        emoji: "🎓",
        eyebrow: "Quizz séminaire",
        h1: "Anime ton séminaire ou ton team building avec un quizz interactif",
        intro:
          "Brise-glace en début de journée, défi par équipe en clôture, formation produit déguisée en jeu : Kuizard remplace les vieux supports PowerPoint par une vraie animation interactive. Tes participants jouent depuis leur téléphone, le classement défile sur l'écran, et tout le monde repart avec le sourire — et le sentiment d'avoir appris quelque chose.",
        benefits: [
          {
            icon: "🧊",
            title: "Brise-glace efficace",
            desc: "Questions sur les participants, sur l'entreprise, sur le secteur. Tout le monde apprend à se connaître en 15 minutes.",
          },
          {
            icon: "🎯",
            title: "Formation ludique",
            desc: "Transforme ton onboarding produit ou ta présentation conformité en quizz. Engagement multiplié, rétention boostée.",
          },
          {
            icon: "🏆",
            title: "Équipes & lots",
            desc: "Mode équipes, classement par équipe, lots pour les gagnants : la team gagnante part au resto, ou décroche un trophée du bureau.",
          },
        ],
        sampleQuestions: [
          "Quel est le chiffre d'affaires de notre entreprise l'an dernier ?",
          "En quelle année notre fondateur a-t-il lancé l'entreprise ?",
          "Combien d'employés travaillent dans notre bureau de Lyon ?",
          "Quel est notre client le plus ancien ?",
          "Quel produit a généré le plus de revenus en Q4 ?",
          "Qui est la personne qui a rejoint l'équipe il y a moins d'un mois ?",
          "Quel département gère les relations partenaires ?",
          "Quelle valeur d'entreprise est la plus citée dans nos communications externes ?",
          "Quel est le nom de notre concurrent principal ?",
          "Quel projet stratégique sera lancé au prochain trimestre ?",
        ],
        whyKuizard: [
          "Aucune installation côté participants : tout le monde joue depuis le navigateur de son téléphone.",
          "Mode live avec pilotage : tu lances chaque question, fais une pause pour commenter la réponse, puis enchaînes.",
          "Affichage TV intégré pour projeter le classement sur grand écran.",
          "Personnalisation totale aux couleurs de ton entreprise (logo, palette, message d'intro).",
          "Export CSV des participations (plan Pro) pour ton compte-rendu de séminaire ou ton CRM RH.",
          "RGPD friendly : pas de pub, pas de tracker, données hébergées en France (OVH).",
          "Idéal aussi pour tes événements clients : showcase de fin d'année, soirée annuelle, kick-off projet.",
        ],
        internalLinks: [
          { label: "Voir les abonnements pros", href: "/tarifs#abonnements" },
          { label: "Centre d'aide", href: "/aide" },
        ],
        howTo: {
          name: "Comment organiser un quizz pour un séminaire d'entreprise",
          description: "Boostez la cohésion d'équipe avec un quizz personnalisé pendant votre séminaire.",
          totalTime: "PT20M",
          steps: [
                    {
                              name: "Crée un compte Pro Kuizard",
                              text: "Choisis l'abonnement Entreprise pour les fonctionnalités avancées et le branding."
                    },
                    {
                              name: "Définis le thème du séminaire",
                              text: "Culture d'entreprise, valeurs, anecdotes RH, jargon métier — choisis 2-3 axes."
                    },
                    {
                              name: "Forme des équipes mixtes",
                              text: "Mélange les services pour casser les silos. 4-6 personnes par équipe = idéal."
                    },
                    {
                              name: "Lance le quizz en plénière",
                              text: "Mode TV sur grand écran, classement live. Idéal en clôture de matinée ou de soirée."
                    },
                    {
                              name: "Récompense les gagnants",
                              text: "Bouteille, expérience, jour off — adapte selon ta culture. L'enjeu booste l'engagement."
                    }
          ]
},
        faqs: [
          {
                    question: "Combien de personnes peuvent jouer en simultané ?",
                    answer: "Jusqu'à 500 participants simultanés sur l'offre Entreprise, et plus sur demande pour les grands groupes (1000+ collaborateurs)."
          },
          {
                    question: "Le quizz est-il personnalisable aux couleurs de mon entreprise ?",
                    answer: "Oui — logo, couleurs de la marque, photo de couverture. Le quizz reprend ton identité visuelle pour renforcer la cohérence."
          },
          {
                    question: "Peut-on l'utiliser comme outil de team building récurrent ?",
                    answer: "Oui, l'abonnement Entreprise inclut un nombre illimité de quizz. Tu peux faire un quizz par mois, par équipe, par projet."
          },
          {
                    question: "Comment exploiter les résultats après le séminaire ?",
                    answer: "Le dashboard te donne un export CSV avec scores, temps de réponse, taux de bonnes réponses par question. Utile pour identifier les sujets qui méritent une formation ou un rappel."
          },
          {
                    question: "Les données sont-elles RGPD compliant ?",
                    answer: "Oui — données hébergées en France, pas de pub, pas de tracker tiers. Conformité RGPD garantie, c'est un must pour une entreprise."
          },
        ],
      }}
    />
  );
}
