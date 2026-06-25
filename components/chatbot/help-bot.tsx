"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import { QA, POPULAR_QUESTIONS, searchQA, type ChatQA } from "@/lib/chatbot/qa";

type ChatMsg =
  | { from: "bot"; text: string }
  | { from: "user"; text: string }
  | { from: "bot-qa"; qa: ChatQA }
  | { from: "bot-suggestions"; items: ChatQA[] }
  | { from: "bot-fallback" };

/**
 * V49 — Chatbot d'aide flottant.
 * Bouton 💬 en bas à droite. Au clic, ouvre un drawer avec des questions
 * populaires + un champ de recherche. Match keyword côté client (lib/chatbot/qa.ts).
 * Si aucun match satisfaisant, propose un lien vers /aide (ou /dashboard/messages
 * si user connecté).
 */
export function HelpBot({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      from: "bot",
      text:
        "👋 Salut ! Je suis le bot d'aide Kuizard. Pose-moi une question ou choisis un sujet populaire ci-dessous.",
    },
  ]);

  useEffect(() => setMounted(true), []);

  // Bloquer le scroll body quand le drawer est ouvert (mobile)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function pickPredefined(qa: ChatQA) {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: qa.question },
      { from: "bot-qa", qa },
    ]);
    setInput("");
  }

  function submitQuery(text: string) {
    const q = text.trim();
    if (!q) return;
    const matches = searchQA(q);
    setMessages((prev) => [
      ...prev,
      { from: "user", text: q },
      ...(matches.length > 0
        ? ([{ from: "bot-suggestions", items: matches } as ChatMsg])
        : ([{ from: "bot-fallback" } as ChatMsg])),
    ]);
    setInput("");
  }

  const contactHref = isLoggedIn ? "/dashboard/messages" : "/aide";
  const popular = POPULAR_QUESTIONS.map((id) =>
    QA.find((q) => q.id === id)
  ).filter((q): q is ChatQA => !!q);

  const drawer = open ? (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-end sm:justify-end pointer-events-none"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={() => setOpen(false)}
      />
      {/* Drawer */}
      <div
        className="relative pointer-events-auto w-full sm:w-[400px] sm:max-w-[95vw] sm:mr-4 sm:mb-20 h-[80vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ border: "2px solid var(--color-violet-primary)" }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-3 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl" aria-hidden>
              🪄
            </span>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">Aide Kuizard</p>
              <p className="text-xs opacity-80 truncate">
                Bot en ligne · réponse immédiate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 bg-zinc-50">
          {messages.map((m, i) => {
            if (m.from === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div
                    className="rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[80%]"
                    style={{
                      backgroundColor: "var(--color-violet-primary)",
                      color: "white",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            }
            if (m.from === "bot") {
              return (
                <div key={i} className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-3 py-2 text-sm max-w-[85%] leading-relaxed">
                    {m.text}
                  </div>
                </div>
              );
            }
            if (m.from === "bot-qa") {
              return (
                <div key={i} className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-white border-2 border-[var(--color-gold)]/40 px-3 py-2 text-sm max-w-[85%] leading-relaxed">
                    <p className="font-semibold mb-1 text-[var(--color-violet-deep)]">
                      💡 {m.qa.question}
                    </p>
                    <p className="text-zinc-700 whitespace-pre-line">
                      {m.qa.answer}
                    </p>
                  </div>
                </div>
              );
            }
            if (m.from === "bot-suggestions") {
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-3 py-2 text-sm max-w-[85%]">
                      Voici ce que j&apos;ai trouvé :
                    </div>
                  </div>
                  {m.items.map((qa) => (
                    <button
                      key={qa.id}
                      type="button"
                      onClick={() => pickPredefined(qa)}
                      className="text-left rounded-xl bg-white border border-[var(--color-violet-primary)]/30 px-3 py-2 text-xs font-medium text-[var(--color-violet-deep)] hover:bg-[var(--color-violet-primary)]/5 transition"
                    >
                      → {qa.question}
                    </button>
                  ))}
                </div>
              );
            }
            // bot-fallback
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-amber-50 border border-amber-200 px-3 py-2 text-sm max-w-[85%]">
                    🤔 Je n&apos;ai pas trouvé de réponse à ta question. Tu peux
                    me contacter directement :
                  </div>
                </div>
                <Link
                  href={contactHref}
                  onClick={() => setOpen(false)}
                  className="self-start rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  ✉️ {isLoggedIn ? "Envoyer un message" : "Centre d'aide"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Suggestions rapides + input */}
        <div className="border-t border-zinc-200 bg-white">
          {messages.length <= 1 && (
            <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
              {popular.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => pickPredefined(qa)}
                  className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-violet-primary)]/10 text-[var(--color-violet-primary)] font-semibold hover:bg-[var(--color-violet-primary)]/20 transition"
                >
                  {qa.question}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(input);
            }}
            className="flex gap-2 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tape ta question…"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-lg px-3 py-2 text-sm font-bold transition disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              ➤
            </button>
          </form>
          <p className="text-[10px] text-center text-zinc-400 pb-2 px-3">
            Bot d&apos;aide automatique — pas une vraie IA. Pour une réponse
            humaine, utilise « {isLoggedIn ? "Mes messages" : "Centre d'aide"} ».
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l'aide"
        className="fixed bottom-4 right-4 z-[9997] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        style={{
          background:
            "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
          color: "white",
        }}
        title="Besoin d'aide ?"
      >
        <span className="text-2xl" aria-hidden>
          💬
        </span>
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
