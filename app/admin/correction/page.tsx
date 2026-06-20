import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin · Correction",
};

// V44 — Liste toutes les questions où une option (réponse) apparaît plusieurs
// fois dans l\'array `options`. Comparaison insensible à la casse + trim des
// espaces blancs (un user qui a tapé "Paris" et "  PARIS " est en doublon).

type OptionShape = { label: string; isCorrect: boolean };

function findDuplicates(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  const seen = new Map<string, number>();
  const dupes = new Set<string>();
  for (const opt of options) {
    if (
      opt &&
      typeof opt === "object" &&
      typeof (opt as OptionShape).label === "string"
    ) {
      const norm = (opt as OptionShape).label.trim().toLowerCase();
      if (!norm) continue; // on ignore les labels vides
      const count = (seen.get(norm) ?? 0) + 1;
      seen.set(norm, count);
      if (count > 1) dupes.add((opt as OptionShape).label.trim());
    }
  }
  return Array.from(dupes);
}

export default async function AdminCorrectionPage() {
  await requireAdmin();

  // On récupère TOUTES les questions avec leurs options + le contexte quizz/user
  // Pour éviter de charger toute la BDD si elle grossit, on pourra
  // paginer ou ajouter un filtre by-user plus tard.
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      order: true,
      text: true,
      options: true,
      quiz: {
        select: {
          id: true,
          title: true,
          code: true,
          isLibrary: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: [{ quizId: "asc" }, { order: "asc" }],
  });

  // Filtrage en JS — on garde uniquement les questions avec ≥1 doublon
  const flagged = allQuestions
    .map((q) => ({ ...q, duplicates: findDuplicates(q.options) }))
    .filter((q) => q.duplicates.length > 0);

  // Regroupe par quiz pour un affichage plus lisible
  const byQuiz = new Map<string, typeof flagged>();
  for (const q of flagged) {
    const arr = byQuiz.get(q.quiz.id) ?? [];
    arr.push(q);
    byQuiz.set(q.quiz.id, arr);
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🩺 Correction
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1 max-w-3xl">
          Questions dans lesquelles une réponse apparaît plusieurs fois dans la
          liste d&apos;options. Comparaison insensible à la casse et aux
          espaces. C&apos;est presque toujours une faute de frappe du créateur.
        </p>
      </header>

      <div
        className="rounded-2xl border p-4 text-sm"
        style={{
          borderColor: "rgba(167,139,250,0.2)",
          background: "var(--color-night-2)",
        }}
      >
        <p style={{ color: "var(--color-lavender)" }}>
          <strong>{flagged.length}</strong> question
          {flagged.length > 1 ? "s" : ""} à corriger
          {flagged.length > 0 && (
            <>
              {" "}
              · réparties sur <strong>{byQuiz.size}</strong> quiz
              {byQuiz.size > 1 ? "z" : ""}
            </>
          )}
        </p>
      </div>

      {flagged.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{
            borderColor: "rgba(167,139,250,0.15)",
            background: "var(--color-night-2)",
          }}
        >
          <p className="text-4xl mb-3" aria-hidden>✨</p>
          <p style={{ color: "var(--color-lavender)" }}>
            Aucune question avec doublon détectée. Tout est propre !
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(byQuiz.entries()).map(([quizId, questions]) => {
            const quiz = questions[0].quiz;
            return (
              <section
                key={quizId}
                className="rounded-2xl border overflow-hidden"
                style={{
                  borderColor: "rgba(167,139,250,0.25)",
                  background: "var(--color-night-2)",
                }}
              >
                <header className="px-5 py-3 border-b" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0">
                      <p
                        className="font-display text-lg tracking-wide truncate"
                        style={{ color: "var(--color-lavender)" }}
                      >
                        {quiz.title}
                        {quiz.isLibrary && (
                          <span className="ml-2 text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-[var(--color-violet-primary)]/20 text-[var(--color-violet-primary)] align-middle">
                            📚 Banque
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-lavender-2)] opacity-70 mt-0.5">
                        Code <span className="font-mono">{quiz.code}</span> · par{" "}
                        {quiz.user.name ?? quiz.user.email} · {questions.length}{" "}
                        question{questions.length > 1 ? "s" : ""} à corriger
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/quizzes/${quizId}/edit`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--color-violet-primary)",
                        color: "white",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir le quiz →
                    </Link>
                  </div>
                </header>

                <ul className="divide-y" style={{ borderColor: "rgba(167,139,250,0.1)" }}>
                  {questions.map((q) => (
                    <li
                      key={q.id}
                      className="px-5 py-3 flex items-start justify-between gap-3 flex-wrap"
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold truncate"
                          style={{ color: "var(--color-lavender)" }}
                        >
                          Q{q.order}. {q.text || <em className="opacity-60">(question vide)</em>}
                        </p>
                        <p className="text-xs mt-1 text-[var(--color-lavender-2)] opacity-80">
                          Doublons détectés :{" "}
                          {q.duplicates.map((d, i) => (
                            <span key={d}>
                              {i > 0 && ", "}
                              <code
                                className="px-1.5 py-0.5 rounded text-[var(--color-gold-light)]"
                                style={{ background: "rgba(245,158,11,0.15)" }}
                              >
                                {d}
                              </code>
                            </span>
                          ))}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/quizzes/${quizId}/questions/${q.id}/edit`}
                        className="text-xs underline-offset-2 hover:underline whitespace-nowrap shrink-0"
                        style={{ color: "var(--color-gold-light)" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Modifier cette question ↗
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
