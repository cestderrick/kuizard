// =============================================
// V42 — Utilitaire YouTube (server + client safe)
// =============================================
// Extrait l'ID YouTube de différents formats d'URL :
//   - https://youtu.be/XXXX
//   - https://www.youtube.com/watch?v=XXXX
//   - https://www.youtube.com/embed/XXXX
//   - https://youtube.com/shorts/XXXX
//   - XXXX directement
//
// Fichier sans "use client" pour pouvoir être appelé depuis n'importe quel
// Server Component. (Le crash V40 venait du fait qu'on l'exportait depuis
// lite-youtube.tsx qui a "use client" → server ne peut pas exécuter.)

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // ID brut (11 chars alphanum + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (
      u.hostname.endsWith("youtube.com") ||
      u.hostname.endsWith("youtube-nocookie.com")
    ) {
      // /watch?v=ID
      const v = u.searchParams.get("v");
      if (v) return v;
      // /embed/ID, /shorts/ID, /v/ID
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => ["embed", "shorts", "v"].includes(p));
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    }
  } catch {
    // pas une URL valide
  }
  return null;
}
