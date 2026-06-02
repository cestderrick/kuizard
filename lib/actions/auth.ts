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
  // 1. Parser les données du formulaire
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType") ?? "INDIVIDUAL",
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

  // 2. Vérifier qu'aucun user n'existe déjà avec cet email
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) {
    return {
      ok: false,
      message: "Un compte existe déjà avec cet email. Essaie de te connecter.",
    };
  }

  // 3. Hasher le mot de passe et créer le user
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email: emailLower,
      passwordHash,
      accountType,
    },
  });

  // 4. Auto-login après la création
  try {
    await signIn("credentials", {
      email: emailLower,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // signIn redirige côté serveur, ce qui lève une exception NEXT_REDIRECT
    // qu'il faut relancer pour que Next la gère.
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message: "Compte créé, mais la connexion automatique a échoué. Essaie de te connecter manuellement.",
    };
  }

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
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, message: "Email ou mot de passe incorrect." };
        default:
          return { ok: false, message: "Une erreur est survenue. Réessaie." };
      }
    }
    // Re-throw les redirections Next pour qu'elles soient gérées
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
