// =============================================
// Génération d'un code court unique pour un quizz
// =============================================
// Format : 6 caractères majuscules alphanumériques.
// On exclut les caractères ambigus : 0/O, 1/I/L
// (un participant doit pouvoir lire et taper le code sans erreur)

import { prisma } from "@/lib/db";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 chars, aucun ambigu
const CODE_LENGTH = 6;
const MAX_RETRIES = 8;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Génère un code court unique en base.
 * 31^6 ≈ 887 millions de codes possibles → collisions très improbables,
 * mais on vérifie quand même et on retente.
 */
export async function generateUniqueQuizCode(): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const code = randomCode();
    const existing = await prisma.quiz.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error(
    `Impossible de générer un code unique après ${MAX_RETRIES} tentatives.`
  );
}
