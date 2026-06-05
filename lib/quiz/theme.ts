// =============================================
// Helper de thème visuel d'un quizz
// =============================================

export type QuizTheme = {
  primaryColor: string; // hex
  background: "night" | "light";
};

export const DEFAULT_THEME: QuizTheme = {
  primaryColor: "#6B46C1", // violet Kuizard
  background: "night",
};

/**
 * Parse le champ `theme` JSONB venant de Prisma avec fallback sur le défaut.
 */
export function parseTheme(raw: unknown): QuizTheme {
  const t =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  const primaryColor =
    typeof t.primaryColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(t.primaryColor)
      ? t.primaryColor
      : DEFAULT_THEME.primaryColor;

  const background =
    t.background === "light" ? "light" : DEFAULT_THEME.background;

  return { primaryColor, background };
}

/**
 * Style inline à appliquer à la page joueur, en variable CSS.
 * Permet aux composants enfants d'utiliser var(--quiz-primary, ...).
 */
export function themeToCssVars(theme: QuizTheme): React.CSSProperties {
  return {
    "--quiz-primary": theme.primaryColor,
  } as React.CSSProperties;
}
