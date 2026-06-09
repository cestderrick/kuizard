// =============================================
// Seed — Plans, templates par défaut
// =============================================
//
// Idempotent : on utilise upsert sur le slug. Lance avec :
//   npx tsx prisma/seed-plans.ts
//
// Cette logique pourrait migrer dans `prisma/seed.ts` standard si on
// configure `prisma.seed` dans package.json.

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type PlanSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: "one_shot" | "subscription";
  interval: string | null;
  priceCents: number;
  displayOrder: number;
  isHighlighted: boolean;
  limits: Record<string, unknown>;
};

const PLANS: PlanSeed[] = [
  {
    slug: "free",
    name: "Découverte",
    tagline: "Pour tester Kuizard gratuitement",
    description:
      "Crée un mini-quizz pour goûter à la magie Kuizard. Idéal pour s'amuser entre amis.",
    type: "one_shot",
    interval: null,
    priceCents: 0,
    displayOrder: 0,
    isHighlighted: false,
    limits: {
      maxQuestions: 5,
      maxParticipants: 20,
      customColors: false,
      customPrizes: false,
      finalMessage: false,
      coverImage: false,
      questionImages: false,
      scheduledMode: false,
      liveMode: false,
      ranking: true,
      tvDisplay: false,
    },
  },
  {
    slug: "essentiel",
    name: "Essentiel",
    tagline: "Pour un événement entre amis ou famille",
    description:
      "10 questions, jusqu'à 50 participants. Photos sur l'intro et personnalisation des couleurs.",
    type: "one_shot",
    interval: null,
    priceCents: 500,
    displayOrder: 10,
    isHighlighted: false,
    limits: {
      maxQuestions: 10,
      maxParticipants: 50,
      customColors: true,
      customPrizes: false,
      finalMessage: false,
      coverImage: true,
      questionImages: false,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: false,
    },
  },
  {
    slug: "festif",
    name: "Festif",
    tagline: "Pour une grande soirée mémorable",
    description:
      "20 questions, jusqu'à 150 participants, photos sur les questions, lots et message final personnalisés.",
    type: "one_shot",
    interval: null,
    priceCents: 1000,
    displayOrder: 20,
    isHighlighted: true,
    limits: {
      maxQuestions: 20,
      maxParticipants: 150,
      customColors: true,
      customPrizes: true,
      finalMessage: true,
      coverImage: true,
      questionImages: true,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: false,
    },
  },
  {
    slug: "magique",
    name: "Magique",
    tagline: "Le grand jeu, sans limites",
    description:
      "Questions illimitées, 500 participants, toutes les options de personnalisation.",
    type: "one_shot",
    interval: null,
    priceCents: 1500,
    displayOrder: 30,
    isHighlighted: false,
    limits: {
      maxQuestions: 999,
      maxParticipants: 500,
      customColors: true,
      customPrizes: true,
      finalMessage: true,
      coverImage: true,
      questionImages: true,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: true,
    },
  },
  {
    slug: "magique_mensuel",
    name: "Magique Mensuel",
    tagline: "Pour les habitué·e·s qui font plusieurs quizz par an",
    description:
      "Tous les avantages du plan Magique en abonnement : quizz illimités, toutes les options premium, tarif dégressif vs paiement à l'unité.",
    type: "subscription",
    interval: "month",
    priceCents: 990,
    displayOrder: 35,
    isHighlighted: false,
    limits: {
      maxQuestions: 999,
      maxParticipants: 500,
      customColors: true,
      customPrizes: true,
      finalMessage: true,
      coverImage: true,
      questionImages: true,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: false,
      maxActiveQuizzes: 10,
      maxTemplatesPerMonth: 5,
    },
  },
  {
    slug: "bar_essentiel",
    name: "Bar Essentiel",
    tagline: "Pour animer un bar / restaurant",
    description:
      "Abonnement mensuel : 3 quizz actifs simultanément, affichage TV, classements hebdo.",
    type: "subscription",
    interval: "month",
    priceCents: 1900,
    displayOrder: 40,
    isHighlighted: false,
    limits: {
      maxQuestions: 30,
      maxParticipants: 200,
      customColors: true,
      customPrizes: true,
      finalMessage: true,
      coverImage: true,
      questionImages: true,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: true,
      maxActiveQuizzes: 3,
      maxTemplatesPerMonth: 10,
    },
  },
  {
    slug: "bar_pro",
    name: "Bar Pro",
    tagline: "Pour les chaînes ou gros volumes",
    description:
      "Quizz illimités, support prioritaire, branding personnalisé.",
    type: "subscription",
    interval: "month",
    priceCents: 4900,
    displayOrder: 50,
    isHighlighted: false,
    limits: {
      maxQuestions: 999,
      maxParticipants: 999,
      customColors: true,
      customPrizes: true,
      finalMessage: true,
      coverImage: true,
      questionImages: true,
      scheduledMode: true,
      liveMode: true,
      ranking: true,
      tvDisplay: true,
      maxActiveQuizzes: 999,
      maxTemplatesPerMonth: 999,
      whiteLabel: true,
      prioritySupport: true,
    },
  },
];

async function main() {
  console.log("🎩 Kuizard — Seed des plans");

  for (const plan of PLANS) {
    const limits = plan.limits as unknown as Prisma.InputJsonValue;
    await prisma.planConfig.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        tagline: plan.tagline,
        description: plan.description,
        type: plan.type,
        interval: plan.interval,
        priceCents: plan.priceCents,
        limits,
        displayOrder: plan.displayOrder,
        isHighlighted: plan.isHighlighted,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        tagline: plan.tagline,
        description: plan.description,
        type: plan.type,
        interval: plan.interval,
        priceCents: plan.priceCents,
        limits,
        displayOrder: plan.displayOrder,
        isHighlighted: plan.isHighlighted,
      },
    });
    console.log(`  ✓ ${plan.slug} (${plan.name}) — ${plan.priceCents}cts`);
  }

  console.log(`\nTotal : ${PLANS.length} plans seedés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
