import { redirect, notFound } from "next/navigation";

import { getSetting, SETTING_KEYS } from "@/lib/site-settings";

/**
 * V47.1 — Démo publique. Redirige vers le quiz configuré par l'admin
 * (via /admin/site-settings). Permet de partager un lien court genre
 * https://kuizard.com/demo sur les réseaux pour faire essayer le produit
 * sans inscription.
 *
 * Si aucun quiz n'est configuré → 404.
 */
export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const code = await getSetting(SETTING_KEYS.demoQuizCode);
  if (!code) notFound();
  redirect(`/q/${code}`);
}
