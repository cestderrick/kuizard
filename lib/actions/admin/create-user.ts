"use server";

// =============================================
// V58 — Admin : cree un compte user manuellement + envoie l'email de reset
// =============================================
// Cas d'usage : recuperation apres perte de BDD, invitation directe.
// L'admin saisit email + nom. On cree le user avec un passwordHash aleatoire
// (impossible a deviner), puis on envoie tout de suite un email avec un
// lien de reset password valable 24h (au lieu de 1h pour un reset normal).

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { hashPassword } from "@/lib/password";
import { sendEmail } from "@/lib/email/client";

const INVITE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h pour un invite (vs 1h reset normal)

const schema = z.object({
  email: z.string().email("Email invalide."),
  name: z.string().min(2, "Nom trop court.").max(80),
  accountType: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  sendInvite: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean()
  ),
});

export type AdminCreateUserState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  inviteLink?: string;
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function adminCreateUserAction(
  _prev: AdminCreateUserState,
  formData: FormData
): Promise<AdminCreateUserState> {
  const { user: admin } = await requireAdmin();

  const parsed = schema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    accountType: formData.get("accountType") ?? "INDIVIDUAL",
    role: formData.get("role") ?? "USER",
    sendInvite: formData.get("sendInvite"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifie les champs.",
    };
  }

  const { email, name, accountType, role, sendInvite } = parsed.data;
  const emailLower = email.toLowerCase().trim();

  // Verifie qu'il n'existe pas deja
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: { email: ["Un compte existe deja avec cet email."] },
    };
  }

  // Cree le user avec un passwordHash aleatoire (impossible a deviner).
  // Le user pourra soit faire "mot de passe oublie", soit cliquer sur
  // le lien du mail d'invitation ci-dessous.
  const randomPassword = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  const created = await prisma.user.create({
    data: {
      email: emailLower,
      name,
      passwordHash,
      accountType,
      role,
    },
    select: { id: true, email: true, name: true },
  });

  // Log admin
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "admin_create_user",
    targetUserId: created.id,
    targetUserEmail: created.email,
    payload: { accountType, role, sendInvite },
  });

  // Genere un token d'invitation + envoie l'email (si demande)
  let inviteLink: string | undefined;
  if (sendInvite) {
    const tokenClear = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(tokenClear);
    const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MS);
    await prisma.passwordResetToken.create({
      data: {
        userId: created.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";
    inviteLink = `${appUrl}/reset-password?token=${tokenClear}`;

    try {
      await sendEmail({
        to: created.email,
        subject: "✨ Ton compte Kuizard est pret",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#faf7ff;border-radius:12px">
            <h1 style="color:#3d1786;font-size:22px;margin:0 0 12px">✨ Bienvenue sur Kuizard</h1>
            <p style="color:#1a0e3a;font-size:15px;line-height:1.6">
              Bonjour ${created.name ?? ""},<br><br>
              Un compte Kuizard vient d'etre cree pour toi. Clique sur le bouton
              ci-dessous pour choisir ton mot de passe et te connecter.
            </p>
            <p style="text-align:center;margin:24px 0">
              <a href="${inviteLink}" style="display:inline-block;background:#5523bb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
                Definir mon mot de passe
              </a>
            </p>
            <p style="color:#71717a;font-size:13px;line-height:1.5">
              Ce lien est valable <strong>24 heures</strong>. Si tu ne l'utilises pas,
              tu pourras toujours faire "mot de passe oublie" sur la page de connexion.
            </p>
            <p style="color:#71717a;font-size:11px;margin-top:24px;border-top:1px solid #e5e5e5;padding-top:12px">
              Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>
              <span style="word-break:break-all">${inviteLink}</span>
            </p>
          </div>
        `,
        text: `Bienvenue sur Kuizard. Definis ton mot de passe : ${inviteLink}\n(Lien valable 24h.)`,
      });
    } catch (err) {
      console.error("[admin-create-user] email failed:", err);
      // On ne bloque pas la creation : l'admin voit le lien en clair dans la reponse
    }
  }

  revalidatePath("/admin/users");

  const msg = sendInvite
    ? `✅ Compte cree pour ${created.email}. Email d'invitation envoye.`
    : `✅ Compte cree pour ${created.email}. Il pourra faire "mot de passe oublie" pour se connecter.`;

  return {
    ok: true,
    message: msg,
    inviteLink,
  };
}
