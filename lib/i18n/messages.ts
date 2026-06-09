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
  player: {
    badge: string;
    nickname_label: string;
    nickname_placeholder: string;
    nickname_hint: string;
    questions_count: string;
    start_button: string;
    connecting: string;
    instructions: string;
    can_modify_hint: string;
    saving: string;
    saved: string;
    question_number: string;
    points_label: string;
    text_answer_placeholder: string;
    multi_choice_hint: string;
    submit_button: string;
    submit_button_modify: string;
    calculating: string;
    bravo: string;
    score_correct: string;
    msg_excellent: string;
    msg_good: string;
    msg_ok: string;
    msg_low: string;
    modify_button: string;
    leaderboard_button: string;
    powered_by: string;
    empty_title: string;
    empty_subtitle: string;
    inactive_title: string;
    inactive_subtitle: string;
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
  player: {
    badge: "✨ Quizz Kuizard ✨",
    nickname_label: "Ton pseudo",
    nickname_placeholder: "ex : Marie, La sorcière, Le mage…",
    nickname_hint: "Il apparaîtra sur le classement.",
    questions_count: "{count} question{s} à venir",
    start_button: "Commencer le quizz ✨",
    connecting: "Connexion…",
    instructions: "Réponds à toutes puis valide en bas de page",
    can_modify_hint: "📝 Tu peux modifier tes réponses tant que le créneau est ouvert",
    saving: "💾 sauvegarde…",
    saved: "✓ sauvegardé",
    question_number: "Question {n}",
    points_label: "{count} pt{s}",
    text_answer_placeholder: "Tape ta réponse…",
    multi_choice_hint: "Plusieurs réponses possibles",
    submit_button: "Voir mon score ✨",
    submit_button_modify: "Mettre à jour mes réponses 📝",
    calculating: "Calcul…",
    bravo: "Bravo {nickname} !",
    score_correct: "{ratio}% de bonnes réponses",
    msg_excellent: "Un vrai magicien 🪄",
    msg_good: "Pas mal du tout ✨",
    msg_ok: "Tu as quelques tours dans ta manche 🎩",
    msg_low: "C'est pas grave, l'essentiel est de participer 💜",
    modify_button: "📝 Modifier mes réponses",
    leaderboard_button: "🏆 Voir le classement",
    powered_by: "Propulsé par Kuizard",
    empty_title: "Le créateur finalise ce quizz",
    empty_subtitle: "Reviens dans quelques instants ✨",
    inactive_title: "Ce quizz n'est pas encore actif",
    inactive_subtitle: "Reviens plus tard, ou demande au créateur s'il l'a bien publié.",
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
  player: {
    badge: "✨ Kuizard Quiz ✨",
    nickname_label: "Your nickname",
    nickname_placeholder: "e.g. Mary, The wizard, The mage…",
    nickname_hint: "It will appear on the leaderboard.",
    questions_count: "{count} question{s} coming up",
    start_button: "Start the quiz ✨",
    connecting: "Connecting…",
    instructions: "Answer all of them then validate at the bottom",
    can_modify_hint: "📝 You can edit your answers as long as the window is open",
    saving: "💾 saving…",
    saved: "✓ saved",
    question_number: "Question {n}",
    points_label: "{count} pt{s}",
    text_answer_placeholder: "Type your answer…",
    multi_choice_hint: "Multiple answers allowed",
    submit_button: "See my score ✨",
    submit_button_modify: "Update my answers 📝",
    calculating: "Calculating…",
    bravo: "Well done {nickname}!",
    score_correct: "{ratio}% correct",
    msg_excellent: "A true wizard 🪄",
    msg_good: "Not bad at all ✨",
    msg_ok: "You've got a few tricks up your sleeve 🎩",
    msg_low: "No worries, what matters is to take part 💜",
    modify_button: "📝 Edit my answers",
    leaderboard_button: "🏆 See the leaderboard",
    powered_by: "Powered by Kuizard",
    empty_title: "The creator is finishing this quiz",
    empty_subtitle: "Come back in a few moments ✨",
    inactive_title: "This quiz is not active yet",
    inactive_subtitle: "Come back later, or ask the creator if it's been published.",
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
  player: {
    badge: "✨ Cuestionario Kuizard ✨",
    nickname_label: "Tu apodo",
    nickname_placeholder: "ej.: María, La maga, El mago…",
    nickname_hint: "Aparecerá en la clasificación.",
    questions_count: "{count} pregunta{s} por venir",
    start_button: "Empezar el cuestionario ✨",
    connecting: "Conectando…",
    instructions: "Responde a todas y valida al final de la página",
    can_modify_hint: "📝 Puedes editar tus respuestas mientras el plazo esté abierto",
    saving: "💾 guardando…",
    saved: "✓ guardado",
    question_number: "Pregunta {n}",
    points_label: "{count} pt{s}",
    text_answer_placeholder: "Escribe tu respuesta…",
    multi_choice_hint: "Varias respuestas posibles",
    submit_button: "Ver mi puntuación ✨",
    submit_button_modify: "Actualizar mis respuestas 📝",
    calculating: "Calculando…",
    bravo: "¡Bravo {nickname}!",
    score_correct: "{ratio}% de respuestas correctas",
    msg_excellent: "Un verdadero mago 🪄",
    msg_good: "¡Nada mal! ✨",
    msg_ok: "Tienes algunos trucos bajo la manga 🎩",
    msg_low: "No pasa nada, lo importante es participar 💜",
    modify_button: "📝 Editar mis respuestas",
    leaderboard_button: "🏆 Ver la clasificación",
    powered_by: "Hecho con Kuizard",
    empty_title: "El creador está terminando este cuestionario",
    empty_subtitle: "Vuelve en un momento ✨",
    inactive_title: "Este cuestionario aún no está activo",
    inactive_subtitle: "Vuelve más tarde o pregunta al creador si lo ha publicado.",
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
  player: {
    badge: "✨ Quiz Kuizard ✨",
    nickname_label: "Il tuo nickname",
    nickname_placeholder: "es.: Maria, La maga, Il mago…",
    nickname_hint: "Apparirà nella classifica.",
    questions_count: "{count} domanda{e} in arrivo",
    start_button: "Inizia il quiz ✨",
    connecting: "Connessione…",
    instructions: "Rispondi a tutte e poi conferma in fondo alla pagina",
    can_modify_hint: "📝 Puoi modificare le risposte finché la finestra è aperta",
    saving: "💾 salvataggio…",
    saved: "✓ salvato",
    question_number: "Domanda {n}",
    points_label: "{count} pt{s}",
    text_answer_placeholder: "Scrivi la tua risposta…",
    multi_choice_hint: "Più risposte possibili",
    submit_button: "Vedi il mio punteggio ✨",
    submit_button_modify: "Aggiorna le mie risposte 📝",
    calculating: "Calcolo…",
    bravo: "Bravo {nickname}!",
    score_correct: "{ratio}% di risposte corrette",
    msg_excellent: "Un vero mago 🪄",
    msg_good: "Niente male! ✨",
    msg_ok: "Hai qualche trucco nella manica 🎩",
    msg_low: "Non importa, l'importante è partecipare 💜",
    modify_button: "📝 Modifica le mie risposte",
    leaderboard_button: "🏆 Vedi la classifica",
    powered_by: "Realizzato con Kuizard",
    empty_title: "Il creatore sta finalizzando questo quiz",
    empty_subtitle: "Torna tra un momento ✨",
    inactive_title: "Questo quiz non è ancora attivo",
    inactive_subtitle: "Riprova più tardi o chiedi al creatore se è stato pubblicato.",
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
  player: {
    badge: "✨ Kuizard-Quiz ✨",
    nickname_label: "Dein Spitzname",
    nickname_placeholder: "z.B.: Maria, Die Hexe, Der Magier…",
    nickname_hint: "Er erscheint in der Rangliste.",
    questions_count: "{count} Frage{n} kommen",
    start_button: "Quiz starten ✨",
    connecting: "Verbindung…",
    instructions: "Beantworte alle und bestätige unten",
    can_modify_hint: "📝 Du kannst deine Antworten ändern, solange das Zeitfenster offen ist",
    saving: "💾 speichern…",
    saved: "✓ gespeichert",
    question_number: "Frage {n}",
    points_label: "{count} Pkt",
    text_answer_placeholder: "Tippe deine Antwort…",
    multi_choice_hint: "Mehrere Antworten möglich",
    submit_button: "Mein Ergebnis sehen ✨",
    submit_button_modify: "Antworten aktualisieren 📝",
    calculating: "Wird berechnet…",
    bravo: "Bravo {nickname}!",
    score_correct: "{ratio}% richtig",
    msg_excellent: "Ein echter Magier 🪄",
    msg_good: "Gar nicht schlecht! ✨",
    msg_ok: "Du hast ein paar Tricks auf Lager 🎩",
    msg_low: "Macht nichts, dabei sein ist alles 💜",
    modify_button: "📝 Antworten ändern",
    leaderboard_button: "🏆 Rangliste anzeigen",
    powered_by: "Bereitgestellt von Kuizard",
    empty_title: "Der Ersteller schließt dieses Quiz ab",
    empty_subtitle: "Komm gleich wieder ✨",
    inactive_title: "Dieses Quiz ist noch nicht aktiv",
    inactive_subtitle: "Versuch's später nochmal oder frag den Ersteller, ob es veröffentlicht ist.",
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
  player: {
    badge: "✨ Quiz Kuizard ✨",
    nickname_label: "O teu pseudónimo",
    nickname_placeholder: "ex.: Maria, A bruxa, O mago…",
    nickname_hint: "Aparecerá na classificação.",
    questions_count: "{count} pergunta{s} a chegar",
    start_button: "Começar o quiz ✨",
    connecting: "A ligar…",
    instructions: "Responde a todas e valida no fim da página",
    can_modify_hint: "📝 Podes editar as tuas respostas enquanto o prazo estiver aberto",
    saving: "💾 a guardar…",
    saved: "✓ guardado",
    question_number: "Pergunta {n}",
    points_label: "{count} pt{s}",
    text_answer_placeholder: "Escreve a tua resposta…",
    multi_choice_hint: "Várias respostas possíveis",
    submit_button: "Ver a minha pontuação ✨",
    submit_button_modify: "Atualizar as minhas respostas 📝",
    calculating: "A calcular…",
    bravo: "Parabéns {nickname}!",
    score_correct: "{ratio}% de respostas certas",
    msg_excellent: "Um verdadeiro mago 🪄",
    msg_good: "Nada mal! ✨",
    msg_ok: "Tens alguns truques na manga 🎩",
    msg_low: "Não faz mal, o que importa é participar 💜",
    modify_button: "📝 Editar as minhas respostas",
    leaderboard_button: "🏆 Ver a classificação",
    powered_by: "Feito com Kuizard",
    empty_title: "O criador está a finalizar este quiz",
    empty_subtitle: "Volta daqui a pouco ✨",
    inactive_title: "Este quiz ainda não está ativo",
    inactive_subtitle: "Volta mais tarde ou pergunta ao criador se foi publicado.",
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
  player: {
    badge: "✨ Викторина Kuizard ✨",
    nickname_label: "Твой ник",
    nickname_placeholder: "напр.: Маша, Волшебница, Маг…",
    nickname_hint: "Он появится в рейтинге.",
    questions_count: "Впереди {count} вопрос{ов}",
    start_button: "Начать викторину ✨",
    connecting: "Подключение…",
    instructions: "Ответь на все и подтверди внизу страницы",
    can_modify_hint: "📝 Ты можешь менять ответы, пока открыто окно",
    saving: "💾 сохранение…",
    saved: "✓ сохранено",
    question_number: "Вопрос {n}",
    points_label: "{count} б",
    text_answer_placeholder: "Введи свой ответ…",
    multi_choice_hint: "Можно несколько ответов",
    submit_button: "Узнать результат ✨",
    submit_button_modify: "Обновить мои ответы 📝",
    calculating: "Подсчёт…",
    bravo: "Молодец, {nickname}!",
    score_correct: "{ratio}% правильных ответов",
    msg_excellent: "Настоящий волшебник 🪄",
    msg_good: "Совсем неплохо! ✨",
    msg_ok: "У тебя есть пара трюков в рукаве 🎩",
    msg_low: "Ничего страшного, главное — участие 💜",
    modify_button: "📝 Изменить мои ответы",
    leaderboard_button: "🏆 Посмотреть рейтинг",
    powered_by: "Сделано на Kuizard",
    empty_title: "Создатель ещё дорабатывает эту викторину",
    empty_subtitle: "Вернись через мгновение ✨",
    inactive_title: "Эта викторина пока не активна",
    inactive_subtitle: "Зайди позже или спроси у создателя, опубликована ли она.",
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
  player: {
    badge: "✨ Kuizard 问答 ✨",
    nickname_label: "你的昵称",
    nickname_placeholder: "例如：小芳、女巫、魔法师……",
    nickname_hint: "它将显示在排行榜上。",
    questions_count: "即将有 {count} 道题",
    start_button: "开始答题 ✨",
    connecting: "连接中…",
    instructions: "全部回答后在页面底部确认",
    can_modify_hint: "📝 在时段内你可以随时修改答案",
    saving: "💾 保存中…",
    saved: "✓ 已保存",
    question_number: "第 {n} 题",
    points_label: "{count} 分",
    text_answer_placeholder: "输入你的答案…",
    multi_choice_hint: "可以选多个答案",
    submit_button: "查看我的得分 ✨",
    submit_button_modify: "更新我的答案 📝",
    calculating: "计算中…",
    bravo: "{nickname}，太棒了！",
    score_correct: "正确率 {ratio}%",
    msg_excellent: "真正的魔法师 🪄",
    msg_good: "相当不错！✨",
    msg_ok: "你还有些妙招呢 🎩",
    msg_low: "没关系，重在参与 💜",
    modify_button: "📝 修改我的答案",
    leaderboard_button: "🏆 查看排行榜",
    powered_by: "由 Kuizard 提供",
    empty_title: "创建者正在完善这个问答",
    empty_subtitle: "请稍候再回来 ✨",
    inactive_title: "这个问答还未启动",
    inactive_subtitle: "请稍后再来，或问问创建者是否已经发布。",
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
