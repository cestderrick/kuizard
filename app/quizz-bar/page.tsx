import type { Metadata } from "next";
import { UseCasePage } from "@/components/use-case/use-case-page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizz bar — animer ton bar avec des blind-tests et soirées quizz",
  description:
    "Organise des soirées quizz et blind-tests dans ton bar ou restaurant. Mode live, affichage TV, classement avec lots. Abonnement bar dès 25 €/mois, quizz illimités.",
  alternates: { canonical: `${BASE_URL}/quizz-bar` },
  openGraph: {
    title: "Quizz bar — la solution simple pour animer ton lieu",
    description:
      "Mode live, affichage TV, classements hebdo, lots aux gagnants. Abonnement dès 25 €/mois.",
    url: `${BASE_URL}/quizz-bar`,
  },
};

export default function Page() {
  return (
    <UseCasePage
      config={{
        slug: "quizz-bar",
        emoji: "🍻",
        eyebrow: "Quizz bar & restos",
        h1: "Anime ton bar avec des soirées quizz interactives",
        intro:
          "Soirées blind-tests le mardi, quizz culture générale le jeudi, classement hebdo des meilleures équipes : Kuizard te donne tous les outils pour animer ton lieu sans te prendre la tête. Mode live piloté depuis ton téléphone, affichage TV pour les scores, lots aux gagnants. Tes clients reviennent pour la prochaine session.",
        benefits: [
          {
            icon: "📡",
            title: "Mode live + pilotage",
            desc: "Tu lances les questions une par une depuis ton téléphone. Pause pour ranimer l'ambiance ou commander la prochaine tournée.",
          },
          {
            icon: "📺",
            title: "Affichage TV",
            desc: "Branche un Chromecast ou la TV du bar : QR code visible en permanence, classement qui défile, ambiance Quizz Show.",
          },
          {
            icon: "🏆",
            title: "Classement et lots",
            desc: "Hebdo, mensuel, par session. Associe une tournée offerte, un repas, un t-shirt branding bar : les clients reviennent.",
          },
        ],
        sampleQuestions: [
          "Quel chanteur a écrit \"Bohemian Rhapsody\" ?",
          "En quelle année est sorti Titanic ?",
          "Devinez le titre de cette chanson en 10 secondes (blind-test).",
          "Quel cocktail contient du rhum, de la menthe et du citron vert ?",
          "Quelle équipe a gagné la Coupe du Monde en 1998 ?",
          "Quel département français porte le numéro 69 ?",
          "Quelle est la capitale de l'Australie ?",
          "Quel film a remporté l'Oscar du meilleur film en 2024 ?",
        ],
        whyKuizard: [
          "Quizz illimités avec l'abonnement Bar (dès 25 €/mois) — plus tu animes, plus c'est rentable.",
          "Mode live pour piloter chaque question — tu gardes la main sur le rythme de ta soirée.",
          "Affichage TV optimisé : grandes polices, QR code dans le coin, scores en gros.",
          "Personnalisation totale : logo de ton bar, couleurs, ambiance — ton quizz à ton image.",
          "Statistiques avancées : taux de remplissage, retours clients, top des équipes fidèles.",
          "Export CSV des participations (plan Pro) pour ta CRM ou tes campagnes mail.",
          "Conservation des données 6 mois sur tes abonnements pour suivre les habitués.",
        ],
        internalLinks: [
          { label: "Voir les abonnements bars", href: "/tarifs#abonnements" },
          { label: "Centre d'aide", href: "/aide" },
        ],
      }}
    />
  );
}
