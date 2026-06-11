"use server";

// =============================================
// Server Actions — Authentification
// =============================================
// Appelées depuis les formulaires de /signup et /login.

import { z } from "zod";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { recordTermsAcceptance } from "@/lib/legal/acceptance";

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
  // 1. Validation des inputs
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType") ?? "INDIVIDUAL",
    termsAccepted: formData.get("termsAccepted"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Vérifie les champs en erreur.",
    };
  }

  const { name, email, password, accountType } = parsed.data;
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
