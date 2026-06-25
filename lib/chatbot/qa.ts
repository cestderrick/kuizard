// =============================================
// V49 — Base de Q/R du chatbot Kuizard
// =============================================
// Tous les couples Question / Réponse en français. Le matching côté client
// est un keyword scoring simple (voir help-bot.tsx).
// Pour étendre : ajoute une nouvelle entrée avec keywords (mots-clés
// importants à matcher, en minuscules sans accents).

export type ChatQA = {
  id: string;
  question: string;
  answer: string;
  keywords: string[]; // lowercase, sans accents
  category: "general" | "pricing" | "create" | "play" | "weekly" | "account";
};

export const QA: ChatQA[] = [
  // ===== GENERAL =====
  {
    id: "what-is-kuizard",
    question: "C'est quoi Kuizard ?",
    answer:
      "Kuizard est un outil pour créer des quizz personnalisés que tes invités jouent depuis leur téléphone en scannant un QR code. Idéal pour mariages, EVJF, anniversaires, soirées d'entreprise et soirées de bar.",
    keywords: ["kuizard", "cest quoi", "qu est ce", "presentation", "service"],
    category: "general",
  },
  {
    id: "demo",
    question: "Comment essayer Kuizard gratuitement ?",
    answer:
      "Tu peux tester sur /demo (quizz public ouvert) sans créer de compte. Ou crée ton propre quizz gratuit (10 questions, 100 participants) en t'inscrivant en 30 secondes.",
    keywords: ["essayer", "tester", "demo", "gratuit", "essai", "try"],
    category: "general",
  },

  // ===== PRICING =====
  {
    id: "price",
    question: "Combien ça coûte ?",
    answer:
      "Gratuit pour démarrer (10 questions, 100 joueurs). Achat à l'unité dès 3€ pour un quizz personnalisé avec photos et mode TV. Abonnements Bar/Entreprise pour usage récurrent. Voir tous les tarifs : /tarifs",
    keywords: ["prix", "tarif", "coute", "cher", "payer", "combien", "cost"],
    category: "pricing",
  },
  {
    id: "free-features",
    question: "Quelles fonctionnalités sont gratuites ?",
    answer:
      "Quizz simple jusqu'à 10 questions, 100 participants, mode QR code, classement de base. Limitations : pas de photos dans les questions, pas de mode TV, pas de couleurs perso. Pour ces fonctionnalités, prends un quizz à 3€ ou un abonnement.",
    keywords: ["gratuit", "free", "limite", "fonctionnalite"],
    category: "pricing",
  },
  {
    id: "refund",
    question: "Puis-je être remboursé ?",
    answer:
      "Conformément à nos CGV, le droit de rétractation s'applique sous 14 jours sauf si le service a été consommé. Pour toute demande, contacte-nous via /aide.",
    keywords: ["rembourser", "remboursement", "annuler", "refund"],
    category: "pricing",
  },

  // ===== CREATE =====
  {
    id: "create-quiz",
    question: "Comment créer un quizz ?",
    answer:
      "1) Inscris-toi (gratuit, 30s). 2) Dans le dashboard, clique sur « + Nouveau quizz ». 3) Ajoute tes questions (QCM, vrai/faux, réponse libre). 4) Choisis le mode (Live ou Créneau). 5) Lance, partage le QR code.",
    keywords: ["creer", "nouveau", "ajouter", "faire", "create", "comment"],
    category: "create",
  },
  {
    id: "add-photo",
    question: "Comment ajouter une photo à une question ?",
    answer:
      "Dans l'éditeur de question, clique sur « 📷 Ajouter une image ». Tu peux uploader un fichier (max 5 Mo) ou coller une URL directe. Disponible sur les offres payantes.",
    keywords: ["photo", "image", "picture", "ajouter image", "upload"],
    category: "create",
  },
  {
    id: "modes",
    question: "Quelle est la différence entre Live et Créneau ?",
    answer:
      "Mode Live : tu pilotes les questions une par une depuis ton téléphone, tous les joueurs voient la même au même moment (idéal soirée animée). Mode Créneau : les joueurs jouent à leur rythme entre deux dates (idéal cocktail, EVJF).",
    keywords: ["live", "creneau", "scheduled", "mode", "difference"],
    category: "create",
  },
  {
    id: "qr-code",
    question: "Comment partager le QR code ?",
    answer:
      "Une fois ton quizz prêt, va sur sa page de détails. Tu trouves le QR code à télécharger en PNG ou via une affiche A4 prête à imprimer. Tes invités scannent avec leur appareil photo, ça ouvre le quizz dans leur navigateur.",
    keywords: ["qr", "qr code", "partager", "share", "scanner"],
    category: "create",
  },

  // ===== PLAY =====
  {
    id: "play-app",
    question: "Faut-il une app pour jouer ?",
    answer:
      "Non. Aucune app à installer. Les joueurs scannent le QR code ou tapent le code à 6 caractères sur kuizard.com, ça ouvre le quizz dans leur navigateur. Compatible iOS et Android.",
    keywords: ["app", "application", "installer", "telecharger", "jouer"],
    category: "play",
  },
  {
    id: "play-count",
    question: "Combien de personnes peuvent jouer ?",
    answer:
      "Jusqu'à 100 joueurs en simultané sur l'offre gratuite, jusqu'à 500 sur les offres payantes, et illimité sur l'abonnement Bar/Entreprise.",
    keywords: ["combien", "joueurs", "participants", "personnes", "simultane"],
    category: "play",
  },
  {
    id: "play-wifi",
    question: "Faut-il du wifi pour jouer ?",
    answer:
      "Les joueurs ont besoin d'une connexion (wifi de la salle ou 4G/5G perso). Pas de wifi requis côté organisateur, seulement pour les invités.",
    keywords: ["wifi", "internet", "connexion", "reseau", "data"],
    category: "play",
  },

  // ===== WEEKLY =====
  {
    id: "weekly",
    question: "C'est quoi le quizz de la semaine ?",
    answer:
      "Chaque semaine on propose un quizz thématique gratuit ouvert à tous, avec des lots à gagner pour les meilleurs scores. Tu joues une seule fois par créneau. Le classement et les pseudos sont dévoilés à la clôture.",
    keywords: ["semaine", "weekly", "hebdo", "concours"],
    category: "weekly",
  },
  {
    id: "weekly-replay",
    question: "Puis-je rejouer le quizz de la semaine ?",
    answer:
      "Non, le quizz de la semaine est limité à un seul essai par créneau pour garantir un classement équitable. Pour les autres quizz de la quizzthèque, tu peux rejouer autant que tu veux.",
    keywords: ["rejouer", "retry", "weekly", "concours", "semaine"],
    category: "weekly",
  },

  // ===== ACCOUNT =====
  {
    id: "forgot-password",
    question: "J'ai oublié mon mot de passe",
    answer:
      "Va sur /login et clique sur « 🔑 Mot de passe oublié ? ». Saisis ton email, tu recevras un lien valide 1h pour le réinitialiser. Vérifie tes spams si tu ne le reçois pas.",
    keywords: ["oublie", "mot de passe", "password", "perdu", "reset"],
    category: "account",
  },
  {
    id: "delete-account",
    question: "Comment supprimer mon compte ?",
    answer:
      "Va dans /dashboard/profile puis section « Zone de danger » → bouton « Supprimer mon compte ». Action irréversible. Pour toute aide, contacte-nous via /aide.",
    keywords: ["supprimer", "delete", "compte", "account", "fermer"],
    category: "account",
  },
  {
    id: "invoice",
    question: "Où trouver mes factures ?",
    answer:
      "Dans /dashboard/payments tu trouves tous tes paiements avec le lien vers la facture Stripe. Tu reçois aussi automatiquement chaque facture par email après le paiement.",
    keywords: ["facture", "invoice", "recu", "comptabilite"],
    category: "account",
  },
];

/**
 * Match les Q/R selon un texte saisi. Retourne les 3 meilleures
 * (ou moins si peu de matches). Score = nombre de keywords présents.
 */
export function searchQA(rawQuery: string): ChatQA[] {
  const normalized = rawQuery
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .trim();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const scored = QA.map((qa) => {
    let score = 0;
    for (const kw of qa.keywords) {
      for (const tok of tokens) {
        if (kw.includes(tok) || tok.includes(kw)) score++;
      }
    }
    // bonus si le mot apparaît dans la question elle-même
    const qLower = qa.question.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    for (const tok of tokens) {
      if (qLower.includes(tok)) score += 0.5;
    }
    return { qa, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.qa);
}

export const POPULAR_QUESTIONS: string[] = [
  "what-is-kuizard",
  "price",
  "create-quiz",
  "play-app",
  "qr-code",
  "weekly",
  "forgot-password",
];
