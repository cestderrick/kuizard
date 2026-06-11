// =============================================
// Posts blog Kuizard
// =============================================
//
// Chaque post a un slug unique (= URL), des métadonnées SEO, et son contenu
// est défini dans son propre fichier sous components/blog/posts/{slug}.tsx.
//
// Pour ajouter un nouvel article :
// 1. Ajoute une entrée ici dans POSTS
// 2. Crée le fichier components/blog/posts/{slug}.tsx avec un export default
//    (server component React qui retourne du JSX rendant le contenu)
// 3. C'est tout — il sera listé sur /blog automatiquement et accessible
//    sur /blog/{slug}, avec son JSON-LD Article auto-généré

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string; // teaser affiché sur la liste
  datePublished: string; // ISO 8601
  dateModified: string;
  tags: string[];
  readingTime: number; // en minutes
};

export const POSTS: BlogPost[] = [
  {
    slug: "idees-questions-quizz-mariage",
    title: "30 idées de questions pour réussir ton quizz de mariage",
    description:
      "Tu prépares un quizz pour ton mariage et tu sèches sur les questions ? Voici 30 idées classées par thème (rencontre, anecdotes, projets, photos) pour faire mouche auprès de tous tes invités.",
    excerpt:
      "Le quizz mariage marche à tous les coups… à condition d'avoir les bonnes questions. Voici une liste prête à l'emploi, classée par thème, testée et approuvée.",
    datePublished: "2026-06-11",
    dateModified: "2026-06-11",
    tags: ["mariage", "idées", "animation"],
    readingTime: 6,
  },
  {
    slug: "animer-soiree-bar-quizz",
    title: "Comment animer une soirée quizz dans ton bar sans te ruiner",
    description:
      "Tu veux lancer une soirée quizz hebdomadaire dans ton bar mais tu ne sais pas par où commencer ? Voici le guide pratique : matériel, format, prix d'entrée, lots, communication, fidélisation.",
    excerpt:
      "Une soirée quizz hebdomadaire peut transformer un mardi mort en soirée pleine. Voici la marche à suivre, du matos à la communication, en passant par les lots à offrir.",
    datePublished: "2026-06-11",
    dateModified: "2026-06-11",
    tags: ["bar", "événementiel", "guide pratique"],
    readingTime: 8,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished)
  );
}
