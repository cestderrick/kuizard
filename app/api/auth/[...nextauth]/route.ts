// =============================================
// Route Handler Auth.js
// =============================================
// Expose les endpoints standards d'Auth.js (signIn, signOut, callback, session…)
// sous /api/auth/*. C'est ici que les requêtes OAuth et callbacks arrivent.
//
// auth.ts exporte un objet { handlers, auth, signIn, signOut }.
// handlers contient { GET, POST } qu'on déstructure ici.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
