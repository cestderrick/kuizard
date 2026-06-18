// =============================================
// V34 — Top 5 classement public (pour mode TV)
// =============================================
// GET /api/quiz/[code]/top-leaderboard
// Renvoie les 5 meilleurs scores (anonymisé sauf pseudo) pour affichage TV.
// Public, pas d'auth.

import { getQuizLeaderboard } from "@/lib/quiz/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const data = await getQuizLeaderboard(code);
  if (!data) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // On retourne uniquement le top 5 + le nombre total de participants
  const top = data.entries.slice(0, 5).map((e) => ({
    rank: e.rank,
    nickname: e.nickname,
    score: e.score,
  }));

  return Response.json(
    {
      top,
      totalEntries: data.entries.length,
      totalPoints: data.totalPoints,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
