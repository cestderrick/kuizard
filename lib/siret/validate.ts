// =============================================
// Validation SIRET — format + clé Luhn
// =============================================
//
// Un SIRET valide :
// - 14 chiffres
// - dont la somme pondérée selon l'algo de Luhn est divisible par 10
//
// Cas particulier : "La Poste" (SIREN 356 000 000) a sa propre règle
// (somme des chiffres divisible par 5). On la gère aussi.

export type SiretCheck =
  | { ok: true; formatted: string }
  | { ok: false; message: string };

/**
 * Normalise un SIRET tapé par le user :
 * supprime espaces, points, tirets et garde les chiffres uniquement.
 */
export function normalizeSiret(input: string): string {
  return input.replace(/[\s.\-]/g, "");
}

/**
 * Valide un SIRET (format + Luhn).
 */
export function checkSiret(input: string): SiretCheck {
  const s = normalizeSiret(input);

  if (!/^\d{14}$/.test(s)) {
    return {
      ok: false,
      message: "Le SIRET doit comporter 14 chiffres.",
    };
  }

  // Cas particulier "La Poste" — règle modifiée
  if (s.startsWith("356000000")) {
    const sum = s.split("").reduce((acc, c) => acc + parseInt(c, 10), 0);
    if (sum % 5 === 0) return { ok: true, formatted: format(s) };
    return { ok: false, message: "Clé de contrôle invalide." };
  }

  // Algorithme de Luhn standard
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(s[i], 10);
    // Positions paires (en partant de la droite, 0-indexed depuis la gauche
    // sur 14 chiffres : positions 0, 2, 4, ... 12) → x2
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  if (sum % 10 !== 0) {
    return {
      ok: false,
      message: "Clé de contrôle SIRET invalide.",
    };
  }

  return { ok: true, formatted: format(s) };
}

/**
 * Formate "12345678900012" → "123 456 789 00012" (lisible).
 */
function format(s: string): string {
  return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)} ${s.slice(9, 14)}`;
}

/**
 * Extrait le SIREN (9 premiers chiffres) du SIRET.
 */
export function sirenFromSiret(siret: string): string {
  return normalizeSiret(siret).slice(0, 9);
}

/**
 * Calcule le N° de TVA intracommunautaire français à partir du SIREN.
 * Formule officielle DGFiP :
 *   FR + (12 + 3 × (SIREN mod 97)) mod 97 + SIREN
 *
 * Renvoie null si le SIREN n'a pas 9 chiffres.
 *
 * À noter : ce numéro existe mathématiquement pour tout SIREN, mais il
 * n'est "actif" que si l'entreprise est assujettie à la TVA. Les
 * micro-entreprises en franchise de TVA peuvent ignorer ce numéro.
 */
export function computeFrVatNumber(siren: string): string | null {
  const s = siren.replace(/\D/g, "");
  if (s.length !== 9) return null;
  const sirenInt = BigInt(s);
  const key = (BigInt(12) + (BigInt(3) * (sirenInt % BigInt(97)))) % BigInt(97);
  const keyStr = key.toString().padStart(2, "0");
  return `FR${keyStr}${s}`;
}
