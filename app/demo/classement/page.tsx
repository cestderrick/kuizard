import { redirect, notFound } from "next/navigation";

import { getSetting, SETTING_KEYS } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function DemoClassementPage() {
  const code = await getSetting(SETTING_KEYS.demoQuizCode);
  if (!code) notFound();
  redirect(`/q/${code}/classement`);
}
