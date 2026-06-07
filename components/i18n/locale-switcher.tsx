import { setLocaleAction } from "@/lib/actions/locale";
import { getLocale } from "@/lib/i18n/get-locale";
import { SUPPORTED_LOCALES } from "@/lib/i18n/messages";

/**
 * Sélecteur de langue minimaliste — boutons-pilules en bas de footer.
 * Server component : lit la locale active, propose les autres.
 */
export async function LocaleSwitcher({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  const current = await getLocale();
  const isLight = variant === "light";

  return (
    <form action={setLocaleAction} className="inline-flex items-center gap-1">
      {SUPPORTED_LOCALES.map((loc) => {
        const active = loc.value === current;
        return (
          <button
            key={loc.value}
            type="submit"
            name="locale"
            value={loc.value}
            disabled={active}
            className={`text-xs px-2 py-0.5 rounded-full transition ${
              active
                ? isLight
                  ? "bg-[var(--color-violet-primary)] text-white cursor-default"
                  : "bg-[var(--color-gold)] text-[var(--color-night)] cursor-default"
                : isLight
                ? "text-muted-foreground hover:text-[var(--color-violet-primary)]"
                : "opacity-70 hover:opacity-100"
            }`}
            aria-label={loc.label}
            title={loc.label}
          >
            <span>{loc.flag}</span>
          </button>
        );
      })}
    </form>
  );
}
