// =============================================
// V38 — Rate limiter en mémoire (anti brute-force)
// =============================================
// Simple token bucket par clé (typiquement IP + endpoint). Pas distribué :
// chaque process Node a son propre Map. Si on scale au-delà d'un worker PM2,
// passer à Redis/Upstash. Largement suffisant pour limiter brute-force login.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * @param key   identifiant unique (ex: "login:" + ip)
 * @param max   nombre max de hits autorisés dans la fenêtre
 * @param windowMs durée de la fenêtre en ms
 * @returns true si autorisé, false si rate limit dépassé
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSec: 0 };
  }

  if (bucket.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count, retryAfterSec: 0 };
}

/**
 * Lit l'IP depuis les headers usuels (X-Forwarded-For en priorité car
 * derrière Cloudflare/Nginx). Fallback sur "unknown" si rien dispo.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

/**
 * Nettoyage périodique léger des buckets expirés (évite fuite mémoire si
 * beaucoup d'IPs uniques au fil du temps). Appelé automatiquement à chaque
 * 1 sur 100 appels (sampling).
 */
function maybeCleanup() {
  if (Math.random() > 0.01) return;
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

export function rateLimitWithCleanup(
  key: string,
  max: number,
  windowMs: number
) {
  maybeCleanup();
  return rateLimit(key, max, windowMs);
}
