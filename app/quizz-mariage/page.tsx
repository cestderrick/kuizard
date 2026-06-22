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
          { label: "Quizz anniversaire", href: "/quizz-anniversaire" },
          { label: "30 idées de questions mariage", href: "/blog/idees-questions-quizz-mariage" },
          { label: "Centre d'aide", href: "/aide" },
        ],
        // V48 — SEO : rich snippet "Comment créer" en résultat Google
        howTo: {
          name: "Comment créer un quizz mariage en 5 minutes",
          description:
            "Le guide pas à pas pour préparer ton quizz mariage et l'afficher en QR code le jour J.",
          totalTime: "PT5M",
          steps: [
            {
              name: "Crée ton compte gratuit Kuizard",
              text: "Inscris-toi en 30 secondes avec ton email. Aucune CB requise.",
            },
            {
              name: "Rédige tes questions sur les mariés",
              text: "10 à 20 questions sur la rencontre, les anecdotes, les projets. Inspire-toi de notre liste de 30 idées.",
            },
            {
              name: "Personnalise ton quizz",
              text: "Choisis tes couleurs, ajoute des photos, configure le mode (live ou créneau).",
            },
            {
              name: "Imprime ton QR code et ton affiche",
              text: "Télécharge l'affiche A4 prête à imprimer et pose-la sur chaque table.",
            },
            {
              name: "Lance la partie le jour J",
              text: "Tes invités scannent, jouent depuis leur smartphone, et tu projettes le classement sur écran.",
            },
          ],
        },
        // V48 — SEO : rich snippet FAQ Google
        faqs: [
          {
            question: "Combien de temps pour préparer un quizz mariage ?",
            answer:
              "Compte 30 minutes à 1h pour écrire 15 à 20 questions sur les mariés. La création du quizz sur Kuizard se fait en 5 minutes. Tu peux modifier les questions à tout moment jusqu'au jour J.",
          },
          {
            question: "Mes invités doivent-ils télécharger une app ?",
            answer:
              "Non. Aucune app à installer. Tes invités scannent le QR code avec l'appareil photo de leur téléphone, ça ouvre le quizz dans leur navigateur. Compatible iOS et Android.",
          },
          {
            question: "Combien de personnes peuvent jouer en même temps ?",
            answer:
              "Jusqu'à 100 joueurs simultanés sur l'offre gratuite, jusqu'à 500 sur les offres payantes, et illimité sur l'abonnement Bar/Entreprise. Largement suffisant pour un mariage classique.",
          },
          {
            question: "Le quizz fonctionne-t-il sans wifi à la salle ?",
            answer:
              "Tes invités ont besoin de la 4G/5G sur leur téléphone ou du wifi de la salle. La grande majorité des salles de réception ont aujourd'hui une connexion correcte. Prévois un repli de questions papier au cas où.",
          },
          {
            question: "Combien coûte un quizz mariage Kuizard ?",
            answer:
              "Gratuit pour tester (max 10 questions et 100 participants). Pour un mariage avec photos, lots et mode TV, l'offre à 3€ suffit pour un quizz unique. Voir tous les tarifs.",
          },
          {
            question: "Peut-on personnaliser les couleurs et ajouter des photos ?",
            answer:
              "Oui. Tu peux choisir une couleur principale, ajouter une photo de couverture, et insérer des photos dans tes questions (façon « C'est qui le bébé ? »). La charte de ton mariage est respectée.",
          },
          {
            question: "Puis-je voir le classement sur grand écran pendant la soirée ?",
            answer:
              "Oui — le mode TV affiche un classement plein écran avec QR code géant. Idéal à diffuser sur la TV ou le projecteur de la salle pendant le cocktail ou avant le dessert.",
          },
        ],
      }}
    />
  );
}
