// =============================================
// FAQ interactive — arbre de décision Q&A
// =============================================
// Chaque nœud peut avoir des "choices" (réponses qui mènent à d'autres nœuds)
// et/ou une "answer" finale.

export type FaqNode = {
  id: string;
  question: string;
  choices?: { label: string; nextId: string }[];
  answer?: string;
  links?: { label: string; href: string }[];
};

export const FAQ_NODES: Record<string, FaqNode> = {
  root: {
    id: "root",
    question: "Sur quoi as-tu besoin d'aide ?",
    choices: [
      { label: "✨ Je veux créer un quizz", nextId: "create" },
      { label: "🎩 Je vais animer un quizz live", nextId: "live" },
      { label: "👥 Je participe à un quizz", nextId: "play" },
      { label: "💳 Question paiement / abonnement", nextId: "payment" },
      { label: "🐛 J'ai un bug ou un problème technique", nextId: "bug" },
    ],
  },

  // ============================================
  // CRÉATION
  // ============================================
  create: {
    id: "create",
    question: "Tu débutes ou tu en es où ?",
    choices: [
      { label: "Je n'ai jamais créé de quizz", nextId: "create_new" },
      { label: "J'ai déjà un compte et veux un coup de pouce", nextId: "create_help" },
      { label: "Je veux partir d'un modèle", nextId: "create_template" },
    ],
  },
  create_new: {
    id: "create_new",
    question: "Commencer avec un nouveau compte",
    answer:
      "Crée ton compte (gratuit, 30s), clique sur « + Nouveau quizz » dans ton tableau de bord, donne un titre, choisis le mode (live ou créneau horaire), ajoute tes questions, et c'est parti ! Le lien et le QR code sont prêts immédiatement.",
    links: [
      { label: "Créer mon compte", href: "/signup" },
      { label: "Découvrir les templates", href: "/dashboard/quizzes/templates" },
    ],
  },
  create_help: {
    id: "create_help",
    question: "Tu veux des conseils",
    answer:
      "Tu peux ajouter une photo de couverture (très conseillé pour l'ambiance), choisir une couleur, ajouter des lots à associer aux rangs du classement, et générer une affiche A4 imprimable pour ton événement.",
    links: [
      { label: "Mon tableau de bord", href: "/dashboard" },
    ],
  },
  create_template: {
    id: "create_template",
    question: "Partir d'un template",
    answer:
      "On a 6 templates prêts à l'emploi : Mariage, EVJF/EVG, Anniversaire, Blind-test, Baby-shower, Team-building. Choisis-en un et tout sera pré-rempli avec des exemples de questions à personnaliser.",
    links: [
      { label: "Voir tous les templates", href: "/dashboard/quizzes/templates" },
    ],
  },

  // ============================================
  // LIVE
  // ============================================
  live: {
    id: "live",
    question: "Tu veux savoir quoi sur le mode live ?",
    choices: [
      { label: "Comment ça marche concrètement ?", nextId: "live_how" },
      { label: "Et l'affichage TV pour mon bar ?", nextId: "live_tv" },
      { label: "Pause, suivante, terminer : à quoi ça sert ?", nextId: "live_buttons" },
    ],
  },
  live_how: {
    id: "live_how",
    question: "Comment marche le pilotage live",
    answer:
      "1) Tu choisis le mode « Pilotage live » sur ton quizz · 2) Tes invités scannent le QR code et entrent leur pseudo · 3) Tu ouvres le panel live depuis ton dashboard · 4) Tu cliques « Démarrer » → tout le monde voit la 1ère question en simultané · 5) « Question suivante » pour avancer · 6) « Terminer » à la fin → les scores sont calculés et le classement s'affiche.",
    links: [{ label: "Voir mes quizz", href: "/dashboard/quizzes" }],
  },
  live_tv: {
    id: "live_tv",
    question: "Affichage TV",
    answer:
      "Chaque quizz a une URL `/q/CODE/display` qui est optimisée pour les écrans TV (grandes polices, QR code permanent dans le coin, scores en gros). Branche un Chromecast, une Apple TV ou utilise le navigateur de ta TV pour l'afficher. Les participants scannent depuis leur table.",
  },
  live_buttons: {
    id: "live_buttons",
    question: "Boutons du panel live",
    answer:
      "**▶ Démarrer** : passe le quizz en mode actif, tous les joueurs voient la question 1. **⏸ Pause** : fige le quizz, les joueurs voient un écran d'attente — utile pour faire une annonce ou laisser le temps de réfléchir. **➡ Question suivante** : passe à la suivante. **🏁 Terminer** : clôt le quizz, déclenche le calcul des scores et l'envoi du classement.",
  },

  // ============================================
  // JOUEUR
  // ============================================
  play: {
    id: "play",
    question: "Tu participes à un quizz",
    choices: [
      { label: "J'ai un code QR / un lien", nextId: "play_link" },
      { label: "Mon téléphone a planté, comment reprendre ?", nextId: "play_resume" },
      { label: "Mon pseudo est refusé", nextId: "play_pseudo" },
    ],
  },
  play_link: {
    id: "play_link",
    question: "Comment jouer",
    answer:
      "Scanne le QR code ou clique sur le lien. Tape ton pseudo (visible sur le classement final). Selon le mode, tu joues à ton rythme ou tu attends que l'animateur lance les questions. À la fin tu vois ton score et le classement.",
  },
  play_resume: {
    id: "play_resume",
    question: "Reprendre une partie",
    answer:
      "Si tu reviens sur le même lien dans le même navigateur, on te reconnaît automatiquement (cookie de 30 jours) et tu reprends là où tu étais. Si tu as changé d'appareil ou vidé tes cookies, il faut malheureusement recommencer.",
  },
  play_pseudo: {
    id: "play_pseudo",
    question: "Pseudo refusé",
    answer:
      "Les pseudos sont uniques par quizz : si quelqu'un d'autre a déjà pris le tien, il faut en choisir un autre. Ajoute des chiffres, ton prénom, ce que tu veux.",
  },

  // ============================================
  // PAIEMENT
  // ============================================
  payment: {
    id: "payment",
    question: "Quel sujet ?",
    choices: [
      { label: "Quels sont vos tarifs ?", nextId: "payment_pricing" },
      { label: "Comment résilier mon abonnement ?", nextId: "payment_cancel" },
      { label: "J'ai un code promo", nextId: "payment_promo" },
    ],
  },
  payment_pricing: {
    id: "payment_pricing",
    question: "Tarifs",
    answer:
      "Pour les particuliers : Découverte gratuit (5 questions, 15 joueurs), Essentiel 5 €, Festif 10 €, Magique 15 €. Pour les pros : Bar Essentiel 25 €/mois ou 250 €/an, Bar Pro 50 €/mois ou 500 €/an. Tous les détails sont sur la home.",
    links: [{ label: "Voir tous les tarifs", href: "/#tarifs" }],
  },
  payment_cancel: {
    id: "payment_cancel",
    question: "Résilier un abonnement",
    answer:
      "Sans engagement : tu peux résilier à tout moment depuis ton espace, ton abonnement restera actif jusqu'à la fin de la période payée puis sera arrêté (pas de reconduction tacite).",
  },
  payment_promo: {
    id: "payment_promo",
    question: "Code promo",
    answer:
      "Tu peux saisir ton code au moment du paiement Stripe Checkout (champ « Code promotionnel »). Réduction appliquée immédiatement avant validation.",
  },

  // ============================================
  // BUG
  // ============================================
  bug: {
    id: "bug",
    question: "Quel est le problème ?",
    choices: [
      { label: "Le live ne s'actualise pas en temps réel", nextId: "bug_sse" },
      { label: "Une photo ne se téléverse pas", nextId: "bug_upload" },
      { label: "Autre / signaler un bug", nextId: "bug_other" },
    ],
  },
  bug_sse: {
    id: "bug_sse",
    question: "Live qui ne s'actualise pas",
    answer:
      "Le live a un fallback automatique qui rafraîchit toutes les 3 s en cas de problème de connexion. Si ça reste bloqué : rafraîchis la page une fois, ça reprend. Vérifie aussi que ton réseau (entreprise, hotspot) n'a pas un filtrage strict des flux temps réel.",
  },
  bug_upload: {
    id: "bug_upload",
    question: "Upload qui plante",
    answer:
      "Vérifie que la photo fait moins de 8 Mo et qu'elle est en JPG, PNG, WebP ou GIF. Si tu uploades depuis ton tel, l'image originale peut faire 10-15 Mo — passe-la d'abord dans une app de compression.",
  },
  bug_other: {
    id: "bug_other",
    question: "Signaler un bug",
    answer:
      "Va sur la page Suggestion, choisis catégorie « Bug », décris le plus précisément possible (qu'est-ce que tu faisais, qu'est-ce que tu voyais, sur quel quizz). On lit tout.",
    links: [{ label: "Page Suggestion", href: "/suggestion" }],
  },
};
