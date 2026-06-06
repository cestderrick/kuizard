"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FAQ_NODES } from "@/lib/faq/tree";

export function InteractiveFaq() {
  const [historyIds, setHistoryIds] = useState<string[]>(["root"]);

  const currentId = historyIds[historyIds.length - 1];
  const node = FAQ_NODES[currentId];

  function go(nextId: string) {
    if (!FAQ_NODES[nextId]) return;
    setHistoryIds((h) => [...h, nextId]);
  }

  function back() {
    setHistoryIds((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }

  function reset() {
    setHistoryIds(["root"]);
  }

  if (!node) return null;

  return (
    <div className="bg-white text-[var(--color-foreground)] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5">
      {/* Fil d'Ariane */}
      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {historyIds.map((id, i) => {
          const n = FAQ_NODES[id];
          return (
            <span key={id + i} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-50">›</span>}
              <span
                className={
                  i === historyIds.length - 1
                    ? "font-semibold text-[var(--color-violet-primary)]"
                    : ""
                }
              >
                {n?.question.length > 30
                  ? n.question.slice(0, 30) + "…"
                  : n?.question}
              </span>
            </span>
          );
        })}
      </div>

      <h2
        className="font-display text-2xl tracking-wide"
        style={{ color: "var(--color-violet-deep)" }}
      >
        {node.question}
      </h2>

      {/* Si on a une réponse → on l'affiche */}
      {node.answer && (
        <div className="text-base leading-relaxed text-[var(--color-foreground)] bg-[var(--color-lavender)] rounded-xl p-5">
          {node.answer.split(/\.\s+/).map((sentence, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {sentence}
              {sentence && !sentence.endsWith(".") ? "." : ""}
            </p>
          ))}
        </div>
      )}

      {/* Liens éventuels */}
      {node.links && node.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {node.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-block px-4 py-2 rounded-md font-medium text-sm"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              {l.label} →
            </a>
          ))}
        </div>
      )}

      {/* Choix suivants */}
      {node.choices && node.choices.length > 0 && (
        <div className="grid gap-2">
          {node.choices.map((c) => (
            <button
              key={c.nextId}
              onClick={() => go(c.nextId)}
              className="text-left rounded-xl border-2 px-4 py-3 transition-colors hover:bg-[var(--color-lavender)]"
              style={{
                borderColor: "var(--color-violet-light)",
              }}
            >
              {c.label}
              <span
                className="float-right"
                style={{ color: "var(--color-violet-primary)" }}
              >
                →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Actions de navigation */}
      <div className="flex gap-2 pt-2 border-t">
        {historyIds.length > 1 && (
          <Button variant="ghost" size="sm" onClick={back}>
            ← Précédent
          </Button>
        )}
        {historyIds.length > 1 && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Recommencer
          </Button>
        )}
        <a
          href="/suggestion"
          className="ml-auto text-sm underline text-[var(--color-violet-primary)] flex items-center"
        >
          Pas trouvé ? Écris-nous ✨
        </a>
      </div>
    </div>
  );
}
