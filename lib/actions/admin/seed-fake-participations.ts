"use server";

// =============================================
// V52 — Admin : génère des participations factices pour démo / animation
// =============================================
// Utile quand un quiz weekly vient d'être lancé et que personne n'a encore
// joué : on génère N participants fictifs avec scores réalistes + chronos
// crédibles. Tout est tracé dans l'audit log.

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { isOptionArray, scoreAnswer, type Answer } from "@/lib/quiz/scoring";

// Pool de pseudos cool (français, anglo, fun)
const NICKNAMES = [
  // Prénoms FR classiques
  "Théo", "Mariana", "Lola91", "Kévin", "Sophie L.", "Camille", "Thomas",
  "Inès", "Mehdi", "Adam", "Charlotte", "Zoé", "Quentin", "Manon",
  "Eliott", "Léa", "Maxime", "Lucas", "Sarah", "Mathilde", "Yanis",
  "Pauline", "Hugo", "Anaïs", "Léon", "Suzy", "Jade", "Tom",
  "Emma", "Nathan", "Louise", "Gabriel", "Alice", "Raphaël", "Chloé",
  "Arthur", "Inès B.", "Jules", "Léna", "Paul", "Romane", "Antoine T.",
  "Margot", "Victor", "Salomé", "Sacha", "Ambre", "Noah", "Mila",
  "Tiago", "Capucine", "Maël", "Élise", "Aaron", "Olivia", "Liam",
  "Iris", "Robin", "Lina", "Naël", "Eva", "Soan", "Apolline",
  // Initiales / formats avec chiffres
  "Théo Z.", "RaphMrz", "Nina95", "JulieG", "LaurineP", "GaspardA",
  "ChloéV", "RomainM", "JadeB", "OctaveK", "EnzoR", "Mehdi92",
  "Lily22", "Tom75", "Sarah_06", "Léo69", "Mat59", "Cam33",
  "Alex77", "Léa14", "Théo38", "Jul44", "Pauline31",
  // Pseudos fun / geek
  "BatmanFR", "PetitOurs", "FlashMax", "DJWolf", "Capitaine",
  "Trolldu13", "MissPiou", "BarbieDev", "PandaWok", "JoyD",
  "SamFinch", "BobLeChat", "PoulpyCorp", "NinjaFromage", "ZebraKing",
  "DragonRosé", "PiouPiou", "MasterChef", "FoxyLady", "Spartiate",
  "TigreBleu", "RoiSinge", "ChevalDeFer", "Pingouin42", "Hibou_007",
  "Goblin77", "ElfeNoir", "LapinBleu", "Renardeau", "GrosOurs",
  "BananaSplit", "FraisierMaster", "CroustiPouletteFTW", "Tartiflette",
  "RaclettePower", "BiscuitRose", "CafeNoir", "ThéVert", "ChocoBon",
  // Sport/musique/cinéma fans
  "OMforever", "PSG_77", "JuvFan", "TifoBleu", "Verdeau_75",
  "BarcaForever", "MadridLover", "AjaxXI", "RossoSognante",
  "MetalHead", "ReggaeMan", "JazzCat", "SkaPunk2k", "RapFrLover",
  "DiscoQueen", "TechnoBoy", "ClassicGirl", "RockOrDie", "BassDropFr",
  "CinéLover", "Cinéphile88", "MarvelGirl", "DCBoy",
  // Surnoms régionaux/typés
  "Bigouden", "Marseillais13", "Stéphanois42", "BordelLover", "LilloisFR",
  "Niçoise06", "Toulousain31", "Strasbourgeois", "RennesPapa", "ChtiPower",
  "Corsuvellu", "Alsacien67", "Provençale", "Auvergnatte", "Breton22",
  "Normand76", "Picard80", "Béarnais", "Périgourdine", "Gascon32",
  // Internet & memes
  "404NotFound", "ItsLit", "Boomer92", "ZRosé", "Yolo2k",
  "VibeCheck", "TrueBro", "ICanDoThis", "MoodForever", "Slay25",
  "JustVibing", "PartyMode", "ChillOnly", "GamerLife", "MemeKing",
  "OkayBoomer", "TilTBot", "FrenchGeek", "WonderBoy", "InfinityFan",
  // Animaux / nature
  "PetitChat", "GrosNounours", "RoiLion", "PandaRoux", "SingeMalin",
  "LapinFou", "Hérisson75", "CrocoBleu", "DauphinMagic", "LoutreCool",
  "AbeilleZZZ", "PapillonRose", "TortueSage", "ChouetteHibou",
  // Nourriture
  "PainAuChoc", "CrêpeMaster", "RaclettePro", "FromageMan", "Saucisson13",
  "Croissant75", "BouletteSauce", "PattedFromage", "TarteTatin",
  "CrumbleAux", "PateÀTartiner", "ChocolatBlanc",
  // Mix / aléatoires
  "Echo", "Phoenix", "Atlas", "Nova", "Orion",
  "Aria", "Solène", "Zéphir", "Calypso", "Luna",
  "Maverick", "Joker", "Phantom", "Shadow", "Striker",
  "Mystik", "Vortex", "Saphir", "Onyx", "Jade42",
  "Aki", "Yuki", "Hana", "Mei", "Sora",
  "Tofik", "Léna B.", "Naël 88", "Soraya", "Inaya",
];

