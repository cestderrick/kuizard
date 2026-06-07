// =============================================
// Messages traduits — FR / EN
// =============================================
//
// I18n minimaliste sans routing localisé (pas de breaking change sur
// l'arborescence des routes). La locale est stockée dans le cookie
// `kz_locale`. Les composants serveur appellent `getMessages()` puis
// `t(messages, "ma.cle")`.
//
// Pour ajouter une nouvelle locale : copier l'objet fr ci-dessous, traduire
// les valeurs, et l'enregistrer dans `LOCALES`.

export type Locale = "fr" | "en";

export const SUPPORTED_LOCALES: { value: Locale; label: string; flag: string }[] =
  [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "en", label: "English", flag: "🇬🇧" },
  ];

const fr = {
  nav: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    quizzes: "Mes quizz",
    stats: "Stats",
    payments: "Paiements",
    subscription: "Abo",
    promos: "Codes promos",
    messages: "Messages",
    suggestions: "Suggestions",
    profile: "Profil",
    admin: "Admin",
    logout: "Se déconnecter",
    login: "Se connecter",
    signup: "Créer un compte",
  },
  footer: {
    copy: "© {year} KUIZARD — Quizz personnalisés pour tes évènements",
    edited_by: "Édité par {brand} · Tous droits réservés",
    legal: "Mentions légales",
    cgu: "CGU",
    cgv: "CGV",
    privacy: "Confidentialité",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Suggestion",
  },
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    confirm: "Confirmer",
    loading: "Chargement…",
    language: "Langue",
  },
} as const;

const en = {
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    quizzes: "My quizzes",
    stats: "Stats",
    payments: "Payments",
    subscription: "Plan",
    promos: "Promo codes",
    messages: "Messages",
    suggestions: "Suggestions",
    profile: "Profile",
    admin: "Admin",
    logout: "Sign out",
    login: "Sign in",
    signup: "Sign up",
  },
  footer: {
    copy: "© {year} KUIZARD — Personalized quizzes for your events",
    edited_by: "Published by {brand} · All rights reserved",
    legal: "Legal notice",
    cgu: "Terms",
    cgv: "Sales terms",
    privacy: "Privacy",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Suggestion",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading…",
    language: "Language",
  },
} as const;

export const LOCALES = { fr, en } as const;

export type Messages = typeof fr;

/**
 * Récupère une chaîne traduite avec interpolation simple ({key}).
 * Usage: t(messages, "footer.copy", { year: 2026 })
 */
export function t(
  messages: Messages,
  key: string,
  vars: Record<string, string | number> = {}
): string {
  const parts = key.split(".");
  let cursor: unknown = messages;
  for (const p of parts) {
    if (typeof cursor !== "object" || cursor === null) return key;
    cursor = (cursor as Record<string, unknown>)[p];
  }
  if (typeof cursor !== "string") return key;
  return cursor.replace(/\{(\w+)\}/g, (_, name) =>
    String(vars[name] ?? `{${name}}`)
  );
}
