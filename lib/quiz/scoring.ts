// =============================================
// Helpers de scoring (réutilisés par submitAnswers + finishLiveInternal)
// =============================================
// Ces fonctions ne sont PAS des Server Actions : elles sont synchrones.
// On les sort de `lib/actions/participation.ts` (qui est `"use server"`)
// car Next 16 exige que tous les exports d'un fichier "use server" soient
// des fonctions async — ce qui cassait le build Turbopack.

export type StoredOption = { label: string; isCorrect: boolean };

export type Answer =
  | { type: "choice"; selectedIndices: number[] }
  | { type: "text"; value: string }
  | { type: "score"; home: number; away: number };

/**
 * Normalise un texte pour comparaison "tolérante" : sans accents, en
 * minuscule, sans espaces de bordure. Utilisé pour scorer les TEXT.
 */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function isOptionArray(v: unknown): v is StoredOption[] {
  return (
    Array.isArray(v) &&
    v.every(
      (o) =>
        typeof o === "object" &&
        o !== null &&
        typeof (o as StoredOption).label === "string" &&
        typeof (o as StoredOption).isCorrect === "boolean"
    )
  );
}

export function scoreAnswer(
  type: string,
  options: StoredOption[],
  answer: Answer | undefined,
  points: number,
  rawOptionsJson?: unknown
): number {
  if (!answer) return 0;

  // V50 — SCORE_GUESS : config dans rawOptionsJson, pas dans options[]
  if (type === "SCORE_GUESS") {
    if (answer.type !== "score") return 0;
    const sg = require("./score-guess") as typeof import("./score-guess");
    const config = sg.parseScoreGuessConfig(rawOptionsJson);
    const ans = sg.parseScoreGuessAnswer(answer);
    if (!config || !ans) return 0;
    return sg.computeScoreGuessPoints(config, ans);
  }

  if (type === "TEXT") {
    if (answer.type !== "text") return 0;
    const expected = options[0]?.label ?? "";
    return normalize(answer.value) === normalize(expected) ? points : 0;
  }

  if (answer.type !== "choice") return 0;
  const selectedSet = new Set(answer.selectedIndices);
  const correctSet = new Set(
    options.map((o, i) => (o.isCorrect ? i : -1)).filter((i) => i >= 0)
  );

  if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
    if (selectedSet.size !== 1) return 0;
    const [picked] = selectedSet;
    return correctSet.has(picked) ? points : 0;
  }

  if (type === "MULTIPLE_CHOICE") {
    if (selectedSet.size !== correctSet.size) return 0;
    for (const i of selectedSet) {
      if (!correctSet.has(i)) return 0;
    }
    return points;
  }

  return 0;
}
