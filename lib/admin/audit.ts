// =============================================
// Audit log admin — helper d'enregistrement
// =============================================
// Toutes les server actions admin appellent logAdminAction() après leur
// modification pour tracer ce qui s'est passé.

import { headers } from "next/headers";

import { prisma } from "@/lib/db";

export type AdminActionType =
  | "ban"
  | "unban"
  | "promote"
  | "demote"
  | "grant_one_shot"
  | "grant_subscription"
  | "revoke_grant"
  | "weekly_set"
  | "weekly_remove"
  | "library_toggle"
  | "template_upsert"
  | "template_delete"
  | "plan_upsert"
  | "plan_delete"
  | "promo_upsert"
  | "promo_delete"
  | "delete_quiz"
  | "admin_create_user";

type Params = {
  adminId: string;
  adminEmail: string;
  action: AdminActionType;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  targetQuizId?: string | null;
  targetEntityId?: string | null;
  payload?: Record<string, unknown>;
};

/**
 * Enregistre une action admin dans l'audit log. Ne throw jamais — un échec
 * d'écriture du log ne doit pas bloquer l'action principale (juste un warn).
 */
export async function logAdminAction(params: Params): Promise<void> {
  // Récupère IP + UA depuis les headers
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ipAddress =
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent") ?? null;
  } catch {
    // ignore (appelé hors d'une requête HTTP)
  }

  try {
    await prisma.adminAction.create({
      data: {
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        action: params.action,
        targetUserId: params.targetUserId ?? null,
        targetUserEmail: params.targetUserEmail ?? null,
        targetQuizId: params.targetQuizId ?? null,
        targetEntityId: params.targetEntityId ?? null,
        payload: params.payload ? (params.payload as object) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // On ne fait pas planter l'action admin si le log échoue
    console.error("[admin/audit] log failed:", err);
  }
}
