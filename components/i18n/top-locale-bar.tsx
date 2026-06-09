import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

/**
 * Mini-bar flottant en haut à droite — sélecteur de langue visible avant
 * connexion (home, auth, joueur). Discret mais accessible.
 */
export function TopLocaleBar({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  return (
    <div className="absolute top-3 right-3 z-50">
      <LocaleSwitcher variant={variant} />
    </div>
  );
}
