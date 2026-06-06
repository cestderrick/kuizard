"use server";

// =============================================
// Server Actions — Messagerie user ↔ admin
// =============================================
//
// Convention :
// - Les actions "user" exigent une session connectée et opèrent uniquement
//   sur les conversations dont l'userId == session.user.id
// - Les actions "admin" exigent requireAdmin() et peuvent toucher n'importe
//   quelle conversation

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { MessagesState } from "@/lib/messages/types";

// Note : MessagesState et initialMessagesState sont exposés depuis
// `@/lib/messages/types` car ce fichier "use server" ne peut exporter
// que des fonctions async.

// =============================================
// USER — créer une conversation
// =============================================

const newConvoSchema = z.object({
  subject: z
    .string()
    .min(3, "Sujet trop court (3 caractères min).")
    .max(140, "Sujet trop long (140 max)."),
  body: z
    .string()
    .min(5, "Message trop court (5 caractères min).")
    .max(4000, "Message trop long (4000 max)."),
});

export async function createConversationAction(
  _prev: MessagesState,
  formData: FormData
): Promise<MessagesState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const parsed = newConvoSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs.",
    };
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      subject: parsed.data.subject,
      lastMessageAt: new Date(),
      unreadByAdmin: true,
      unreadByUser: false,
      messages: {
        create: {
          senderRole: "USER",
          body: parsed.data.body,
        },
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard/messages");
  revalidatePath("/admin/messages");
  redirect(`/dashboard/messages/${conversation.id}`);
}

// =============================================
// USER — poster un message dans une conversation
// =============================================

const replySchema = z.object({
  body: z
    .string()
    .min(1, "Message vide.")
    .max(4000, "Message trop long (4000 max)."),
  conversationId: z.string().min(1),
});

export async function postUserMessageAction(
  _prev: MessagesState,
  formData: FormData
): Promise<MessagesState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connexion requise." };
  }

  const parsed = replySchema.safeParse({
    body: formData.get("body"),
    conversationId: formData.get("conversationId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Message invalide.",
    };
  }

  const convo = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, userId: true, status: true },
  });
  if (!convo || convo.userId !== session.user.id) {
    return { ok: false, message: "Conversation introuvable." };
  }
  if (convo.status === "closed") {
    return {
      ok: false,
      message: "Cette conversation est clôturée.",
    };
  }

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: convo.id,
        senderRole: "USER",
        body: parsed.data.body,
      },
    }),
    prisma.conversation.update({
      where: { id: convo.id },
      data: {
        lastMessageAt: new Date(),
        unreadByAdmin: true,
        unreadByUser: false,
      },
    }),
  ]);

  revalidatePath(`/dashboard/messages/${convo.id}`);
  revalidatePath("/dashboard/messages");
  revalidatePath("/admin/messages");

  return { ok: true, message: "Envoyé." };
}

// =============================================
// USER — marquer lu
// =============================================
// Pas de revalidatePath ici : cette action est appelée pendant le render
// d'un server component (la page conversation) — Next 16 refuse les
// revalidate en cours de render. Le compteur unread sera à jour au prochain
// chargement de la liste de toutes manières.

export async function markConvoReadByUserAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.conversation.updateMany({
    where: { id: conversationId, userId: session.user.id },
    data: { unreadByUser: false },
  });
}

// =============================================
// ADMIN — poster une réponse
// =============================================

export async function postAdminMessageAction(
  _prev: MessagesState,
  formData: FormData
): Promise<MessagesState> {
  await requireAdmin();

  const parsed = replySchema.safeParse({
    body: formData.get("body"),
    conversationId: formData.get("conversationId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Message invalide.",
    };
  }

  const convo = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true },
  });
  if (!convo) return { ok: false, message: "Conversation introuvable." };

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: convo.id,
        senderRole: "ADMIN",
        body: parsed.data.body,
      },
    }),
    prisma.conversation.update({
      where: { id: convo.id },
      data: {
        lastMessageAt: new Date(),
        unreadByAdmin: false,
        unreadByUser: true,
      },
    }),
  ]);

  revalidatePath(`/admin/messages/${convo.id}`);
  revalidatePath("/admin/messages");
  revalidatePath(`/dashboard/messages/${convo.id}`);
  revalidatePath("/dashboard/messages");

  return { ok: true, message: "Réponse envoyée." };
}

// =============================================
// ADMIN — marquer lu + clore
// =============================================

export async function markConvoReadByAdminAction(conversationId: string) {
  await requireAdmin();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { unreadByAdmin: false },
  });
  // Pas de revalidatePath : appelée pendant le render (voir note plus haut)
}

export async function toggleConvoStatusAction(
  _prev: MessagesState,
  formData: FormData
): Promise<MessagesState> {
  await requireAdmin();
  const conversationId = (formData.get("conversationId") as string) ?? "";
  if (!conversationId) return { ok: false, message: "ID manquant." };

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { status: true },
  });
  if (!convo) return { ok: false, message: "Introuvable." };

  const next = convo.status === "open" ? "closed" : "open";
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: next },
  });

  revalidatePath(`/admin/messages/${conversationId}`);
  revalidatePath("/admin/messages");
  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");

  return {
    ok: true,
    message: next === "closed" ? "Conversation clôturée." : "Réouverte.",
  };
}

// =============================================
// Compteurs (badges)
// =============================================

export async function countUnreadForUser(userId: string): Promise<number> {
  return prisma.conversation.count({
    where: { userId, unreadByUser: true },
  });
}

export async function countUnreadForAdmin(): Promise<number> {
  return prisma.conversation.count({
    where: { unreadByAdmin: true, status: "open" },
  });
}