function randomNickname(usedSet: Set<string>): string {
  let name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  let attempts = 0;
  while (usedSet.has(name) && attempts < 20) {
    name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
    attempts++;
  }
  if (usedSet.has(name)) {
    name = `${name}${Math.floor(Math.random() * 999)}`;
  }
  usedSet.add(name);
  return name;
}

/**
 * Génère une réponse aléatoire plausible pour une question.
 * Probabilité bonne réponse = bonus (ajustable, défaut 0.55).
 */
function generateAnswer(
  q: { type: string; options: unknown; points: number },
  bonus: number
): Answer | null {
  const isCorrect = Math.random() < bonus;
  const opts = isOptionArray(q.options) ? q.options : [];

  if (q.type === "TEXT") {
    if (isCorrect && opts[0]?.label) {
      return { type: "text", value: opts[0].label };
    }
    return { type: "text", value: "..." };
  }

  if (q.type === "SCORE_GUESS") {
    // Pour le seed factice, on pronostique un score random plausible
    return {
      type: "score",
      home: Math.floor(Math.random() * 5),
      away: Math.floor(Math.random() * 5),
    };
  }

  // QCM / TRUE_FALSE
  if (opts.length === 0) return null;
  const correctIdx = opts
    .map((o, i) => (o.isCorrect ? i : -1))
    .filter((i) => i >= 0);
  if (isCorrect && correctIdx.length > 0) {
    if (q.type === "MULTIPLE_CHOICE") {
      return { type: "choice", selectedIndices: [...correctIdx] };
    }
    return {
      type: "choice",
      selectedIndices: [correctIdx[Math.floor(Math.random() * correctIdx.length)]],
    };
  }
  // Réponse aléatoire incorrecte
  const wrongIdx = opts.map((_, i) => i).filter((i) => !correctIdx.includes(i));
  if (wrongIdx.length === 0) return null;
  return {
    type: "choice",
    selectedIndices: [wrongIdx[Math.floor(Math.random() * wrongIdx.length)]],
  };
}

export type SeedFakeState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function seedFakeParticipationsAction(
  _prev: SeedFakeState,
  formData: FormData
): Promise<SeedFakeState> {
  const { user: admin } = await requireAdmin();

  const quizId = String(formData.get("quizId") ?? "");
  const countRaw = parseInt(String(formData.get("count") ?? "0"));
  const count = Math.max(1, Math.min(100, countRaw));
  if (!quizId) {
    return { ok: false, message: "Quiz introuvable." };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      code: true,
      title: true,
      scheduledOpenAt: true,
      scheduledCloseAt: true,
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, options: true, points: true },
      },
    },
  });
  if (!quiz) {
    return { ok: false, message: "Quiz introuvable." };
  }

  // Fenêtre temporelle pour les participations : entre openAt et closeAt (ou maintenant)
  const now = Date.now();
  const openAt = quiz.scheduledOpenAt?.getTime() ?? now - 24 * 60 * 60 * 1000;
  const closeAt = Math.min(quiz.scheduledCloseAt?.getTime() ?? now, now);
  const windowMs = Math.max(60 * 1000, closeAt - openAt);

  // Récupère les pseudos existants pour éviter les doublons
  const existing = await prisma.participation.findMany({
    where: { quizId: quiz.id },
    select: { nickname: true },
  });
  const usedNames = new Set(existing.map((p) => p.nickname));

  let created = 0;
  for (let i = 0; i < count; i++) {
    const nickname = randomNickname(usedNames);
    // Bonus de difficulté : varie pour avoir des scores étalés
    const bonus = 0.3 + Math.random() * 0.6; // entre 0.3 et 0.9

    // Génère les réponses + calcule le score
    const answers: Record<string, Answer> = {};
    let score = 0;
    for (const q of quiz.questions) {
      const a = generateAnswer(q, bonus);
      if (a) {
        answers[q.id] = a;
        const opts = isOptionArray(q.options) ? q.options : [];
        score += scoreAnswer(q.type, opts, a, q.points, q.options);
      }
    }

    // Chronos réalistes : 30s à 5min total
    const totalDurationMs = 30_000 + Math.floor(Math.random() * 270_000);
    const startedAt = new Date(openAt + Math.floor(Math.random() * windowMs));
    const completedAt = new Date(
      Math.min(startedAt.getTime() + totalDurationMs, closeAt)
    );

    try {
      await prisma.participation.create({
        data: {
          id: crypto.randomBytes(12).toString("hex"),
          quizId: quiz.id,
          nickname,
          score,
          answers: answers as unknown as object,
          startedAt,
          completedAt,
        },
      });
      created++;
    } catch (e) {
      console.warn("[seed] participation create failed:", e);
    }
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email ?? "",
    action: "delete_quiz", // pas de type dedie ; on detourne avec payload
    targetQuizId: quiz.id,
    payload: {
      seedAction: "fake_participations",
      requested: count,
      created,
      code: quiz.code,
      title: quiz.title,
    },
  });

  revalidatePath(`/admin/quizzes`);
  revalidatePath(`/q/${quiz.code}/classement`);
  return {
    ok: true,
    message: `✅ ${created} participation${created > 1 ? "s" : ""} factice${created > 1 ? "s" : ""} ajoutée${created > 1 ? "s" : ""}.`,
  };
}
