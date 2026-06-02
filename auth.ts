// =============================================
// Auth.js — Config complète (Node runtime)
// =============================================
// Utilisé par les Server Components, Server Actions, Route Handlers.
// Combine authConfig (Edge-safe) avec l'adapter Prisma et le provider Credentials.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT pour rester compat Edge middleware
  providers: [
    Credentials({
      name: "Email & mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCreds) {
        // 1. Validation de la forme des inputs
        const parsed = credentialsSchema.safeParse(rawCreds);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 2. Récupérer l'utilisateur en BDD
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        // 3. Vérifier le mot de passe
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        // 4. Retourner l'objet user pour la session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth — décommenter quand tu auras créé un projet sur Google Cloud
    // et que AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET seront dans ton .env.
    // import Google from "next-auth/providers/google"
    // Google,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // À la première connexion, on stocke l'id user dans le token JWT
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      // Le token est passé au client via la session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
