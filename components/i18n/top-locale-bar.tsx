import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Mini-bar flottant en haut à droite — sélecteur de langue + toggle dark mode
 * visible avant connexion (home, auth, joueur). Discret mais accessible.
 */
export function TopLocaleBar({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  return (
    <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
      <ThemeToggle variant={variant} />
      <LocaleSwitcher variant={variant} />
    </div>
  );
}
