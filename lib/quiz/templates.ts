// =============================================
// Templates de quizz prêts à l'emploi
// =============================================
// Le créateur peut cloner un template pour démarrer rapidement.
// Les questions sont des exemples : il pourra tout éditer après création.

export type TemplateQuestion = {
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "TEXT";
  text: string;
  points: number;
  options: { label: string; isCorrect: boolean }[];
};

export type QuizTemplate = {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  quizTitle: string;
  quizDescription: string;
  themeColor: string;
  questions: TemplateQuestion[];
};

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    slug: "mariage",
    emoji: "💍",
    title: "Mariage",
    description:
      "Quizz sur les mariés à projeter pendant le repas. Réponses à personnaliser.",
    quizTitle: "Le quizz des mariés",
    quizDescription:
      "Bienvenue les amis ! Que connaissez-vous vraiment de nous ?",
    themeColor: "#EC4899",
    questions: [
      {
        type: "SINGLE_CHOICE",
        text: "Où s'est passé le premier rendez-vous ?",
        points: 1,
        options: [
          { label: "Au resto italien", isCorrect: true },
          { label: "Au cinéma", isCorrect: false },
          { label: "À la patinoire", isCorrect: false },
          { label: "Au bowling", isCorrect: false },
        ],
      },
      {
        type: "TEXT",
        text: "Quel est le surnom secret de la mariée ?",
        points: 2,
        options: [{ label: "Ma puce", isCorrect: true }],
      },
      {
        type: "TRUE_FALSE",
        text: "Le marié a demandé la main de la mariée en haut de la Tour Eiffel.",
        points: 1,
        options: [
          { label: "Vrai", isCorrect: false },
          { label: "Faux", isCorrect: true },
        ],
      },
      {
        type: "SINGLE_CHOICE",
        text: "Combien de temps avant le mariage se sont-ils rencontrés ?",
        points: 1,
        options: [
          { label: "Moins d'1 an", isCorrect: false },
          { label: "Entre 1 et 3 ans", isCorrect: false },
          { label: "Entre 3 et 5 ans", isCorrect: true },
          { label: "Plus de 5 ans", isCorrect: false },
        ],
      },
      {
        type: "MULTIPLE_CHOICE",
        text: "Quels sont leurs deux pays préférés à visiter ?",
        points: 2,
        options: [
          { label: "Italie", isCorrect: true },
          { label: "Portugal", isCorrect: false },
          { label: "Japon", isCorrect: true },
          { label: "Norvège", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "evjf-evg",
    emoji: "👰",
    title: "EVJF / EVG",
    description:
      "Pour l'enterrement de vie de jeune fille ou garçon. À quel point connais-tu la mariée / le marié ?",
    quizTitle: "Tu connais bien notre futur(e) marié(e) ?",
    quizDescription: "Soirée magique en perspective ✨",
    themeColor: "#D946EF",
    questions: [
      {
        type: "SINGLE_CHOICE",
        text: "Quel est son plat préféré ?",
        points: 1,
        options: [
          { label: "Pizza", isCorrect: false },
          { label: "Lasagnes", isCorrect: true },
          { label: "Sushis", isCorrect: false },
          { label: "Tartiflette", isCorrect: false },
        ],
      },
      {
        type: "TEXT",
        text: "Quel est son film culte ?",
        points: 2,
        options: [{ label: "Love Actually", isCorrect: true }],
      },
      {
        type: "TRUE_FALSE",
        text: "Elle/il a déjà sauté en parachute.",
        points: 1,
        options: [
          { label: "Vrai", isCorrect: true },
          { label: "Faux", isCorrect: false },
        ],
      },
      {
        type: "SINGLE_CHOICE",
        text: "Quelle est sa plus grande peur ?",
        points: 1,
        options: [
          { label: "Les araignées", isCorrect: true },
          { label: "Le vide", isCorrect: false },
          { label: "Les avions", isCorrect: false },
          { label: "Les serpents", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "anniversaire",
    emoji: "🎂",
    title: "Anniversaire",
    description:
      "Pour célébrer une étape importante (30, 40, 50 ans…). Quiz personnel.",
    quizTitle: "Les 30 ans de Marie",
    quizDescription: "30 années à raconter en quiz ✨",
    themeColor: "#F59E0B",
    questions: [
      {
        type: "SINGLE_CHOICE",
        text: "Dans quelle ville est-elle née ?",
        points: 1,
        options: [
          { label: "Paris", isCorrect: false },
          { label: "Lyon", isCorrect: true },
          { label: "Marseille", isCorrect: false },
          { label: "Bordeaux", isCorrect: false },
        ],
      },
      {
        type: "TEXT",
        text: "Quel était son premier métier ?",
        points: 2,
        options: [{ label: "Serveuse", isCorrect: true }],
      },
      {
        type: "TRUE_FALSE",
        text: "Elle a déjà vécu à l'étranger.",
        points: 1,
        options: [
          { label: "Vrai", isCorrect: true },
          { label: "Faux", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "blind-test",
    emoji: "🎵",
    title: "Blind-test musical",
    description:
      "Pour les bars et soirées. Les questions sont à compléter avec tes propres morceaux.",
    quizTitle: "Soirée blind-test du mercredi",
    quizDescription:
      "Devine l'artiste et le titre ! Bonne chance à toutes les équipes 🎤",
    themeColor: "#0EA5E9",
    questions: [
      {
        type: "TEXT",
        text: "Artiste — Extrait 1 : « Comment t'appelles-tu ? »",
        points: 1,
        options: [{ label: "Roméo Elvis", isCorrect: true }],
      },
      {
        type: "TEXT",
        text: "Année de sortie — Extrait 1",
        points: 2,
        options: [{ label: "2018", isCorrect: true }],
      },
      {
        type: "TEXT",
        text: "Titre — Extrait 2",
        points: 2,
        options: [{ label: "Bohemian Rhapsody", isCorrect: true }],
      },
    ],
  },
  {
    slug: "naissance",
    emoji: "👶",
    title: "Baby-shower / Naissance",
    description:
      "Animations pour fêter l'arrivée d'un bébé. Tout savoir sur les futurs parents.",
    quizTitle: "Bienvenue petit(e) ✨",
    quizDescription: "Pendant qu'on attend l'arrivée du bébé…",
    themeColor: "#16A34A",
    questions: [
      {
        type: "SINGLE_CHOICE",
        text: "Quel jour le bébé est-il attendu ?",
        points: 1,
        options: [
          { label: "15 mars", isCorrect: false },
          { label: "22 avril", isCorrect: true },
          { label: "3 mai", isCorrect: false },
          { label: "10 juin", isCorrect: false },
        ],
      },
      {
        type: "TEXT",
        text: "Quel sera son prénom ?",
        points: 3,
        options: [{ label: "Lou", isCorrect: true }],
      },
      {
        type: "TRUE_FALSE",
        text: "C'est le premier enfant des futurs parents.",
        points: 1,
        options: [
          { label: "Vrai", isCorrect: true },
          { label: "Faux", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "team-building",
    emoji: "🎓",
    title: "Team-building / Séminaire",
    description:
      "Brise-glace pour vos équipes. Mix de questions générales et professionnelles.",
    quizTitle: "Quiz du séminaire 2026",
    quizDescription: "Pour bien démarrer notre semaine ensemble !",
    themeColor: "#5523BB",
    questions: [
      {
        type: "SINGLE_CHOICE",
        text: "En quelle année l'entreprise a-t-elle été fondée ?",
        points: 1,
        options: [
          { label: "2015", isCorrect: false },
          { label: "2018", isCorrect: true },
          { label: "2021", isCorrect: false },
          { label: "2023", isCorrect: false },
        ],
      },
      {
        type: "MULTIPLE_CHOICE",
        text: "Quelles sont nos 3 valeurs principales ?",
        points: 3,
        options: [
          { label: "Curiosité", isCorrect: true },
          { label: "Bienveillance", isCorrect: true },
          { label: "Compétition", isCorrect: false },
          { label: "Excellence", isCorrect: true },
        ],
      },
      {
        type: "TEXT",
        text: "Quel est le prénom du PDG ?",
        points: 2,
        options: [{ label: "Cedric", isCorrect: true }],
      },
    ],
  },
];

export function getTemplateBySlug(slug: string): QuizTemplate | null {
  return QUIZ_TEMPLATES.find((t) => t.slug === slug) ?? null;
}
