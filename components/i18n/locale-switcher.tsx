import { getLocale } from "@/lib/i18n/get-locale";
import { LocaleSelect } from "@/components/i18n/locale-select";

/**
 * Sélecteur de langue — server component qui lit la locale active et délègue
 * à LocaleSelect (client component) pour gérer le changement + refresh.
 */
export async function LocaleSwitcher({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  const current = await getLocale();

  return <LocaleSelect current={current} variant={variant} />;
}
