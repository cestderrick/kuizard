// =============================================
// Locales — types et liste des langues supportées
// =============================================
// Fichier sans dépendance Node — safe à importer depuis les composants client.

export type Locale = "fr" | "en" | "it" | "de" | "es" | "pt" | "ru" | "zh";

export const SUPPORTED_LOCALES: { value: Locale; label: string; flag: string }[] =
  [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "it", label: "Italiano", flag: "🇮🇹" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "zh", label: "中文", flag: "🇨🇳" },
    { value: "ru", label: "Русский", flag: "🇷🇺" },
  ];
