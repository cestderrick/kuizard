// =============================================
// V42 — Helpers SiteSetting (config admin dynamique)
// =============================================
// Permet à un admin de modifier certains contenus (URLs vidéos home, etc.)
// sans rebuild. Cache léger en mémoire pour éviter de hit la DB à chaque
// render du composant home.

import { prisma } from "@/lib/db";

// Clés utilisées dans le code — on les centralise pour éviter les typos
export const SETTING_KEYS = {
  videoIntro: "home.video.intro",
  videoCreation: "home.video.creation",
  videoJoueur: "home.video.joueur",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

// Cache mémoire : invalidé manuellement par setSetting
const cache = new Map<string, { value: string | null; expiresAt: number }>();
const TTL_MS = 60 * 1000; // 1 minute

export async function getSetting(key: string): Promise<string | null> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const row = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  const value = row?.value ?? null;
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}

/**
 * Version batch — récupère plusieurs clés en 1 query SQL.
 */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  const toFetch: string[] = [];

  for (const k of keys) {
    const cached = cache.get(k);
    if (cached && cached.expiresAt > Date.now()) {
      result[k] = cached.value;
    } else {
      toFetch.push(k);
    }
  }

  if (toFetch.length > 0) {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: toFetch } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    for (const k of toFetch) {
      const v = map.get(k) ?? null;
      cache.set(k, { value: v, expiresAt: Date.now() + TTL_MS });
      result[k] = v;
    }
  }

  return result;
}

export async function setSetting(
  key: string,
  value: string | null,
  updatedBy: string
): Promise<void> {
  if (value === null || value.trim() === "") {
    await prisma.siteSetting.deleteMany({ where: { key } });
  } else {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value.trim(), updatedBy },
      update: { value: value.trim(), updatedBy },
    });
  }
  cache.delete(key);
}
