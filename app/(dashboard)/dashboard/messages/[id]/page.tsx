import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  markConvoReadByUserAction,
  postUserMessageAction,
} from "@/lib/actions/messages";
import { ReplyForm } from "@/components/messages/reply-form";

export const metadata: Metadata = {
  title: "Conversation",
};

type Params = Promise<{ id: string }>;

export default async function ConvoPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!convo || convo.userId !== session.user.id) notFound();

  // Marquer lu (fire-and-forget)
  if (convo.unreadByUser) {
    await markConvoReadByUserAction(convo.id);
  }

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <Link
          href="/dashboard/messages"
          className="text-sm text-[var(--color-violet-primary)] hover:underline"
        >
          ← Mes messages
        </Link>
      </div>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1
            className="font-display text-2xl md:text-3xl font-bold tracking-wide"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {convo.subject}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Démarrée le {fmt(convo.createdAt)}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-md ${
            convo.status === "open"
              ? "bg-green-100 text-green-800"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {convo.status === "open" ? "Ouverte" : "Clôturée"}
        </span>
      </header>

      {/* Fil de messages */}
      <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-night)] p-4 md:p-6 border border-[rgba(167,139,250,0.15)]">
        {convo.messages.map((m) => {
          const isAdmin = m.senderRole === "ADMIN";
          return (
            <div
              key={m.id}
              className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isAdmin
                    ? "bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-[var(--color-lavender)] rounded-bl-sm"
                    : "bg-[var(--color-violet-primary)] text-white rounded-br-sm"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                  {isAdmin ? "🎩 Équipe Kuizard" : "Toi"} · {fmt(m.createdAt)}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Réponse */}
      <ReplyForm
        conversationId={convo.id}
        action={postUserMessageAction}
        placeholder="Écris ta réponse…"
        disabled={convo.status === "closed"}
        disabledMessage="Cette conversation a été clôturée. Crée un nouveau message si besoin."
      />
    </div>
  );
}
