// =============================================
// Auth.js — Config Edge-safe
// =============================================
// Ce fichier est importé par middleware.ts (qui tourne en Edge runtime).
// Il NE DOIT PAS importer Prisma ou bcrypt (qui utilisent des APIs Node).
// La config complète (avec adapter Prisma) est dans auth.ts.

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    // signOut: "/logout",
    error: "/login", // redirige les erreurs vers la page login
  },
  callbacks: {
    /**
     * Détermine si la requête est autorisée à accéder à une page protégée.
     * Appelé par le middleware sur chaque route matchée.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");

      if (isOnDashboard || isOnAdmin) {
        // Auth requise sur /dashboard et /admin (la vérif du rôle ADMIN
        // se fait côté layout/page via requireAdmin — on ne peut pas faire
        // de query Prisma ici en Edge runtime).
        return isLoggedIn;
      }

      if (isOnAuthPage && isLoggedIn) {
        // Si déjà connecté et qu'on visite /login ou /signup, rediriger vers dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true; // toutes les autres routes sont publiques
    },
  },
  providers: [], // les providers sont déclarés dans auth.ts (où on peut utiliser Node)
} satisfies NextAuthConfig;
