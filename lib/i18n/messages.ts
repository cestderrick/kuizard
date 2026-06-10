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

// Re-export depuis locales.ts (sans dépendance Node, safe pour client)
export { type Locale, SUPPORTED_LOCALES } from "./locales";
import type { Locale } from "./locales";

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
  home: {
    eyebrow: string;
    hero_title_1: string;
    hero_title_2: string;
    hero_subtitle: string;
    cta_create: string;
    cta_play: string;
    cta_play_input_placeholder: string;
    // Section "Comment ça marche"
    how_eyebrow?: string;
    how_title?: string;
    step1_title?: string;
    step1_desc?: string;
    step2_title?: string;
    step2_desc?: string;
    step3_title?: string;
    step3_desc?: string;
    // Section "Pour qui"
    forwho_eyebrow?: string;
    forwho_title?: string;
    forwho_subtitle?: string;
    usecase_wedding_title?: string;
    usecase_wedding_desc?: string;
    usecase_birthday_title?: string;
    usecase_birthday_desc?: string;
    usecase_bachelor_title?: string;
    usecase_bachelor_desc?: string;
    usecase_bar_title?: string;
    usecase_bar_desc?: string;
    usecase_baby_title?: string;
    usecase_baby_desc?: string;
    usecase_corp_title?: string;
    usecase_corp_desc?: string;
    // Section "Vu côté joueur"
    player_eyebrow?: string;
    player_title?: string;
    player_subtitle?: string;
    // Tarifs teaser
    pricing_eyebrow?: string;
    pricing_title?: string;
    pricing_subtitle?: string;
    plan_discovery_name?: string;
    plan_discovery_desc?: string;
    plan_essential_name?: string;
    plan_essential_desc?: string;
    plan_festive_name?: string;
    plan_festive_desc?: string;
    plan_magic_name?: string;
    plan_magic_desc?: string;
    pricing_footer_pros?: string;
    // Abonnements pros
    pro_eyebrow?: string;
    pro_title?: string;
    pro_subtitle?: string;
    pro_bar_essentiel_name?: string;
    pro_bar_essentiel_price?: string;
    pro_bar_essentiel_period?: string;
    pro_bar_essentiel_yearly?: string;
    pro_bar_essentiel_f1?: string;
    pro_bar_essentiel_f2?: string;
    pro_bar_essentiel_f3?: string;
    pro_bar_essentiel_f4?: string;
    pro_bar_essentiel_f5?: string;
    pro_bar_essentiel_f6?: string;
    pro_bar_essentiel_f7?: string;
    pro_bar_pro_badge?: string;
    pro_bar_pro_name?: string;
    pro_bar_pro_price?: string;
    pro_bar_pro_period?: string;
    pro_bar_pro_yearly?: string;
    pro_bar_pro_f1?: string;
    pro_bar_pro_f2?: string;
    pro_bar_pro_f3?: string;
    pro_bar_pro_f4?: string;
    pro_bar_pro_f5?: string;
    pro_bar_pro_f6?: string;
    pro_bar_pro_f7_strong?: string;
    pro_bar_pro_f8?: string;
    pro_footer_note?: string;
    pro_cta_create?: string;
  };
  auth?: {
    login_title: string;
    login_subtitle: string;
    signup_title: string;
    signup_subtitle: string;
    email_label: string;
    password_label: string;
    confirm_password_label: string;
    name_label: string;
    submit_login: string;
    submit_signup: string;
    no_account: string;
    have_account: string;
    forgot_password: string;
    account_type_label: string;
    account_type_individual: string;
    account_type_business: string;
    creating: string;
  };
  dashboard?: {
    welcome_eyebrow: string;
    welcome_title: string;
    welcome_subtitle: string;
    recent_quizzes_title: string;
    recent_quizzes_empty: string;
    recent_quizzes_summary: string;
    see_all: string;
    create_first: string;
    create_new: string;
    questions_count: string;
    players_count: string;
    edit_button: string;
    payments_card: string;
    payments_card_desc: string;
    stats_card: string;
    stats_card_desc: string;
  };
  quizzes?: {
    page_title: string;
    page_subtitle: string;
    new_quiz: string;
    from_template: string;
    blank_quiz: string;
    empty_title: string;
    empty_subtitle: string;
    status_draft: string;
    status_published: string;
    status_running: string;
    status_finished: string;
    status_archived: string;
    code_label: string;
    questions_label: string;
    players_label: string;
  };
  payments?: {
    page_eyebrow: string;
    page_title: string;
    page_subtitle: string;
    total_spent: string;
    succeeded_count: string;
    all_count: string;
    history_title: string;
    empty_message: string;
    th_date: string;
    th_quiz: string;
    th_plan: string;
    th_code: string;
    th_amount: string;
    th_status: string;
    free: string;
    status_succeeded: string;
    status_pending: string;
    status_failed: string;
    status_refunded: string;
    invoices_hint: string;
  };
  subscription?: {
    page_eyebrow: string;
    page_title: string;
    page_subtitle: string;
    active_plan: string;
    active_plan_prefix: string;
    next_renewal: string;
    will_cancel: string;
    stripe_status: string;
    status_success: string;
    status_cancel: string;
    error_no_customer: string;
    no_subscription: string;
    plans_title: string;
    no_plans: string;
    recommended: string;
    per_month: string;
    per_year: string;
    subscribe_button: string;
    cross_sell_strong: string;
    cross_sell: string;
    cross_sell_link: string;
    cancel_anytime: string;
    cgv_link: string;
  };
  profile?: {
    page_eyebrow: string;
    page_title: string;
    member_since: string;
    info_title: string;
    name_label: string;
    name_placeholder: string;
    email_label: string;
    account_type_label: string;
    type_individual: string;
    type_business: string;
    update_button: string;
    updating: string;
    password_title: string;
    password_oauth_hint: string;
    current_password_label: string;
    new_password_label: string;
    confirm_password_label: string;
    change_password_button: string;
    password_updating: string;
    danger_zone: string;
    delete_warning_strong: string;
    delete_warning: string;
    delete_confirm_label: string;
    delete_confirm_value: string;
    delete_button: string;
    delete_deleting: string;
    delete_confirm_dialog: string;
    company_section_title: string;
  };
  stats?: {
    page_eyebrow: string;
    page_title: string;
    page_subtitle: string;
    my_quizzes: string;
    questions_created: string;
    participations: string;
    completed_suffix: string;
    spent: string;
    purchases_count: string;
    days_7_title: string;
    days_30_title: string;
    participations_started: string;
    top5_title: string;
    no_quiz_yet: string;
    th_quiz: string;
    th_status: string;
    th_questions: string;
    th_players: string;
    th_completion: string;
    th_avg_score: string;
    per_quiz_stats_title: string;
    quizzes_count_suffix: string;
    no_quizzes_yet: string;
    start_from_template: string;
    global_stats_title: string;
    global_stats_subtitle: string;
    published_suffix: string;
    players_suffix: string;
    code_label: string;
    questions_label: string;
    status_draft: string;
    status_published: string;
    status_running: string;
    status_finished: string;
    status_archived: string;
  };
  home_pro?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    feature_unlimited: string;
    feature_unlimited_desc: string;
    feature_live: string;
    feature_live_desc: string;
    feature_tv: string;
    feature_tv_desc: string;
    feature_brand: string;
    feature_brand_desc: string;
    cta_button: string;
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
  home: {
    eyebrow: "✨ Quizz personnalisés pour tes évènements",
    hero_title_1: "Crée un quizz magique",
    hero_title_2: "pour ton évènement",
    hero_subtitle:
      "Mariage, anniversaire, EVJF, bar… Personnalise ton quizz en quelques minutes et partage-le par QR code.",
    cta_create: "Créer mon quizz ✨",
    cta_play: "Rejoindre un quizz",
    cta_play_input_placeholder: "Code à 6 chiffres",
    // Comment ça marche
    how_eyebrow: "✨ Comment ça marche",
    how_title: "Trois étapes pour un moment magique",
    step1_title: "Crée ton quizz",
    step1_desc:
      "Titre, questions, photos, lots, couleurs… Tout est personnalisable en quelques minutes.",
    step2_title: "Partage le lien et le QR code",
    step2_desc:
      "Tes invités scannent le QR code et arrivent direct sur ton quizz. Pas d'app à installer.",
    step3_title: "Découvrez le classement",
    step3_desc:
      "À la fin, podium des 3 premiers et classement complet avec les lots que tu as configurés.",
    // Pour qui
    forwho_eyebrow: "✨ Pour qui",
    forwho_title: "Tous les moments à partager",
    forwho_subtitle:
      "Particuliers ou pros, chaque occasion devient une animation magique avec son quizz dédié.",
    usecase_wedding_title: "Mariages",
    usecase_wedding_desc:
      "Quiz sur les mariés pendant le repas. Photos d'enfance, anecdotes, défi des témoins.",
    usecase_birthday_title: "Anniversaires",
    usecase_birthday_desc:
      "Animation pour fêter une étape (30, 40, 50 ans…). Souvenirs partagés entre amis et famille.",
    usecase_bachelor_title: "EVJF / EVG",
    usecase_bachelor_desc:
      "« À quel point connais-tu la mariée ? » Photos, goûts, manies. Fous rires garantis.",
    usecase_bar_title: "Bars & restos",
    usecase_bar_desc:
      "Soirées quizz hebdomadaires, blind-tests, animations d'équipe. Mode live pour piloter en direct.",
    usecase_baby_title: "Baby-shower / naissance",
    usecase_baby_desc:
      "Tout savoir sur les futurs parents. Devine le prénom, le poids, les premières aventures.",
    usecase_corp_title: "Séminaires & teams",
    usecase_corp_desc:
      "Brise-glace, animations d'événements pros, formations ludiques. Idéal pour les groupes.",
    // Vu côté joueur
    player_eyebrow: "✨ Vu côté joueur",
    player_title: "L'expérience participants",
    player_subtitle:
      "Mobile-first, pas d'app à installer. Scan, pseudo, jeu, score — c'est tout.",
    // Tarifs teaser
    pricing_eyebrow: "✨ Tarifs",
    pricing_title: "Simple et transparent",
    pricing_subtitle:
      "Gratuit pour essayer, à l'unité pour les événements, en abonnement pour les pros. Sans engagement.",
    plan_discovery_name: "Découverte",
    plan_discovery_desc: "5 questions, 15 joueurs",
    plan_essential_name: "Essentiel",
    plan_essential_desc: "20 questions, 30 joueurs",
    plan_festive_name: "Festif ⭐",
    plan_festive_desc: "50 questions, 100 joueurs",
    plan_magic_name: "Magique",
    plan_magic_desc: "Illimité, vidéos",
    pricing_footer_pros:
      "Pour les pros (bars, hôtels, restos, séminaires) : abonnement mensuel ci-dessous.",
    // Abonnements pros
    pro_eyebrow: "✨ Abonnements pros",
    pro_title: "Quizz illimités pour ton lieu",
    pro_subtitle:
      "Idéal pour bars, hôtels, restaurants, escape rooms ou tout organisateur d'événements récurrents. Sans engagement, résiliable à tout moment.",
    pro_bar_essentiel_name: "Bar Essentiel",
    pro_bar_essentiel_price: "25 €",
    pro_bar_essentiel_period: "/ mois",
    pro_bar_essentiel_yearly: "ou 250 €/an (10 mois facturés)",
    pro_bar_essentiel_f1: "1 lieu",
    pro_bar_essentiel_f2: "Quizz illimités",
    pro_bar_essentiel_f3: "100 joueurs par session",
    pro_bar_essentiel_f4: "Mode pilotage live + afficheur",
    pro_bar_essentiel_f5: "Logo personnalisé",
    pro_bar_essentiel_f6: "Classement avec lots",
    pro_bar_essentiel_f7: "Conservation 6 mois",
    pro_bar_pro_badge: "MULTI-LIEUX",
    pro_bar_pro_name: "Bar Pro",
    pro_bar_pro_price: "50 €",
    pro_bar_pro_period: "/ mois",
    pro_bar_pro_yearly: "ou 500 €/an (10 mois facturés)",
    pro_bar_pro_f1: "Lieux illimités",
    pro_bar_pro_f2: "Quizz illimités",
    pro_bar_pro_f3: "500 joueurs par session",
    pro_bar_pro_f4: "Mode pilotage live + afficheur",
    pro_bar_pro_f5: "Logo + sous-domaine + thème custom",
    pro_bar_pro_f6: "Templates premium",
    pro_bar_pro_f7_strong: "Stats avancées + export CSV",
    pro_bar_pro_f8: "Support prioritaire (< 24h)",
    pro_footer_note:
      "✓ Sans engagement  ·  ✓ Résiliation libre  ·  ✓ Pas de reconduction tacite",
    pro_cta_create: "Créer un compte pro",
  },
  auth: {
    login_title: "Content de te revoir !",
    login_subtitle: "Connecte-toi pour gérer tes quizz.",
    signup_title: "Bienvenue chez Kuizard ✨",
    signup_subtitle: "Crée ton compte gratuit en 30 secondes.",
    email_label: "Email",
    password_label: "Mot de passe",
    confirm_password_label: "Confirmer le mot de passe",
    name_label: "Ton prénom",
    submit_login: "Se connecter ✨",
    submit_signup: "Créer mon compte ✨",
    no_account: "Pas encore de compte ?",
    have_account: "Tu as déjà un compte ?",
    forgot_password: "Mot de passe oublié ?",
    account_type_label: "Type de compte",
    account_type_individual: "👤 Particulier",
    account_type_business: "🏢 Professionnel",
    creating: "Création…",
  },
  dashboard: {
    welcome_eyebrow: "✨ Bienvenue",
    welcome_title: "Salut {name} !",
    welcome_subtitle:
      "Ton espace pour créer, gérer et partager des quizz personnalisés.",
    recent_quizzes_title: "Mes quizz récents",
    recent_quizzes_empty: "Tu n'as pas encore créé de quizz. Lance-toi !",
    recent_quizzes_summary: "{count} quizz au total — derniers en haut.",
    see_all: "Voir tous mes quizz",
    create_first: "Créer mon premier quizz ✨",
    create_new: "+ Créer un nouveau quizz",
    questions_count: "{count} questions",
    players_count: "{count} joueurs",
    edit_button: "Éditer",
    payments_card: "Mes paiements",
    payments_card_desc:
      "Historique des achats de quizz et abonnements, accès aux factures.",
    stats_card: "Statistiques",
    stats_card_desc:
      "Vue globale de l'activité : participations, top quizz, performances.",
  },
  quizzes: {
    page_title: "Mes quizz",
    page_subtitle: "Crée, édite et publie tes quizz personnalisés.",
    new_quiz: "Nouveau quizz",
    from_template: "Choisir un template ✨",
    blank_quiz: "Quizz vierge",
    empty_title: "Aucun quizz pour l'instant",
    empty_subtitle:
      "Crée ton premier quizz à partir d'un template ou en partant de zéro.",
    status_draft: "Brouillon",
    status_published: "Publié",
    status_running: "En direct",
    status_finished: "Terminé",
    status_archived: "Archivé",
    code_label: "Code",
    questions_label: "questions",
    players_label: "joueurs",
  },
  payments: {
    page_eyebrow: "💳 Paiements",
    page_title: "Mes paiements",
    page_subtitle: "Historique des achats de quizz et abonnements.",
    total_spent: "Total dépensé",
    succeeded_count: "Achats réussis",
    all_count: "Toutes transactions",
    history_title: "Historique",
    empty_message: "Tu n'as encore fait aucun achat.",
    th_date: "Date",
    th_quiz: "Quizz",
    th_plan: "Plan",
    th_code: "Code",
    th_amount: "Montant",
    th_status: "Statut",
    free: "Offert",
    status_succeeded: "Réussi",
    status_pending: "En attente",
    status_failed: "Échec",
    status_refunded: "Remboursé",
    invoices_hint:
      "Pour télécharger tes factures, utilise le portail Stripe (bouton ci-dessus).",
  },
  subscription: {
    page_eyebrow: "🔁 Abonnement",
    page_title: "Mon abonnement",
    page_subtitle:
      "Choisis un plan mensuel — idéal si tu organises plusieurs quizz dans l'année (particuliers comme bars/pros).",
    active_plan: "Plan actif",
    active_plan_prefix: "✓ Plan {plan} actif",
    next_renewal: "Prochain renouvellement : {date}",
    will_cancel: "(sera annulé à cette date)",
    stripe_status: "Statut Stripe : {status}",
    status_success: "✓ Souscription réussie ! Ton abo est actif.",
    status_cancel: "🪄 Souscription annulée, rien n'a été débité.",
    error_no_customer: "Tu n'as pas encore de compte Stripe. Souscris d'abord à un abo.",
    no_subscription:
      "Tu n'as pas encore d'abonnement actif. Choisis un plan ci-dessous.",
    plans_title: "Plans disponibles",
    no_plans: "Aucun plan d'abonnement configuré.",
    recommended: "⭐ Recommandé",
    per_month: "mois",
    per_year: "an",
    subscribe_button: "Souscrire à {plan}",
    cross_sell_strong: "Tu n'as besoin que d'un seul quizz ?",
    cross_sell:
      "Tu peux aussi payer à l'unité (à partir de 5 €), sans engagement.",
    cross_sell_link: "Voir mes quizz et payer à l'unité →",
    cancel_anytime:
      "Tu peux annuler à tout moment depuis le portail Stripe.",
    cgv_link: "Conditions Générales de Vente",
  },
  profile: {
    page_eyebrow: "👤 Profil",
    page_title: "Mon profil",
    member_since: "Membre depuis le {date}",
    info_title: "Informations",
    name_label: "Nom affiché",
    name_placeholder: "Comment veux-tu apparaître ?",
    email_label: "Email",
    account_type_label: "Type de compte",
    type_individual: "👤 Particulier",
    type_business: "🏢 Professionnel",
    update_button: "Mettre à jour",
    updating: "Enregistrement…",
    password_title: "🔐 Mot de passe",
    password_oauth_hint:
      "Tu t'es connecté via un fournisseur externe (Google, etc.). Le mot de passe se gère côté fournisseur.",
    current_password_label: "Mot de passe actuel",
    new_password_label: "Nouveau mot de passe",
    confirm_password_label: "Confirmer le nouveau",
    change_password_button: "🔐 Changer le mot de passe",
    password_updating: "Mise à jour…",
    danger_zone: "⚠️ Zone dangereuse",
    delete_warning_strong: "définitive et irréversible",
    delete_warning:
      "Cette action est {strong}. Tous tes quizz, participations, messages et données personnelles seront supprimés conformément au droit à l'oubli (RGPD art. 17).",
    delete_confirm_label: 'Tape "SUPPRIMER" pour confirmer',
    delete_confirm_value: "SUPPRIMER",
    delete_button: "🗑 Supprimer définitivement mon compte",
    delete_deleting: "Suppression…",
    delete_confirm_dialog:
      "Es-tu absolument sûr ? Cette suppression est définitive : quizz, participations, messages, tout sera effacé.",
    company_section_title: "🏢 Informations entreprise",
  },
  stats: {
    page_eyebrow: "📊 Statistiques",
    page_title: "Mes stats",
    page_subtitle: "Vue détaillée par quizz, puis vue globale en bas.",
    my_quizzes: "Mes quizz",
    questions_created: "Questions créées",
    participations: "Participations",
    completed_suffix: "{count} terminées ({rate}%)",
    spent: "Dépensé",
    purchases_count: "{count} achat(s)",
    days_7_title: "🌟 7 derniers jours",
    days_30_title: "📅 30 derniers jours",
    participations_started: "participation(s) démarrée(s)",
    top5_title: "🏆 Top 5 quizz par participation",
    no_quiz_yet: "Aucun quizz pour l'instant.",
    th_quiz: "Quizz",
    th_status: "Statut",
    th_questions: "Q",
    th_players: "👥",
    th_completion: "✓",
    th_avg_score: "⭐ Moy.",
    per_quiz_stats_title: "🎩 Mes statistiques par quizz",
    quizzes_count_suffix: "{count} quizz",
    no_quizzes_yet: "Tu n'as pas encore créé de quizz.",
    start_from_template: "Démarrer à partir d'un template →",
    global_stats_title: "🌍 Stats globales (tout cumulé)",
    global_stats_subtitle: "Récap de l'ensemble de ton activité.",
    published_suffix: "{count} publiés",
    players_suffix: "joueur(s)",
    code_label: "Code",
    questions_label: "{count} questions",
    status_draft: "Brouillon",
    status_published: "Publié",
    status_running: "En direct",
    status_finished: "Terminé",
    status_archived: "Archivé",
  },
  home_pro: {
    eyebrow: "✨ Pour les pros",
    title: "Abonnements pour bars, restaurants et événementiel",
    subtitle:
      "Quizz illimités, mode live, affichage TV, classements hebdo. Tout pour animer ton lieu sans souci.",
    feature_unlimited: "🎩 Quizz illimités",
    feature_unlimited_desc:
      "Crée et diffuse autant de quizz que tu veux, sans surprise.",
    feature_live: "📡 Mode live + classement direct",
    feature_live_desc:
      "Pilote tes soirées en temps réel, vois les réponses arriver.",
    feature_tv: "📺 Affichage TV",
    feature_tv_desc:
      "Branche un écran sur ton bar, le classement défile pour tes clients.",
    feature_brand: "🎨 Personnalisation totale",
    feature_brand_desc:
      "Couleurs, logo, ambiance — ton quizz à ton image.",
    cta_button: "Voir les abonnements ✨",
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
  home: {
    eyebrow: "✨ Personalized quizzes for your events",
    hero_title_1: "Create a magical quiz",
    hero_title_2: "for your event",
    hero_subtitle:
      "Wedding, birthday, bachelor(ette) party, bar… Personalize your quiz in minutes and share it with a QR code.",
    cta_create: "Create my quiz ✨",
    cta_play: "Join a quiz",
    cta_play_input_placeholder: "6-digit code",
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
  home: {
    eyebrow: "✨ Cuestionarios personalizados para tus eventos",
    hero_title_1: "Crea un cuestionario mágico",
    hero_title_2: "para tu evento",
    hero_subtitle:
      "Boda, cumpleaños, despedida, bar… Personaliza tu cuestionario en minutos y compártelo por QR.",
    cta_create: "Crear mi cuestionario ✨",
    cta_play: "Unirme a un cuestionario",
    cta_play_input_placeholder: "Código de 6 dígitos",
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
  home: {
    eyebrow: "✨ Quiz personalizzati per i tuoi eventi",
    hero_title_1: "Crea un quiz magico",
    hero_title_2: "per il tuo evento",
    hero_subtitle:
      "Matrimonio, compleanno, addio al nubilato, bar… Personalizza il tuo quiz in pochi minuti e condividilo via QR.",
    cta_create: "Crea il mio quiz ✨",
    cta_play: "Partecipa a un quiz",
    cta_play_input_placeholder: "Codice di 6 cifre",
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
  home: {
    eyebrow: "✨ Personalisierte Quizze für deine Events",
    hero_title_1: "Erstelle ein magisches Quiz",
    hero_title_2: "für dein Event",
    hero_subtitle:
      "Hochzeit, Geburtstag, Junggesell·innenabschied, Bar… Personalisiere dein Quiz in Minuten und teile es per QR-Code.",
    cta_create: "Mein Quiz erstellen ✨",
    cta_play: "Einem Quiz beitreten",
    cta_play_input_placeholder: "6-stelliger Code",
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
  home: {
    eyebrow: "✨ Quizzes personalizados para os teus eventos",
    hero_title_1: "Cria um quiz mágico",
    hero_title_2: "para o teu evento",
    hero_subtitle:
      "Casamento, aniversário, despedida, bar… Personaliza o teu quiz em minutos e partilha-o por QR.",
    cta_create: "Criar o meu quiz ✨",
    cta_play: "Entrar num quiz",
    cta_play_input_placeholder: "Código de 6 dígitos",
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
  home: {
    eyebrow: "✨ Персонализированные викторины для ваших мероприятий",
    hero_title_1: "Создай волшебную викторину",
    hero_title_2: "для своего события",
    hero_subtitle:
      "Свадьба, день рождения, девичник, бар… Настрой викторину за пару минут и поделись ею через QR-код.",
    cta_create: "Создать викторину ✨",
    cta_play: "Присоединиться",
    cta_play_input_placeholder: "Код из 6 цифр",
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
  home: {
    eyebrow: "✨ 为你的活动量身定制的问答",
    hero_title_1: "为你的活动",
    hero_title_2: "创建一个神奇问答",
    hero_subtitle:
      "婚礼、生日、单身派对、酒吧……几分钟内即可定制你的问答，并通过二维码分享。",
    cta_create: "创建我的问答 ✨",
    cta_play: "加入问答",
    cta_play_input_placeholder: "6 位数字代码",
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

// Locales manuelles (source de vérité quand renseignées)
const MANUAL_LOCALES: Record<Locale, Messages> = {
  fr,
  en,
  es,
  it,
  de,
  pt,
  ru,
  zh,
};

// Fusion deep avec les traductions auto-générées par DeepL (si présentes).
// Manuel a toujours priorité (sauf chaîne vide) ; auto remplit toutes les clés
// absentes du manuel (typique : nouvelles sections ajoutées sans traduction
// manuelle). On itère sur l'union des clés des deux objets, pas seulement
// celles du manuel.
function mergeDeep(manual: unknown, auto: unknown): unknown {
  // Si auto absent → on retourne manual tel quel
  if (auto === undefined || auto === null) return manual;
  // Si manual absent → on prend auto
  if (manual === undefined || manual === null) return auto;
  // Chaîne vide côté manual → on prend auto
  if (typeof manual === "string" && manual === "") return auto;
  // Deux objets non-array : merge récursif sur l'union des clés
  if (
    typeof manual === "object" &&
    typeof auto === "object" &&
    !Array.isArray(manual) &&
    !Array.isArray(auto)
  ) {
    const out: Record<string, unknown> = {};
    const m = manual as Record<string, unknown>;
    const a = auto as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(m), ...Object.keys(a)]);
    for (const k of allKeys) {
      out[k] = mergeDeep(m[k], a[k]);
    }
    return out;
  }
  // Feuille non vide côté manual → priorité au manuel
  return manual;
}

// Charge le JSON auto-généré via lecture filesystem au boot du process
// (plus fiable que import statique avec Turbopack qui parfois "perd" les JSON volumineux)
import { readFileSync } from "node:fs";
import { join } from "node:path";

let AUTO: Partial<Record<Locale, Messages>> = {};
try {
  const filePath = join(process.cwd(), "lib", "i18n", "messages-auto.json");
  const raw = readFileSync(filePath, "utf-8");
  AUTO = JSON.parse(raw);
} catch (err) {
  console.warn("[i18n] could not load messages-auto.json:", err);
  AUTO = {};
}

export const LOCALES: Record<Locale, Messages> = {
  fr: MANUAL_LOCALES.fr, // FR = source manuelle uniquement, jamais traduite
  en: mergeDeep(MANUAL_LOCALES.en, AUTO.en) as Messages,
  es: mergeDeep(MANUAL_LOCALES.es, AUTO.es) as Messages,
  it: mergeDeep(MANUAL_LOCALES.it, AUTO.it) as Messages,
  de: mergeDeep(MANUAL_LOCALES.de, AUTO.de) as Messages,
  pt: mergeDeep(MANUAL_LOCALES.pt, AUTO.pt) as Messages,
  ru: mergeDeep(MANUAL_LOCALES.ru, AUTO.ru) as Messages,
  zh: mergeDeep(MANUAL_LOCALES.zh, AUTO.zh) as Messages,
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

/**
 * Interpole les placeholders {key} dans une chaîne déjà résolue.
 * Usage: interp(messages.subscription.subscribe_button, { plan: "Pro" })
 */
export function interp(
  str: string,
  vars: Record<string, string | number> = {}
): string {
  if (typeof str !== "string") return String(str);
  return str.replace(/\{(\w+)\}/g, (_, name) =>
    String(vars[name] ?? `{${name}}`)
  );
}
