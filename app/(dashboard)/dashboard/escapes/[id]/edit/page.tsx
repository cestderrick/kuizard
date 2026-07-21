import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  addEscapeStepAction,
  deleteEscapeAction,
  deleteEscapeStepAction,
} from "@/lib/actions/escape";
import { EscapeMetaForm } from "@/components/escape/escape-meta-form";

export const metadata: Metadata = {
  title: "Editer un escape",
};

const STEP_TYPE_LABEL: Record<string, string> = {
  TEXT: "Reponse texte",
  CHOICE: "Choix multiples",
  IMAGE: "Image + reponse",
  AUDIO: "Audio + reponse",
};

export default async function EscapeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const escape = await prisma.escape.findFirst({
    where: { id, userId: session.user.id },
    include: {
      steps: { orderBy: { order: "asc" } },
    },
  });
  if (!escape) notFound();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard/escapes" className="hover:underline">
          🗝️ Mes escapes
        </Link>
        <span>›</span>
        <span className="font-mono text-xs">{escape.code}</span>
      </div>

      <header>
        <h1 className="font-display text-3xl tracking-wide">{escape.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Code de partage :{" "}
          <span className="font-mono font-bold" style={{ color: "var(--color-violet-primary)" }}>
            {escape.code}
          </span>
        </p>
      </header>

      {/* Meta */}
      <section className="rounded-2xl border p-5 bg-white">
        <h2 className="font-display text-lg mb-3">Reglages</h2>
        <EscapeMetaForm
          escapeId={escape.id}
          defaultTitle={escape.title}
          defaultDescription={escape.description}
          defaultTimerMinutes={escape.timerMinutes}
          defaultHintCostPoints={escape.hintCostPoints}
        />
      </section>

      {/* Etapes */}
      <section className="rounded-2xl border p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">
            Etapes ({escape.steps.length})
          </h2>
          <form action={addEscapeStepAction}>
            <input type="hidden" name="escapeId" value={escape.id} />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              + Nouvelle etape
            </button>
          </form>
        </div>

        {escape.steps.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            Aucune etape. Clique &laquo; Nouvelle etape &raquo; pour commencer.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {escape.steps.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:shadow-sm transition-shadow"
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: "var(--color-lavender)",
                    color: "var(--color-violet-primary)",
                  }}
                >
                  {s.order}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {s.title || s.body.slice(0, 60) || <em>Etape vide</em>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STEP_TYPE_LABEL[s.type] ?? s.type} · {s.points} pt
                    {s.points > 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/escapes/${escape.id}/steps/${s.id}/edit`}
                  className="text-xs font-bold underline underline-offset-2"
                  style={{ color: "var(--color-violet-primary)" }}
                >
                  Editer
                </Link>
                <form
                  action={deleteEscapeStepAction}
                >
                  <input type="hidden" name="escapeId" value={escape.id} />
                  <input type="hidden" name="stepId" value={s.id} />
                  <button
                    type="submit"
                    className="text-xs text-destructive hover:opacity-80 px-2"
                    aria-label="Supprimer cette etape"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Zone dangereuse */}
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900 mb-2">
          Zone dangereuse
        </p>
        <form action={deleteEscapeAction}>
          <input type="hidden" name="escapeId" value={escape.id} />
          <button
            type="submit"
            className="text-xs text-red-700 border border-red-300 rounded px-3 py-1.5 hover:bg-red-100"
          >
            🗑 Supprimer definitivement cet escape
          </button>
        </form>
      </section>
    </div>
  );
}
