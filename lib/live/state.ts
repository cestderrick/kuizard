// =============================================
// Types et parser pour Quiz.liveState (JSONB)
// =============================================

export type LiveState = {
  currentQuestionIndex: number; // -1 = pas commencé, 0+ = en cours
  questionOpenedAt: string | null; // ISO timestamp
  isPaused: boolean;
};

export const INITIAL_LIVE_STATE: LiveState = {
  currentQuestionIndex: -1,
  questionOpenedAt: null,
  isPaused: false,
};

export function parseLiveState(raw: unknown): LiveState {
  const t =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  return {
    currentQuestionIndex:
      typeof t.currentQuestionIndex === "number" ? t.currentQuestionIndex : -1,
    questionOpenedAt:
      typeof t.questionOpenedAt === "string" ? t.questionOpenedAt : null,
    isPaused: typeof t.isPaused === "boolean" ? t.isPaused : false,
  };
}

/**
 * Représentation publique envoyée aux clients SSE.
 * On évite d'envoyer des données sensibles.
 */
export type LiveBroadcast = {
  type: "state";
  status: "PUBLISHED" | "RUNNING" | "FINISHED" | string;
  currentQuestionIndex: number;
  isPaused: boolean;
  totalQuestions: number;
};
