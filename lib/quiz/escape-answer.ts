// =============================================
// V60.3 — Helpers de scoring / validation reponses escape
// =============================================

export type EscapeStepOption = { label: string; isCorrect: boolean };

/**
 * Normalise un texte pour comparaison "toleran te" : sans accents, minuscules,
 * espaces trim + reduits.
 */
export function normalizeAnswer(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Verifie si une reponse texte est correcte par rapport a l'attendu.
 * Accepte plusieurs reponses attendues separees par " | " (ex: "cle rouge | key red").
 */
export function isTextAnswerCorrect(
  userAnswer: string,
  expected: string
): boolean {
  const norm = normalizeAnswer(userAnswer);
  if (!norm) return false;
  const expectedList = expected.split("|").map((s) => normalizeAnswer(s));
  return expectedList.some((exp) => exp.length > 0 && exp === norm);
}

/**
 * Verifie si un choix CHOICE est correct : selectedIndex doit pointer sur
 * une option avec isCorrect === true.
 */
export function isChoiceAnswerCorrect(
  selectedIndex: number,
  options: unknown
): boolean {
  if (!Array.isArray(options)) return false;
  const opt = options[selectedIndex];
  return (
    typeof opt === "object" &&
    opt !== null &&
    (opt as EscapeStepOption).isCorrect === true
  );
}

/**
 * Verifie une reponse selon le type de l'etape.
 */
export function isEscapeAnswerCorrect(args: {
  stepType: string;
  expectedAnswer: string | null;
  options: unknown;
  userAnswer: string;
  selectedIndex: number | null;
}): boolean {
  const { stepType, expectedAnswer, options, userAnswer, selectedIndex } = args;
  if (stepType === "CHOICE") {
    if (selectedIndex === null) return false;
    return isChoiceAnswerCorrect(selectedIndex, options);
  }
  // TEXT, IMAGE, AUDIO
  if (!expectedAnswer) return false;
  return isTextAnswerCorrect(userAnswer, expectedAnswer);
}
