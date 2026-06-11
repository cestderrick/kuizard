import type { Metadata } from "next";
import { UseCasePage } from "@/components/use-case/use-case-page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: "Quizz mariage personnalisé — questions sur les mariés en QR code",
  description:
    "Crée un quizz mariage personnalisé pour ta réception. Les invités jouent depuis leur téléphone en scannant un QR code. Classement, lots, ambiance garantie. Gratuit pour essayer.",
  alternates: { canonical: `${BASE_URL}/quizz-mariage` },
  openGraph: {
    title: "Quizz mariage — animation interactive pour ta réception",
    description:
      "Quizz sur les mariés à scanner en QR code. Les invités jouent en simultané. Classement et lots inclus.",
    url: `${BASE_URL}/quizz-mariage`,
  },
};

export default function Page() {
  return (
    <UseCasePage
      config={{
        slug: "quizz-mariage",
        emoji: "💍",
        eyebrow: "Quizz mariage",
        h1: "Crée un quizz personnalisé pour ton mariage et anime la réception",
        intro:
          "Un quizz mariage Kuizard transforme tes invités en équipes de joueurs et offre un moment de complicité unique. Tu écris les questions sur les mariés (rencontre, anecdotes, futur…), tu génères un QR code, et tout le monde joue en direct depuis son smartphone. Pas d'app à installer, pas de matériel — juste un téléphone et un moment magique.",
        benefits: [
          {
            icon: "📲",
            title: "QR code unique",
            desc: "Imprime le QR sur ton menu ou affiche-le sur l'écran de la salle. Tes invités scannent et jouent en 5 secondes.",
          },
          {
            icon: "🏆",
            title: "Classement et lots",
            desc: "Affiche le classement en direct sur grand écran. Associe un lot aux 3 premières équipes — du grand classique aux délires entre amis.",
          },
          {
            icon: "🎨",
            title: "À ton image",
            desc: "Couleurs, photos, ambiance : ton quizz reprend la charte de ton mariage. Champêtre, chic, déjanté — tu choisis.",
          },
        ],
        sampleQuestions: [
          "Où les mariés se sont-ils rencontrés pour la première fois ?",
          "Quel est le plat préféré de la mariée ?",
          "Quel film as-tu vu au premier rendez-vous ?",
          "Quel est le surnom secret du marié quand il était enfant ?",
          "Combien d'années se sont écoulées avant la demande en mariage ?",
          "Quel est le pays de leur lune de miel ?",
          "Quel groupe les mariés écoutaient en boucle quand ils se sont rencontrés ?",
          "Quel est leur projet préféré pour les 5 prochaines années ?",
        ],
        whyKuizard: [
          "Configuration en 5 minutes, zéro compétence technique requise.",
          "Mode live pour piloter les questions une par une depuis ton téléphone (parfait pendant les discours).",
          "Mode créneau ouvert : tes invités peuvent jouer entre le cocktail et le dessert, à leur rythme.",
          "Ajoute des photos de vous pour des questions visuelles façon « C'est qui le bébé ? ».",
          "Imprime une affiche A4 avec le QR code à laisser sur chaque table.",
          "Pas de pub, pas de tracker, RGPD friendly.",
        ],
        internalLinks: [
          { label: "Voir tous les tarifs", href: "/tarifs" },
          { label: "Idée pour un EVJF ?", href: "/quizz-evjf" },
          { label: "Centre d'aide", href: "/aide" },
        ],
      }}
    />
  );
}
