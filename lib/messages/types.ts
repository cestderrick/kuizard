// =============================================
// Types + état initial des actions messagerie
// =============================================
// Fichier séparé du module "use server" car ce dernier ne peut exporter
// que des fonctions async (sinon Next 16 refuse).

export type MessagesState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  conversationId?: string;
};

export const initialMessagesState: MessagesState = { ok: false };
