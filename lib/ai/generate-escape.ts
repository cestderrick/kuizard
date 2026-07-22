// =============================================
// V60.5c — Generateur d'escape par IA (Groq)
// =============================================
// Prompte un LLM pour generer un escape complet a partir d'un theme :
// titre + description + 5-10 etapes sequentielles progressives.

export type AIEscapeStep = {
  order: number;
  type: "TEXT" | "CHOICE";
  title: string;
  body: string;
  expectedAnswer: string | null;
  options: { label: string; isCorrect: boolean }[];
  hints: string[];
  points: number;
};

export type AIEscape = {
  title: string;
  description: string;
  steps: AIEscapeStep[];
};

export type AIGenerateEscapeResult =
  | { ok: true; escape: AIEscape }
  | { ok: false; error: string };

export type AIGenerateEscapeParams = {
  theme: string;
  stepCount: number; // 5 a 12
  difficulty: "facile" | "moyen" | "difficile" | "expert";
  language?: string;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function generateEscape(
  params: AIGenerateEscapeParams
): Promise<AIGenerateEscapeResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Cle Groq manquante (GROQ_API_KEY)." };
  }

  const stepCount = Math.max(3, Math.min(12, Math.floor(params.stepCount)));
  const lang = params.language ?? "fr";

  const difficultyBrief: Record<string, string> = {
    facile:
      "Enigmes simples et immediatement resolvables. Public familial. Reponses directes.",
    moyen:
      "Enigmes qui demandent un peu de reflexion. Certaines necessitent de croiser des indices.",
    difficile:
      "Enigmes exigeantes : jeux de mots, calculs, symboles, references cachees. Public d'adultes.",
    expert:
      "Enigmes tres difficiles : plusieurs couches, indices trompeurs, culture generale pointue.",
  };
  const difficultyLine =
    difficultyBrief[params.difficulty] ?? difficultyBrief.moyen;

  const prompt = `Tu es un game designer specialiste des escape games. Cree un scenario d'escape game digital complet sur le theme : « ${params.theme} ».

Format : ${stepCount} etapes SEQUENTIELLES qui racontent une histoire. Le joueur doit resoudre l'etape N pour deverrouiller l'etape N+1.

Niveau de difficulte : ${params.difficulty} — ${difficultyLine}

Langue : ${lang === "fr" ? "francais" : lang}

REGLES STRICTES :
- Chaque etape a un TYPE : "TEXT" (reponse libre) ou "CHOICE" (QCM 4 options).
- Varie les types : environ 60% TEXT et 40% CHOICE.
- Pour TEXT : "expectedAnswer" = la reponse attendue (mot ou courte phrase, insensible casse/accents).
- Pour CHOICE : "options" = tableau de 4 objets {label, isCorrect} dont EXACTEMENT 1 avec isCorrect=true.
- Chaque etape a un "title" court (max 60 chars) et un "body" enonce (100-500 chars).
- Chaque etape a 2 a 3 "hints" (indices) — du plus subtil au plus explicite.
- Points par etape selon difficulte : facile=5, moyen=10, difficile=15, expert=20.
- L'histoire doit avoir une progression logique : intro, developpement, climax, resolution.
- Le titre du scenario doit etre evocateur (max 80 chars).
- La description doit teaser sans spoiler (max 300 chars).

Reponds STRICTEMENT en JSON valide avec ce format :
{
  "title": "Titre du scenario",
  "description": "Pitch qui donne envie de jouer",
  "steps": [
    {
      "order": 1,
      "type": "TEXT",
      "title": "Titre de l'etape 1",
      "body": "Enonce de l'enigme...",
      "expectedAnswer": "reponse",
      "options": [],
      "hints": ["indice subtil", "indice moyen", "indice explicite"],
      "points": 10
    },
    {
      "order": 2,
      "type": "CHOICE",
      "title": "Titre de l'etape 2",
      "body": "Enonce...",
      "expectedAnswer": null,
      "options": [
        { "label": "A", "isCorrect": false },
        { "label": "B (la bonne)", "isCorrect": true },
        { "label": "C", "isCorrect": false },
        { "label": "D", "isCorrect": false }
      ],
      "hints": ["indice 1", "indice 2"],
      "points": 10
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
        temperature: 0.75,
        max_tokens: 8000,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Groq API ${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return { ok: false, error: "Reponse vide de l'IA." };

    const parsed = JSON.parse(raw);
    if (!parsed?.title || !Array.isArray(parsed.steps)) {
      return { ok: false, error: "Format IA invalide." };
    }

    // Sanitize steps
    const steps: AIEscapeStep[] = [];
    for (let i = 0; i < parsed.steps.length; i++) {
      const s = parsed.steps[i];
      if (typeof s?.body !== "string" || s.body.length < 5) continue;
      const type: "TEXT" | "CHOICE" = s.type === "CHOICE" ? "CHOICE" : "TEXT";
      const options =
        type === "CHOICE" && Array.isArray(s.options)
          ? s.options
              .filter(
                (o: unknown): o is { label: string; isCorrect: boolean } =>
                  typeof o === "object" &&
                  o !== null &&
                  typeof (o as { label?: unknown }).label === "string" &&
                  typeof (o as { isCorrect?: unknown }).isCorrect === "boolean"
              )
              .map((o: { label: string; isCorrect: boolean }) => ({
                label: o.label.slice(0, 200),
                isCorrect: o.isCorrect,
              }))
          : [];
      if (
        type === "CHOICE" &&
        (options.length < 2 ||
          !options.some((o: { label: string; isCorrect: boolean }) => o.isCorrect))
      ) {
        continue;
      }
      const expectedAnswer =
        type === "TEXT" && typeof s.expectedAnswer === "string"
          ? s.expectedAnswer.trim().slice(0, 500)
          : null;
      if (type === "TEXT" && !expectedAnswer) continue;

      const hints = Array.isArray(s.hints)
        ? s.hints
            .filter((h: unknown): h is string => typeof h === "string" && h.trim().length > 0)
            .slice(0, 5)
            .map((h: string) => h.trim().slice(0, 300))
        : [];

      steps.push({
        order: i + 1,
        type,
        title: typeof s.title === "string" ? s.title.slice(0, 200) : `Etape ${i + 1}`,
        body: s.body.slice(0, 2000),
        expectedAnswer,
        options,
        hints,
        points: Math.max(0, Math.min(100, Math.floor(s.points ?? 10))),
      });
    }
    if (steps.length === 0) {
      return { ok: false, error: "Aucune etape valide generee." };
    }

    return {
      ok: true,
      escape: {
        title: String(parsed.title).slice(0, 100),
        description: typeof parsed.description === "string" ? parsed.description.slice(0, 500) : "",
        steps,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
