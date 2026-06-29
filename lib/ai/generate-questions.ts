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
};

export type AIGenerateResult =
  | { ok: true; questions: AIQuestion[] }
  | { ok: false; error: string };

export type AIGenerateParams = {
  theme: string;
  count: number; // 5 à 30
  difficulty: "facile" | "moyen" | "difficile";
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

  const count = Math.max(3, Math.min(30, Math.floor(params.count)));
  const lang = params.language ?? "fr";

  const prompt = `Tu es un expert créateur de quizz interactifs. Génère exactement ${count} questions de quizz sur le thème : « ${params.theme} ».

Critères :
- Difficulté : ${params.difficulty}
- Langue : ${lang === "fr" ? "français" : lang}
- Type : QCM avec 4 réponses possibles dont 1 SEULE bonne réponse
- Questions courtes et claires (max 200 caractères)
- Réponses courtes (max 100 caractères chacune)
- Évite les réponses ambiguës ou les pièges injustes
- Points par question selon difficulté : facile=1, moyen=2, difficile=3

Réponds STRICTEMENT en JSON valide avec ce format :
{
  "questions": [
    {
      "text": "La question ?",
      "type": "SINGLE_CHOICE",
      "options": [
        { "label": "Réponse A", "isCorrect": false },
        { "label": "Réponse B (la bonne)", "isCorrect": true },
        { "label": "Réponse C", "isCorrect": false },
        { "label": "Réponse D", "isCorrect": false }
      ],
      "points": 2
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
              "Tu réponds uniquement en JSON valide, aucun texte additionnel.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
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
      if (opts.length < 2 || !opts.some((o) => o.isCorrect)) continue;
      questions.push({
        text: q.text.slice(0, 200),
        type:
          q.type === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE",
        options: opts,
        points: Math.max(1, Math.min(10, Math.floor(q.points ?? 1))),
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
