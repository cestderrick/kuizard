import type { Metadata } from "next";
import { UseCasePage } from "@/components/use-case/use-case-page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizz EVJF / EVG personnalisé — questions sur la future mariée",
  description:
    "Crée un quizz EVJF ou EVG personnalisé sur la future mariée ou le futur marié. QR code à scanner, mode soirée, classement et défis. Idéal pour ton enterrement de vie de jeune fille.",
  alternates: { canonical: `${BASE_URL}/quizz-evjf` },
  openGraph: {
    title: "Quizz EVJF / EVG — connaître la mariée à fond",
    description:
      "Questions personnalisées, QR code, défis, classement. Le quizz qui fait l'unanimité pendant l'EVJF.",
    url: `${BASE_URL}/quizz-evjf`,
  },
};

export default function Page() {
  return (
    <UseCasePage
      config={{
        slug: "quizz-evjf",
        emoji: "👰",
        eyebrow: "Quizz EVJF / EVG",
        h1: "Le quizz EVJF qui va faire de toi la meilleure témoin",
        intro:
          "Tu organises l'enterrement de vie de jeune fille ou de garçon ? Le quizz Kuizard sur la future mariée (ou le futur marié) est l'animation qui marche à tous les coups. Tu prépares les questions en amont avec sa famille et ses amis proches, tu génères un QR code, et le jour J tout le monde joue depuis son téléphone. Rires garantis, anecdotes ressorties, complicité boostée.",
        benefits: [
          {
            icon: "🎀",
            title: "100% personnalisé",
            desc: "Questions sur ses goûts, ses manies, ses anecdotes. Plus c'est précis, plus ça rigole.",
          },
          {
            icon: "📸",
            title: "Photos rigolotes",
            desc: "Ajoute des photos d'elle à 5 ans, de son ex préféré, de la première rencontre avec le futur. Questions visuelles inoubliables.",
          },
          {
            icon: "🏅",
            title: "Défis et lots",
            desc: "Top du classement : doit chanter karaoké. Dernier : doit payer la prochaine tournée. Tout est permis.",
          },
        ],
        sampleQuestions: [
          "Quel est son plat préféré ?",
          "Quel surnom utilise sa mère pour l'appeler ?",
          "À quel âge a-t-elle eu son premier amoureux ?",
          "Quelle est sa pire honte de jeunesse ?",
          "Quel est le prénom de son tout premier ex ?",
          "Quelle chanson l'a fait pleurer le plus dans sa vie ?",
          "Quel est son rêve de voyage le plus secret ?",
          "Quel défaut de son futur mari elle pardonne ?",
          "Quelle est sa série préférée à binge-watcher ?",
          "Combien de paires de chaussures pense-t-elle posséder (réelle vs perçue) ?",
        ],
        whyKuizard: [
          "Prépare le quizz à plusieurs en amont via un Google Doc partagé, puis crée-le sur Kuizard en 10 minutes.",
          "Mode live pour piloter pendant la soirée — pause au moment du cocktail, reprise après.",
          "Ajoute des questions sponsorisées par chaque pote ou par la maman.",
          "Imprime l'affiche A4 avec le QR code pour la décoration de la table.",
          "Capture les meilleures réactions : tu reverras ses propres réponses en vidéo plus tard.",
          "Pas besoin d'app : tout le monde joue depuis son téléphone normal.",
        ],
        internalLinks: [
          { label: "Voir tous les tarifs", href: "/tarifs" },
          { label: "Idée pour un mariage ?", href: "/quizz-mariage" },
          { label: "Idée pour un anniversaire ?", href: "/quizz-anniversaire" },
        ],
      }}
    />
  );
}
