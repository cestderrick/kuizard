"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const COOKIE_NAME = "kz_locale";

const VALID_LOCALES = new Set([
  "fr",
  "en",
  "es",
  "it",
  "de",
  "pt",
  "ru",
  "zh",
]);

export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "fr");
  if (!VALID_LOCALES.has(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 an
    path: "/",
  });
  revalidatePath("/", "layout");
}
