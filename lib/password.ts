// =============================================
// Helpers de hashage / vérification de mot de passe
// =============================================
// Utilise bcryptjs (pure JS, pas de native bindings, marche pareil
// sur Windows/macOS/Linux).
// Le coût de 12 rounds est un bon compromis sécurité/performance
// (~250ms par hash sur un CPU desktop moyen).

import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
