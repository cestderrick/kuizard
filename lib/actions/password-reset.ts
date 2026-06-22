"use server";

// =============================================
// V47.31 — Server Actions : mot de passe oublié
// =============================================
// Flow :
//  1. /forgot-password : user saisit son email -> requestPasswordResetAction
//     - on génère un token aléatoire (32 bytes hex)
//     - on stocke un HASH sha256 (pas le clair) en BDD avec expiration 1h
//     - on envoie un email avec le lien /reset-password?token=XXX
//     - on répond TOUJOURS "OK" même si email inconnu (anti-enum)
//  2. /reset-password?token=XXX : user saisit nouveau pwd -> resetPasswordAction
//     - on hash le token reçu et on cherche en BDD
//     - on vérifie expiration + non-utilisé
//     - on update passwordHash + on marque le token usedAt

import crypto from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sendEmail } from "@/lib/email/client";
import { rateLimitWithCleanup, getClientIp } from "@/lib/security/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// -----------------------------------------------------
// REQUEST PASSWORD RESET (depuis /forgot-password)
// -----------------------------------------------------

const requestSchema = z.object({
  email: z.string().email("Adresse email invalide."),
});

export type RequestState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function requestPasswordResetAction(
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  // Rate limit : 5 demandes / IP / heure
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimitWithCleanup(`pwd-reset:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      message: "Trop de demandes. Réessaie dans une heure.",
    };
  }

  const parsed = requestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  // On répond TOUJOURS "OK" même si l'email n'existe pas (anti-enum)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (user?.passwordHash) {
    // Génère un token aléatoire
    const tokenClear = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(tokenClear);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    // Invalide les anciens tokens du user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Crée le nouveau token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Envoie l'email avec le lien
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";
    const resetUrl = `${appUrl}/reset-password?token=${tokenClear}`;

    await sendEmail({
      to: user.email,
      subject: "🔑 Réinitialise ton mot de passe Kuizard",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#faf7ff;border-radius:12px">
          <h1 style="color:#3d1786;font-size:22px;margin:0 0 12px">🔑 Mot de passe oublié</h1>
          <p style="color:#1a0e3a;font-size:15px;line-height:1.6">
            Bonjour ${user.name ?? ""},<br><br>
            Tu as demandé à réinitialiser ton mot de passe sur Kuizard.
            Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe :
          </p>
          <p style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="display:inline-block;background:#5523bb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#71717a;font-size:13px;line-height:1.5">
            Ce lien est valable <strong>1 heure</strong>. Si tu n'as pas demandé cette
            réinitialisation, tu peux ignorer cet email — ton mot de passe ne sera pas modifié.
          </p>
          <p style="color:#71717a;font-size:11px;margin-top:24px;border-top:1px solid #e5e5e5;padding-top:12px">
            Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>
            <span style="word-break:break-all">${resetUrl}</span>
          </p>
        </div>
      `,
      text: `Réinitialise ton mot de passe Kuizard : ${resetUrl}\n(Lien valable 1h.)`,
    });
  }

  return {
    ok: true,
    message:
      "Si cette adresse correspond à un compte, tu vas recevoir un email avec un lien de réinitialisation. Pense à vérifier tes spams.",
  };
}

// -----------------------------------------------------
// RESET PASSWORD (depuis /reset-password?token=XXX)
// -----------------------------------------------------

const resetSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères.")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});

export type ResetState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const tokenHash = hashToken(parsed.data.token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return {
      ok: false,
      message:
        "Lien invalide ou expiré. Demande un nouveau lien depuis /forgot-password.",
    };
  }

  // Update password + marque le token utilisé
  const newHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return {
    ok: true,
    message: "Ton mot de passe a bien été mis à jour ! Tu peux te connecter.",
  };
}
