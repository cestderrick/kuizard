// =============================================
// Messages traduits — 8 langues
// =============================================
//
// I18n minimaliste sans routing localisé (pas de breaking change sur
// l'arborescence des routes). La locale est stockée dans le cookie
// `kz_locale`. Les composants serveur appellent `getMessages()` puis
// `t(messages, "ma.cle")`.
//
// Langues : FR (par défaut), EN, IT, DE, ES, PT, RU, ZH (simplifié)

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

// Type structurel commun à toutes les locales
export type Messages = {
  nav: {
    home: string;
    dashboard: string;
    quizzes: string;
    stats: string;
    payments: string;
    subscription: string;
    promos: string;
    messages: string;
    suggestions: string;
    profile: string;
    admin: string;
    logout: string;
    login: string;
    signup: string;
  };
  footer: {
    copy: string;
    edited_by: string;
    legal: string;
    cgu: string;
    cgv: string;
    privacy: string;
    cookies: string;
    faq: string;
    suggestion: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    loading: string;
    language: string;
  };
};

const fr: Messages = {
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
};

const en: Messages = {
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
    cgu: "Terms of use",
    cgv: "Sales terms",
    privacy: "Privacy",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Feedback",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading…",
    language: "Language",
  },
};

const es: Messages = {
  nav: {
    home: "Inicio",
    dashboard: "Panel",
    quizzes: "Mis cuestionarios",
    stats: "Estadísticas",
    payments: "Pagos",
    subscription: "Suscripción",
    promos: "Cupones",
    messages: "Mensajes",
    suggestions: "Sugerencias",
    profile: "Perfil",
    admin: "Admin",
    logout: "Cerrar sesión",
    login: "Iniciar sesión",
    signup: "Crear cuenta",
  },
  footer: {
    copy: "© {year} KUIZARD — Cuestionarios personalizados para tus eventos",
    edited_by: "Editado por {brand} · Todos los derechos reservados",
    legal: "Aviso legal",
    cgu: "Términos de uso",
    cgv: "Términos de venta",
    privacy: "Privacidad",
    cookies: "Cookies",
    faq: "Preguntas frecuentes",
    suggestion: "Sugerencia",
  },
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirm: "Confirmar",
    loading: "Cargando…",
    language: "Idioma",
  },
};

const it: Messages = {
  nav: {
    home: "Home",
    dashboard: "Bacheca",
    quizzes: "I miei quiz",
    stats: "Statistiche",
    payments: "Pagamenti",
    subscription: "Abbonamento",
    promos: "Codici promo",
    messages: "Messaggi",
    suggestions: "Suggerimenti",
    profile: "Profilo",
    admin: "Admin",
    logout: "Esci",
    login: "Accedi",
    signup: "Registrati",
  },
  footer: {
    copy: "© {year} KUIZARD — Quiz personalizzati per i tuoi eventi",
    edited_by: "Pubblicato da {brand} · Tutti i diritti riservati",
    legal: "Note legali",
    cgu: "Condizioni d'uso",
    cgv: "Condizioni di vendita",
    privacy: "Privacy",
    cookies: "Cookie",
    faq: "FAQ",
    suggestion: "Suggerimento",
  },
  common: {
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    confirm: "Conferma",
    loading: "Caricamento…",
    language: "Lingua",
  },
};

const de: Messages = {
  nav: {
    home: "Startseite",
    dashboard: "Dashboard",
    quizzes: "Meine Quizze",
    stats: "Statistik",
    payments: "Zahlungen",
    subscription: "Abo",
    promos: "Gutscheine",
    messages: "Nachrichten",
    suggestions: "Vorschläge",
    profile: "Profil",
    admin: "Admin",
    logout: "Abmelden",
    login: "Anmelden",
    signup: "Konto erstellen",
  },
  footer: {
    copy: "© {year} KUIZARD — Personalisierte Quizze für deine Events",
    edited_by: "Herausgegeben von {brand} · Alle Rechte vorbehalten",
    legal: "Impressum",
    cgu: "Nutzungsbedingungen",
    cgv: "Verkaufsbedingungen",
    privacy: "Datenschutz",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Vorschlag",
  },
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    confirm: "Bestätigen",
    loading: "Lädt…",
    language: "Sprache",
  },
};

const pt: Messages = {
  nav: {
    home: "Início",
    dashboard: "Painel",
    quizzes: "Os meus quizzes",
    stats: "Estatísticas",
    payments: "Pagamentos",
    subscription: "Subscrição",
    promos: "Cupões",
    messages: "Mensagens",
    suggestions: "Sugestões",
    profile: "Perfil",
    admin: "Admin",
    logout: "Terminar sessão",
    login: "Entrar",
    signup: "Criar conta",
  },
  footer: {
    copy: "© {year} KUIZARD — Quizzes personalizados para os teus eventos",
    edited_by: "Publicado por {brand} · Todos os direitos reservados",
    legal: "Aviso legal",
    cgu: "Termos de utilização",
    cgv: "Termos de venda",
    privacy: "Privacidade",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Sugestão",
  },
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirm: "Confirmar",
    loading: "A carregar…",
    language: "Idioma",
  },
};

const ru: Messages = {
  nav: {
    home: "Главная",
    dashboard: "Панель",
    quizzes: "Мои викторины",
    stats: "Статистика",
    payments: "Платежи",
    subscription: "Подписка",
    promos: "Промокоды",
    messages: "Сообщения",
    suggestions: "Предложения",
    profile: "Профиль",
    admin: "Админ",
    logout: "Выйти",
    login: "Войти",
    signup: "Создать аккаунт",
  },
  footer: {
    copy: "© {year} KUIZARD — Персонализированные викторины для ваших мероприятий",
    edited_by: "Издано {brand} · Все права защищены",
    legal: "Правовая информация",
    cgu: "Условия использования",
    cgv: "Условия продажи",
    privacy: "Конфиденциальность",
    cookies: "Cookies",
    faq: "FAQ",
    suggestion: "Предложение",
  },
  common: {
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    confirm: "Подтвердить",
    loading: "Загрузка…",
    language: "Язык",
  },
};

const zh: Messages = {
  nav: {
    home: "首页",
    dashboard: "控制台",
    quizzes: "我的问答",
    stats: "统计",
    payments: "付款",
    subscription: "订阅",
    promos: "优惠码",
    messages: "消息",
    suggestions: "建议",
    profile: "个人资料",
    admin: "管理",
    logout: "退出",
    login: "登录",
    signup: "注册",
  },
  footer: {
    copy: "© {year} KUIZARD — 为您的活动量身定制的问答",
    edited_by: "由 {brand} 出品 · 保留所有权利",
    legal: "法律声明",
    cgu: "使用条款",
    cgv: "销售条款",
    privacy: "隐私",
    cookies: "Cookies",
    faq: "常见问题",
    suggestion: "建议",
  },
  common: {
    save: "保存",
    cancel: "取消",
    delete: "删除",
    confirm: "确认",
    loading: "加载中…",
    language: "语言",
  },
};

export const LOCALES: Record<Locale, Messages> = {
  fr,
  en,
  es,
  it,
  de,
  pt,
  ru,
  zh,
};

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
