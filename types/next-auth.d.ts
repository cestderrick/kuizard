// =============================================
// Étendre les types Auth.js pour ajouter user.id
// =============================================
// Sans cette augmentation, TypeScript râle quand on lit session.user.id
// (qui est custom, ajouté dans le callback session() de auth.ts).

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
