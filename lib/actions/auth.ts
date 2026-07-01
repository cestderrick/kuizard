"use server";

// =============================================
// Server Actions — Authentification
// =============================================
// Appelées depuis les formulaires de /signup et /login.

import { headers } from "next/headers";
import { z } from "zod";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { recordTermsAcceptance } from "@/lib/legal/acceptance";
import { rateLimitWithCleanup, getClientIp } from "@/lib/security/rate-limit";

// -----------------------------------------------------
// SIGNUP
// -----------------------------------------------------

const signupSchema = z.object({
  name: z.string().min(2, "Ton nom doit faire au moins 2 caractères.").max(80),
  email: z.string().email("Adresse email invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères.")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
  accountType: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
  // Acceptation explicite des CGU et CGV (case à cocher obligatoire).
  // La checkbox HTML ne soumet "on" que si cochée — on transforme en boolean.
  termsAccepted: z
    .preprocess((v) => v === "on" || v === "true" || v === true, z.boolean())
    .refine((v) => v === true, {
      message: "Tu dois accepter les CGU et les CGV pour créer un compte.",
    }),
  // V57 — Code promo optionnel : si valide + de type "cadeau" avec duree,
  // debloque un plan offert pour X jours des l'inscription.
  promoCode: z.string().max(40).optional().or(z.literal("")),
});

export type SignupState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  // V38 : Rate limit anti-spam — 5 inscriptions / IP / heure
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimitWithCleanup(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      message: `Trop de tentatives d'inscription depuis cette adresse. Réessaie dans ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  // 1. Validation des inputs
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType") ?? "INDIVIDUAL",
    termsAccepted: formData.get("termsAccepted"),
    promoCode: formData.get("promoCode") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { name, email, password, accountType, promoCode } = parsed.data;
  const emailLower = email.toLowerCase();

  // 2. Vérifier que l'email n'est pas déjà utilisé
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: {
        email: [
          "Un compte existe déjà avec cet email. Tu peux te connecter à la place.",
        ],
      },
    };
  }

  // 3. Hasher le mot de passe et créer le user
  const passwordHash = await hashPassword(password);
  const created = await prisma.user.create({
    data: {
      name,
      email: emailLower,
      passwordHash,
      accountType,
    },
    select: { id: true },
  });

  // 3.bis. Enregistrer l'acceptation explicite des CGU/CGV
  //        (historique pour preuve juridique : version + date + IP + UA)
  try {
    await recordTermsAcceptance(created.id);
  } catch (err) {
    // On ne bloque pas le signup si l'enregistrement échoue (rare), mais
    // on logue clairement pour audit.
    console.error("[signup] failed to record terms acceptance:", err);
  }

  // V57 — Application du code promo saisi a l'inscription (optionnel).
  // Si le code est valide, cadeau (giftPlanSlug) et a une duree (giftDurationDays),
  // on cree un GrantedPlan type "subscription" pour X jours + trace un Payment.
  // Un code invalide ne bloque PAS l'inscription (silent skip + log).
  const promoCleaned = (promoCode ?? "").trim().toUpperCase();
  if (promoCleaned) {
    try {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCleaned },
      });
      const now = new Date();
      const validGift =
        promo &&
        promo.isActive &&
        promo.giftPlanSlug &&
        promo.giftDurationDays &&
        promo.giftDurationDays > 0 &&
        (!promo.expiresAt || promo.expiresAt > now) &&
        (promo.maxRedemptions === null ||
          promo.redemptions < promo.maxRedemptions);
      if (validGift && promo) {
        const durationDays = promo.giftDurationDays as number;
        const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
        await prisma.$transaction([
          prisma.grantedPlan.create({
            data: {
              userId: created.id,
              planSlug: promo.giftPlanSlug as string,
              type: "subscription",
              quizId: null,
              startsAt: now,
              endsAt,
              grantedBy: "SIGNUP_PROMO",
              reason: `Code promo à l'inscription : ${promoCleaned}`,
            },
          }),
          prisma.payment.create({
            data: {
              userId: created.id,
              quizId: null,
              amountCents: 0,
              planSlug: promo.giftPlanSlug as string,
              promoCodeId: promo.id,
              status: "succeeded",
            },
          }),
          prisma.promoCode.update({
            where: { id: promo.id },
            data: { redemptions: { increment: 1 } },
          }),
        ]);
        console.log(
          `[signup] promo ${promoCleaned} applique a ${emailLower} : ${promo.giftPlanSlug} pendant ${durationDays}j`
        );
      } else if (promo) {
        console.log(
          `[signup] promo ${promoCleaned} refuse pour ${emailLower} : inactif / expire / max redemptions / pas de duree cadeau.`
        );
      } else {
        console.log(`[signup] promo ${promoCleaned} inconnu pour ${emailLower}.`);
      }
    } catch (err) {
      // Ne bloque JAMAIS l'inscription si le code echoue.
      console.error("[signup] promo code error:", err);
    }
  }

  // Email de bienvenue (fire and forget — on n'attend pas la réponse Resend
  // pour ne pas ralentir l'inscription, et on tolère un échec silencieux)
  try {
    const { sendEmail } = await import("@/lib/email/client");
    const { welcomeEmail } = await import("@/lib/email/templates");
    const tpl = welcomeEmail({ name });
    void sendEmail({
      to: emailLower,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  } catch (err) {
    console.error("[signup] welcome email failed:", err);
  }

  // 4. Auto-login après création.
  // ⚠️ signIn() avec redirectTo va LANCER une exception NEXT_REDIRECT,
  // que Next.js intercepte naturellement pour effectuer le redirect.
  // On ne met PAS de try/catch ici → laisser propager.
  await signIn("credentials", {
    email: emailLower,
    password,
    redirectTo: "/dashboard",
  });

  return { ok: true };
}

// -----------------------------------------------------
// SIGNIN
// -----------------------------------------------------

const signinSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export type SigninState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function signinAction(
  _prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  // V38 : Rate limit anti brute-force — 10 tentatives / IP / 15 min
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimitWithCleanup(`signin:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      message: `Trop de tentatives de connexion. Réessaie dans ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  const parsed = signinSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Seul AuthError est intercepté ici (credentials invalides).
    // Les exceptions NEXT_REDIRECT doivent propager pour que Next gère le redirect.
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, message: "Email ou mot de passe incorrect." };
      }
      return {
        ok: false,
        message: "Une erreur d'authentification est survenue.",
      };
    }
    throw error;
  }

  return { ok: true };
}

