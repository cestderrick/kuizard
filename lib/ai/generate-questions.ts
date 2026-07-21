// =============================================
// V53 — Générateur de questions par IA (Groq Llama 3.3 70B, gratuit)
// =============================================
// Prompte un LLM avec un thème + critères, parse la réponse JSON,
// retourne un tableau de questions prêtes à insérer en BDD.
//
// CONFIG : GROQ_API_KEY dans .env (gratuit sur console.groq.com).
// Si la clé n'est pas définie, retourne une erreur claire.

export type AIQuestion = {
  text: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  options: { label: string; isCorrect: boolean }[];
  points: number;
  // V54 — explication facultative generee par l'IA
  explanation?: string | null;
};

export type AIGenerateResult =
  | { ok: true; questions: AIQuestion[] }
  | { ok: false; error: string };

export type AIGenerateParams = {
  theme: string;
  count: number; // 5 à 30
  // V62 — 5 niveaux au lieu de 3, avec 2 crans hardcore pour vrais fans
  difficulty: "facile" | "moyen" | "difficile" | "expert" | "hardcore";
  language?: string; // default "fr"
};

// V53.1 : Groq plutot que OpenAI (free tier 30 req/min, sans CB).
// API compatible OpenAI : meme format de payload, juste URL et model differents.
// Pour switcher vers OpenAI plus tard : decoche OPENAI_API_KEY + OPENAI_URL ci-dessous.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function generateQuizQuestions(
  params: AIGenerateParams
): Promise<AIGenerateResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Cle Groq manquante. Ajoute GROQ_API_KEY dans le .env (gratuit sur console.groq.com).",
    };
  }

  const wanted = Math.max(3, Math.min(30, Math.floor(params.count)));

  // V62.1 — Boucle de retry : Groq/Llama a tendance a produire moins de
  // questions que demande (souvent 20-27 au lieu de 30). On boucle jusqu'a 3
  // tentatives pour completer, en donnant a chaque fois les textes deja
  // generes pour eviter les doublons.
  const collected: AIQuestion[] = [];
  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const missing = wanted - collected.length;
    if (missing <= 0) break;
    const batchResult = await fetchGroqBatch({
      apiKey,
      params,
      count: missing,
      avoidTexts: collected.map((q) => q.text),
    });
    if (!batchResult.ok) {
      // Si on a deja quelques questions, on renvoie ce qu'on a plutot que
      // de tout perdre. Sinon on renvoie l'erreur.
      if (collected.length > 0) break;
      return batchResult;
    }
    for (const q of batchResult.questions) {
      // Evite les doublons (comparaison sur texte normalise)
      const norm = q.text.toLowerCase().trim();
      const dup = collected.some(
        (c) => c.text.toLowerCase().trim() === norm
      );
      if (!dup) collected.push(q);
      if (collected.length >= wanted) break;
    }
    // Si l'IA n'a rien renvoye ce tour-ci, on arrete d'insister
    if (batchResult.questions.length === 0) break;
  }

  if (collected.length === 0) {
    return { ok: false, error: "Aucune question generee." };
  }
  return { ok: true, questions: collected.slice(0, wanted) };
}

