// =============================================
// V50 — Question type SCORE_GUESS (foot/rugby etc.)
// =============================================
// L'utilisateur saisit un pronostic de score (équipe A vs équipe B).
// Le scoring est :
//   - score exact match → exactPoints
//   - sinon, application du barème "brackets" basé sur l'écart total
//     (somme |homeDiff| + |awayDiff|)
//   - si aucun palier match → 0 point
//
// Le tout est stocké dans Question.options (Json) au format :
// {
//   labelHome: "PSG",          // optionnel
//   labelAway: "OM",            // optionnel
//   expectedHome: 2,
//   expectedAway: 1,
//   exactPoints: 10,
//   brackets: [
//     { maxDiff: 1, points: 6 },  // ex: écart total ≤ 1 → 6 pts
//     { maxDiff: 3, points: 3 },
//     { maxDiff: 5, points: 1 },
//   ],
// }
//
// L'answer du joueur est stockée dans Participation.answers[questionId] :
// { type: "score", home: number, away: number }

export type ScoreGuessConfig = {
  labelHome?: string;
  labelAway?: string;
  // V55 : null = score reel pas encore saisi (a renseigner apres match).
  // Quand null, la question rapporte 0 point a tous les joueurs.
  expectedHome: number | null;
  expectedAway: number | null;
  exactPoints: number;
  brackets: { maxDiff: number; points: number }[];
};

export type ScoreGuessAnswer = {
  type: "score";
  home: number;
  away: number;
};

/** Valide la config et retourne l'objet typé (ou null si invalide) */
export function parseScoreGuessConfig(raw: unknown): ScoreGuessConfig | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  // V55 : expectedHome/Away peuvent etre absents ou null → score reel pas
  // encore saisi. Seul exactPoints + brackets restent obligatoires.
  if (typeof o.exactPoints !== "number" || !Array.isArray(o.brackets)) {
    return null;
  }
  const expHome =
    typeof o.expectedHome === "number"
      ? Math.max(0, Math.floor(o.expectedHome))
      : null;
  const expAway =
    typeof o.expectedAway === "number"
      ? Math.max(0, Math.floor(o.expectedAway))
      : null;
  const brackets = o.brackets
    .map((b: unknown) => {
      if (typeof b !== "object" || b === null) return null;
      const bb = b as Record<string, unknown>;
      if (typeof bb.maxDiff !== "number" || typeof bb.points !== "number") {
        return null;
      }
      return { maxDiff: bb.maxDiff, points: bb.points };
    })
    .filter((b): b is { maxDiff: number; points: number } => b !== null);
  // Trier par maxDiff croissant pour faciliter le scoring
  brackets.sort((a, b) => a.maxDiff - b.maxDiff);
  return {
    labelHome: typeof o.labelHome === "string" ? o.labelHome : undefined,
    labelAway: typeof o.labelAway === "string" ? o.labelAway : undefined,
    expectedHome: expHome,
    expectedAway: expAway,
    exactPoints: Math.max(0, Math.floor(o.exactPoints)),
    brackets,
  };
}

/**
 * V55 — Helper : true si le score reel a deja ete saisi par l'organisateur.
 * Quand false, la question SCORE_GUESS rapporte 0 point a tous les joueurs.
 */
export function hasScoreGuessResult(config: ScoreGuessConfig): boolean {
  return config.expectedHome !== null && config.expectedAway !== null;
}

/** Valide une réponse joueur */
export function parseScoreGuessAnswer(raw: unknown): ScoreGuessAnswer | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (o.type !== "score") return null;
  if (typeof o.home !== "number" || typeof o.away !== "number") return null;
  return {
    type: "score",
    home: Math.max(0, Math.floor(o.home)),
    away: Math.max(0, Math.floor(o.away)),
  };
}

/**
 * Calcule le nombre de points obtenus pour une réponse SCORE_GUESS.
 *
 * Règles :
 *   1. Score exact (homeDiff === 0 && awayDiff === 0) → exactPoints
 *   2. Sinon on calcule diffTotal = |homeDiff| + |awayDiff|
 *      et on prend le premier palier brackets[i] où diffTotal <= maxDiff
 *   3. Aucun palier match → 0
 */
export function computeScoreGuessPoints(
  config: ScoreGuessConfig,
  answer: ScoreGuessAnswer
): number {
  // V55 : si le score reel n'a pas encore ete saisi, personne ne marque.
  if (config.expectedHome === null || config.expectedAway === null) return 0;
  const homeDiff = Math.abs(answer.home - config.expectedHome);
  const awayDiff = Math.abs(answer.away - config.expectedAway);
  if (homeDiff === 0 && awayDiff === 0) return config.exactPoints;
  const total = homeDiff + awayDiff;
  for (const b of config.brackets) {
    if (total <= b.maxDiff) return b.points;
  }
  return 0;
}

/**
 * Helper d'affichage : formate le score attendu "2 - 1" ou avec labels
 * "PSG 2 - 1 OM".
 */
export function formatScoreGuessExpected(config: ScoreGuessConfig): string {
  const left = config.labelHome ? `${config.labelHome} ` : "";
  const right = config.labelAway ? ` ${config.labelAway}` : "";
  // V55 : "?" si pas encore saisi
  const h = config.expectedHome ?? "?";
  const a = config.expectedAway ?? "?";
  return `${left}${h} - ${a}${right}`;
}
