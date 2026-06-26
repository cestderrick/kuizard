"use server";

// =============================================
// V51 — Admin : CRUD codes promo société
// =============================================

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";

const upsertSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/i),
  description: z.string().min(3).max(200),
  discountPercent: z.coerce.number().int().min(0).max(100).nullable().optional(),
  validUntil: z.string().optional(),
  maxUses: z.coerce.number().int().min(0).nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type AdminPromoState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function upsertCompanyPromoAction(
  _prev: AdminPromoState,
  formData: FormData
): Promise<AdminPromoState> {
  const { user: admin } = await requireAdmin();

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    userId: formData.get("userId"),
    code: String(formData.get("code") ?? "").toUpperCase(),
    description: formData.get("description"),
    discountPercent: formData.get("discountPercent") || null,
    validUntil: formData.get("validUntil") || undefined,
    maxUses: formData.get("maxUses") || null,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const validUntilDate =
    data.validUntil && data.validUntil.length > 0
      ? new Date(data.validUntil)
      : null;

  if (data.id) {
    const updated = await prisma.companyPromoCode.update({
      where: { id: data.id },
      data: {
        description: data.description,
        discountPercent: data.discountPercent ?? null,
        validUntil: validUntilDate,
        maxUses: data.maxUses ?? null,
        active: data.active,
      },
    });
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email ?? "",
      action: "promo_upsert",
      targetUserId: updated.userId,
      targetEntityId: updated.id,
      payload: { code: updated.code, mode: "update" },
    });
  } else {
    const created = await prisma.companyPromoCode.create({
      data: {
        userId: data.userId,
        code: data.code,
        description: data.description,
        discountPercent: data.discountPercent ?? null,
        validUntil: validUntilDate,
        maxUses: data.maxUses ?? null,
        active: data.active,
        createdByAdminId: admin.id,
      },
    });
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email ?? "",
      action: "promo_upsert",
      targetUserId: created.userId,
      targetEntityId: created.id,
      payload: { code: created.code, mode: "create" },
    });
  }

  revalidatePath("/admin/company-promos");
  return { ok: true, message: "Code promo enregistré." };
}

export async function deleteCompanyPromoAction(
  formData: FormData
): Promise<void> {
  const { user: admin } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const promo = await prisma.companyPromoCode.findUnique({
    where: { id },
    select: { id: true, userId: true, code: true },
  });
  if (!promo) return;
  await prisma.companyPromoCode.delete({ where: { id } });
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email ?? "",
    action: "promo_delete",
    targetUserId: promo.userId,
    targetEntityId: promo.id,
    payload: { code: promo.code },
  });
  revalidatePath("/admin/company-promos");
}
