// =============================================
// Next.js proxy (ex-"middleware" pré-Next.js 16) — protège les routes
// =============================================
// Tourne en Edge runtime → utilise auth.config.ts (sans Prisma).
// La logique de redirection vit dans authConfig.callbacks.authorized.

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Matche toutes les routes sauf les fichiers statiques, internals Next, et l'API auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
