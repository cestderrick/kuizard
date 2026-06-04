// =============================================
// Helpers pour les lots (prizes)
// =============================================

export type Prize = {
  rank: number;
  label: string;
  description?: string;
  imageUrl?: string;
};

/**
 * Parse le champ `prizes` JSONB venant de Prisma en un array typé sécurisé.
 * Filtre les entrées malformées.
 */
export function parsePrizes(raw: unknown): Prize[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (p): p is Prize =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Prize).rank === "number" &&
        typeof (p as Prize).label === "string"
    )
    .map((p) => ({
      rank: p.rank,
      label: p.label,
      description: p.description ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
    }))
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Construit un Map { rank → Prize } pour lookup rapide depuis la page
 * classement.
 */
export function prizesByRank(prizes: Prize[]): Map<number, Prize> {
  const m = new Map<number, Prize>();
  for (const p of prizes) m.set(p.rank, p);
  return m;
}
