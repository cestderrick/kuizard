"use client";

import { useState } from "react";

type Question = {
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "TEXT";
  text: string;
  points: number;
  options: { label: string; isCorrect: boolean }[];
};

type Props = {
  /** Valeur initiale — string JSON parsable depuis le textarea legacy */
  initialJson?: string;
  /** Nom du champ hidden dans le form pour la submission (compat avec action) */
  fieldName?: string;
};

const DEFAULT_QUESTIONS: Question[] = [
  {
    type: "SINGLE_CHOICE",
    text: "",
    points: 1,
    options: [
      { label: "", isCorrect: true },
      { label: "", isCorrect: false },
    ],
  },
];

function safeParse(json: string | undefined): Question[] {
  if (!json) return DEFAULT_QUESTIONS;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Question[];
    }
  } catch {
    // ignore
  }
  return DEFAULT_QUESTIONS;
}

export function TemplateQuestionsEditor({
  initialJson,
  fieldName = "questionsJson",
}: Props) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    safeParse(initialJson)
  );

  const setQuestion = (i: number, q: Partial<Question>) => {
    setQuestions((prev) => prev.map((qq, idx) => (idx === i ? { ...qq, ...q } : qq)));
  };
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        type: "SINGLE_CHOICE",
        text: "",
        points: 1,
        options: [
          { label: "", isCorrect: true },
          { label: "", isCorrect: false },
        ],
      },
    ]);
  };
  const removeQuestion = (i: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };
  const moveQuestion = (i: number, dir: -1 | 1) => {
    setQuestions((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const addOption = (qi: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi
          ? { ...q, options: [...q.options, { label: "", isCorrect: false }] }
          : q
      )
    );
  };
  const removeOption = (qi: number, oi: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q
      )
    );
  };
  const setOption = (qi: number, oi: number, patch: Partial<{ label: string; isCorrect: boolean }>) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)),
            }
          : q
      )
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={fieldName}
        value={JSON.stringify(questions)}
      />

      <p className="text-[10px] uppercase tracking-[2px] opacity-70">
        Questions ({questions.length})
      </p>

      {questions.map((q, i) => (
        <div
          key={i}
          className="rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.15)] p-3 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold opacity-80">
              Question {i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveQuestion(i, -1)}
                disabled={i === 0}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(i, 1)}
                disabled={i === questions.length - 1}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-xs px-2 py-1 rounded bg-red-500/15 text-red-300 hover:bg-red-500/25"
              >
                🗑
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={q.type}
              onChange={(e) =>
                setQuestion(i, { type: e.target.value as Question["type"] })
              }
              className="text-xs px-2 py-1.5 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)]"
            >
              <option value="SINGLE_CHOICE">Choix unique</option>
              <option value="MULTIPLE_CHOICE">Choix multiples</option>
              <option value="TRUE_FALSE">Vrai / Faux</option>
              <option value="TEXT">Réponse libre</option>
            </select>
            <input
              type="number"
              min={0}
              max={10}
              value={q.points}
              onChange={(e) =>
                setQuestion(i, { points: parseInt(e.target.value) || 0 })
              }
              placeholder="Points"
              className="text-xs px-2 py-1.5 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)]"
            />
          </div>

          <textarea
            value={q.text}
            onChange={(e) => setQuestion(i, { text: e.target.value })}
            placeholder="Texte de la question…"
            rows={2}
            className="text-sm px-2 py-1.5 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)]"
          />

          {q.type !== "TEXT" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-[1.5px] opacity-60">
                Options
              </p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type={q.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                    name={`q${i}-correct`}
                    checked={opt.isCorrect}
                    onChange={(e) => {
                      if (q.type === "MULTIPLE_CHOICE") {
                        setOption(i, oi, { isCorrect: e.target.checked });
                      } else {
                        // Radio : un seul correct → on désactive les autres
                        setQuestions((prev) =>
                          prev.map((qq, idx) =>
                            idx === i
                              ? {
                                  ...qq,
                                  options: qq.options.map((o, j) => ({
                                    ...o,
                                    isCorrect: j === oi,
                                  })),
                                }
                              : qq
                          )
                        );
                      }
                    }}
                    className="size-4 accent-[var(--color-gold)]"
                  />
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) =>
                      setOption(i, oi, { label: e.target.value })
                    }
                    placeholder="Réponse"
                    className="flex-1 text-xs px-2 py-1 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)]"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i, oi)}
                      className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 8 && q.type !== "TRUE_FALSE" && (
                <button
                  type="button"
                  onClick={() => addOption(i)}
                  className="text-xs self-start px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                >
                  + Ajouter une option
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="self-start px-4 py-2 rounded-lg bg-[var(--color-violet-primary)] text-white text-sm font-semibold hover:opacity-90"
      >
        + Ajouter une question
      </button>
    </div>
  );
}
