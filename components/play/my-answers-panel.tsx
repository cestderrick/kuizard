"use client";

import { useState } from "react";

type BreakdownItem = {
  id: string;
  order: number;
  type: string;
  text: string;
  points: number;
  options: string[];
  correctIndices: number[];
  userSelectedIndices: number[];
  userText: string | null;
  isCorrect: boolean;
  answered: boolean;
};

type ApiResponse =
  | {
      ok: true;
      breakdown: BreakdownItem[];
      participation: { nickname: string; score: number; completedAt: string };
    }
  | { ok: false; error: string; waiting?: boolean };

/**
 * Panneau dépliable "Mes réponses" qui apparait sur la page de score à la fin
 * du quizz. Fetch lazy : on charge les données seulement au premier clic.
 */
export function MyAnswersPanel({
  code,
  participationId,
}: {
  code: string;
  participationId: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (data) return; // déjà chargé
    setLoading(true);
    try {
      const res = await fetch(
        `/api/q/${code}/my-answers?participationId=${participationId}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (err) {
      setData({
        ok: false,
        error: err instanceof Error ? err.message : "Erreur de chargement.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-[rgba(167,139,250,0.3)] mt-4 pt-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 text-sm font-bold py-2.5 px-3 rounded-lg hover:opacity-90 transition"
        style={{
          // V47.21 : fond sombre semi-transparent + texte or → visible sur
          // TOUS les contextes (bloc gradient pâle "Tes résultats" SCHEDULED,
          // bloc night-2 sombre du classement final, etc.)
          color: "var(--color-gold-light)",
          WebkitTextFillColor: "var(--color-gold-light)",
          backgroundColor: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(245,158,11,0.4)",
        }}
        aria-expanded={open}
      >
        <span>📝 Voir mes réponses</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3 text-left">
          {loading && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Chargement…
            </p>
          )}
          {!loading && data?.ok === false && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              {data.waiting ? (
                <>
                  ⏳ Les réponses seront révélées quand l'organisateur clôturera
                  le quizz. Reviens un peu plus tard !
                </>
              ) : (
                <>❌ {data.error}</>
              )}
            </div>
          )}
          {!loading && data?.ok === true && (
            <ul className="flex flex-col gap-2.5">
              {data.breakdown.map((q) => (
                <li
                  key={q.id}
                  className={`rounded-lg p-3 text-sm border ${
                    q.type === "TEXT"
                      ? "bg-zinc-50 border-zinc-200"
                      : q.isCorrect
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-xs font-semibold opacity-60">
                      Q{q.order}
                    </span>
                    <span className="text-xs ml-auto">
                      {q.type === "TEXT" ? (
                        <span className="text-zinc-600">
                          📝 Réponse libre (non auto-évaluée)
                        </span>
                      ) : q.isCorrect ? (
                        <span className="text-green-700 font-bold">
                          ✓ +{q.points} pt{q.points > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-red-700 font-semibold">
                          ✗ 0 pt
                        </span>
                      )}
                    </span>
                  </div>
                  <p
                    className="font-bold mb-2"
                    style={{
                      color: "#1a0e3a",
                      WebkitTextFillColor: "#1a0e3a",
                    }}
                  >
                    {q.text}
                  </p>

                  {q.type === "TEXT" ? (
                    q.userText ? (
                      <p className="text-sm bg-white border border-zinc-200 rounded px-2 py-1.5 italic">
                        « {q.userText} »
                      </p>
                    ) : (
                      <p className="text-xs italic opacity-60">
                        Tu n'as pas répondu.
                      </p>
                    )
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {q.options.map((opt, i) => {
                        const isCorrect = q.correctIndices.includes(i);
                        const userPicked = q.userSelectedIndices.includes(i);
                        let cls = "text-zinc-600";
                        let prefix = "  ";
                        if (isCorrect && userPicked) {
                          cls = "text-green-800 font-semibold";
                          prefix = "✓";
                        } else if (isCorrect && !userPicked) {
                          cls = "text-green-700 font-medium";
                          prefix = "→";
                        } else if (!isCorrect && userPicked) {
                          cls = "text-red-700 line-through";
                          prefix = "✗";
                        }
                        return (
                          <li
                            key={i}
                            className={`text-xs flex items-center gap-2 ${cls}`}
                          >
                            <span className="w-4 text-center">{prefix}</span>
                            <span>{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          {data?.ok === true && (
            <p className="text-[10px] text-center opacity-60 mt-2">
              ✓ ta bonne réponse · → bonne réponse manquée · ✗ ta mauvaise réponse
            </p>
          )}
        </div>
      )}
    </div>
  );
}