// V62.1 — Fait un unique appel a Groq pour generer `count` questions.
// Isolable pour permettre le retry.
async function fetchGroqBatch(args: {
  apiKey: string;
  params: AIGenerateParams;
  count: number;
  avoidTexts: string[];
}): Promise<AIGenerateResult> {
  const { apiKey, params, count } = args;
  const lang = params.language ?? "fr";

  // V62 — Instructions differenciees et bien plus strictes par niveau.
  // "difficile" etait beaucoup trop soft (les fans se plaignaient de questions
  // triviales style "quel est le nom du personnage principal"). On a maintenant
  // 5 crans avec 2 vrais niveaux hardcore.
  const difficultyBrief: Record<string, string> = {
    facile:
      "NIVEAU FACILE — Grand public, personne qui ne connait pas le sujet doit pouvoir en avoir 60-70% bon. Bases evidentes, faits archi-connus. Points = 1.",
    moyen:
      "NIVEAU MOYEN — Culture generale sur le sujet requise. Un connaisseur moyen a environ 60% bon. Faits classiques mais qui demandent de connaitre un peu. Points = 2.",
    difficile:
      "NIVEAU DIFFICILE — Il faut vraiment aimer le sujet et l'avoir pratique/regarde plusieurs fois. Details specifiques, citations, dates. Un fan casual a 40-50%. Interdit les questions basiques style 'quel est le nom du personnage principal' ou 'quelle equipe a gagne'. Points = 3.",
    expert:
      "NIVEAU EXPERT — Reserve aux passionnes qui connaissent le sujet a fond. Details tres precis : dialogues secondaires, personnages recurrents mineurs, references croisees, statistiques exactes, dates precises au mois pres, noms d'auteurs/realisateurs. Un vrai fan a 60-70%, un fan casual a 20-30%. INTERDIT toute question qu'un non-fan pourrait trouver par logique. Points = 5.",
    hardcore:
      "NIVEAU HARDCORE — Pour super-fans absolus. Uniquement des details ultra-obscurs : easter eggs, erreurs de montage cultes, references de repliques a des episodes/matchs precis, records battus, citations exactes mot pour mot, prenoms de figurants, dates a l'annee exacte pour des evenements mineurs. Meme un vrai fan doit hesiter. INTERDIT toute question wikipedia niveau 1. Interdit 'quel est le nom du personnage' meme secondaire connu. Points = 8.",
  };
  const difficultyInstruction =
    difficultyBrief[params.difficulty] ?? difficultyBrief.moyen;

  const pointsByDifficulty: Record<string, number> = {
    facile: 1,
    moyen: 2,
    difficile: 3,
    expert: 5,
    hardcore: 8,
  };
  const defaultPoints = pointsByDifficulty[params.difficulty] ?? 2;

  // V62.1 — Injecter les textes deja generes pour eviter les doublons au retry
  const avoidBlock =
    args.avoidTexts.length > 0
      ? `\n\nATTENTION : ces questions ont deja ete generees, ne les repete PAS :\n${args.avoidTexts.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n`
      : "";

  const prompt = `Tu es un expert createur de quizz interactifs. Genere exactement ${count} questions de quizz sur le theme : « ${params.theme} ».${avoidBlock}
${difficultyInstruction}

Langue : ${lang === "fr" ? "francais" : lang}
Format : QCM avec 4 reponses dont 1 SEULE bonne
Longueur : questions <= 200 caracteres, reponses <= 100 caracteres chacune

REGLES STRICTES :
- Genere EXACTEMENT ${count} questions, ni plus ni moins.
- CHAQUE question DOIT correspondre au niveau demande ci-dessus, sans exception.
- Interdit les questions "quel est le nom du personnage principal" si niveau > moyen.
- Interdit les questions dont la reponse est evidente pour quelqu'un qui n'a jamais suivi le sujet, si niveau >= difficile.
- Pour "expert" et "hardcore" : privilegie les details obscurs, dates precises, chiffres exacts, citations mot pour mot, personnages/moments secondaires.
- Les 3 mauvaises reponses doivent etre PLAUSIBLES (pas de reponses absurdes).
- Points par question : ${defaultPoints}.

EXPLICATION : pour chaque question, fournis une explication de 1 a 3 phrases (max 400 caracteres) qui justifie la bonne reponse avec une anecdote, un chiffre cle ou une reference precise (episode, saison, date, match, page...). Ton pedagogique.

Reponds STRICTEMENT en JSON valide :
{
  "questions": [
    {
      "text": "La question ?",
      "type": "SINGLE_CHOICE",
      "options": [
        { "label": "Reponse A", "isCorrect": false },
        { "label": "Reponse B (la bonne)", "isCorrect": true },
        { "label": "Reponse C", "isCorrect": false },
        { "label": "Reponse D", "isCorrect": false }
      ],
      "points": ${defaultPoints},
      "explanation": "Justification concrete de la bonne reponse avec detail precis."
    }
  ]
}

Aucun commentaire, aucun markdown, JSON pur uniquement.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Tu reponds uniquement en JSON valide, aucun texte additionnel.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature:
          params.difficulty === "expert" || params.difficulty === "hardcore"
            ? 0.5
            : 0.75,
        // V62.1 — Groq/Llama tronque parfois faute de tokens si count eleve.
        // 8000 tokens permettent facilement 30 questions completes + explications.
        max_tokens: 8000,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Groq API ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return { ok: false, error: "Réponse vide de l'IA." };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.questions)) {
      return { ok: false, error: "Format de réponse IA invalide." };
    }

    // Sanitize + valide chaque question
    const questions: AIQuestion[] = [];
    for (const q of parsed.questions) {
      if (
        typeof q?.text !== "string" ||
        !Array.isArray(q?.options) ||
        q.options.length < 2
      ) {
        continue;
      }
      const opts = q.options
        .filter(
          (o: unknown): o is { label: string; isCorrect: boolean } =>
            typeof o === "object" &&
            o !== null &&
            typeof (o as { label?: unknown }).label === "string" &&
            typeof (o as { isCorrect?: unknown }).isCorrect === "boolean"
        )
        .slice(0, 6)
        .map((o: { label: string; isCorrect: boolean }) => ({
          label: o.label.slice(0, 200),
          isCorrect: o.isCorrect,
        }));
      if (
        opts.length < 2 ||
        !opts.some((o: { label: string; isCorrect: boolean }) => o.isCorrect)
      )
        continue;
      // V54 — explication facultative renvoyee par l'IA
      const explanation =
        typeof q.explanation === "string" && q.explanation.trim().length > 0
          ? q.explanation.trim().slice(0, 500)
          : null;
      questions.push({
        text: q.text.slice(0, 200),
        type:
          q.type === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE",
        options: opts,
        points: Math.max(1, Math.min(10, Math.floor(q.points ?? 1))),
        explanation,
      });
    }

    if (questions.length === 0) {
      return { ok: false, error: "Aucune question valide générée." };
    }

    return { ok: true, questions };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