// -----------------------------------------------------
// SIGNOUT
// -----------------------------------------------------

export async function signoutAction() {
  await signOut({ redirectTo: "/" });
}

// -----------------------------------------------------
// V57 — VERIFY PROMO CODE (avant signup, pas d'auth requise)
// -----------------------------------------------------

export type VerifyPromoState =
  | {
      ok: true;
      code: string;
      planSlug: string;
      durationDays: number;
      description: string | null;
    }
  | { ok: false; message: string };

/**
 * V57 — Verifie un code promo AVANT que l'utilisateur finalise son inscription.
 * Pas d'auth requise (le user n'a pas encore de compte). Rate-limitee par IP
 * pour eviter le scraping de codes.
 *
 * Ne consomme PAS le code : le decrementation de redemptions arrive uniquement
 * au moment du signupAction reel.
 */
export async function verifyPromoCodeAction(
  _prev: VerifyPromoState,
  formData: FormData
): Promise<VerifyPromoState> {
  // Rate limit : 20 verifications / IP / 15 min
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimitWithCleanup(`verify-promo:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      message: `Trop de tentatives. Reessaie dans ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  const codeRaw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (codeRaw.length < 3 || codeRaw.length > 40) {
    return { ok: false, message: "Code invalide." };
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: codeRaw } });
  if (!promo) {
    return { ok: false, message: "Code inconnu." };
  }
  if (!promo.isActive) {
    return { ok: false, message: "Ce code n'est plus actif." };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { ok: false, message: "Ce code a expire." };
  }
  if (
    promo.maxRedemptions !== null &&
    promo.redemptions >= promo.maxRedemptions
  ) {
    return {
      ok: false,
      message: "Ce code a atteint son nombre max d'utilisations.",
    };
  }
  if (!promo.giftPlanSlug || !promo.giftDurationDays) {
    return {
      ok: false,
      message:
        "Ce code ne peut pas etre utilise a l'inscription. Utilise-le au moment d'un achat.",
    };
  }

  return {
    ok: true,
    code: codeRaw,
    planSlug: promo.giftPlanSlug,
    durationDays: promo.giftDurationDays,
    description: promo.description,
  };
}

