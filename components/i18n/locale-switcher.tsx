import { setLocaleAction } from "@/lib/actions/locale";
import { getLocale } from "@/lib/i18n/get-locale";
import { LocaleSelect } from "@/components/i18n/locale-select";

/**
 * Sélecteur de langue compact — drapeau + dropdown.
 * 8 langues = pas viable en pills inline, on passe en select natif (a11y et
 * clavier OK out of the box). Auto-submit géré par LocaleSelect (client).
 */
export async function LocaleSwitcher({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  const current = await getLocale();

  return (
    <form action={setLocaleAction} className="inline-flex items-center gap-1">
      <LocaleSelect current={current} variant={variant} />
      <noscript>
        <button type="submit" className="text-xs px-2 py-1 rounded-md bg-zinc-100">
          OK
        </button>
      </noscript>
    </form>
  );
}
