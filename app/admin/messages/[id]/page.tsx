import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  markConvoReadByAdminAction,
  postAdminMessageAction,
} from "@/lib/actions/messages";
import { ReplyForm } from "@/components/messages/reply-form";
import { ToggleConvoStatusButton } from "@/components/admin/toggle-convo-status-button";

export const metadata: Metadata = {
  title: "Admin · Conversation",
};

type Params = Promise<{ id: string }>;

export default async function AdminConvoPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, accountType: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!convo) notFound();

  // Marquer lu côté admin
  if (convo.unreadByAdmin) {
    await markConvoReadByAdminAction(convo.id);
  }

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/admin/messages"
          className="text-sm text-[var(--color-lavender-2)] hover:text-[var(--color-gold)]"
        >
          ← Messagerie
        </Link>
        <ToggleConvoStatusButton
          conversationId={convo.id}
          currentStatus={convo.status}
        />
      </div>

      <header className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4">
        <h1 className="font-display text-2xl tracking-wide text-[var(--color-lavender)]">
          {convo.subject}
        </h1>
        <p className="text-xs opacity-70 mt-2">
          <span className="font-semibold">{convo.user.name ?? "—"}</span>{" "}
          <span className="font-mono">{convo.user.email}</span> ·{" "}
          {convo.user.accountType === "BUSINESS" ? "🏢 Pro" : "👤 Perso"} ·{" "}
          Démarrée le {fmt(convo.createdAt)} ·{" "}
          <span
            className={`px-2 py-0.5 rounded ${
              convo.status === "open"
                ? "bg-green-500/20 text-green-200"
                : "bg-zinc-500/20 text-zinc-300"
            }`}
          >
            {convo.status === "open" ? "Ouverte" : "Clôturée"}
          </span>
        </p>
      </header>

      {/* Fil */}
      <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-night)] p-4 md:p-6 border border-[rgba(167,139,250,0.15)]">
        {convo.messages.map((m) => {
          const isAdmin = m.senderRole === "ADMIN";
          return (
            <div
              key={m.id}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isAdmin
                    ? "bg-[var(--color-violet-primary)] text-white rounded-br-sm"
                    : "bg-[rgba(167,139,250,0.15)] border border-[rgba(167,139,250,0.3)] text-[var(--color-lavender)] rounded-bl-sm"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                  {isAdmin ? "🎩 Équipe" : "Utilisateur"} · {fmt(m.createdAt)}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ReplyForm
        conversationId={convo.id}
        action={postAdminMessageAction}
        placeholder="Réponse de l'équipe…"
        disabled={convo.status === "closed"}
        disabledMessage="Conversation clôturée. Rouvre-la pour répondre."
      />
    </div>
  );
}
