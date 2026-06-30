"use server";

// =============================================
// V56 — Suggerer une description de quiz via IA (Groq)
// =============================================
// Genere une description marketing courte (1-2 phrases, 200 caracteres max)
// a partir du titre du quiz + de ses premieres questions. Reservee aux abos
// premium OU aux admins. Utilise la meme cle GROQ_API_KEY que la generation
// de questions (V53).

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getBillingContext } from "@/lib/billing/context";

export type SuggestDescriptionState =
  | { ok: true; description: string }
  | { ok: false; error: string };

const schema = z.object({
  quizId: z.string().min(1),
  // Permet a l'utilisateur de tester avec un titre temporaire (avant save)
  draftTitle: z.string().max(120).optional(),
});

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export async function suggestQuizDescriptionAction(
  _prev: SuggestDescriptionState,
  formData: FormData
): Promise<SuggestDescriptionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Non authentifie." };
  }

  // Gating : abo premium OU admin
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = me?.role === "ADMIN";
  if (!isAdmin) {
    const billing = await getBillingContext(session.user.id);
    if (!billing?.hasActiveSubscription) {
      return {
        ok: false,
        error:
          "✨ La suggestion de description IA est reservee aux abonnes Premium.",
      };
    }
  }

  const parsed = schema.safeParse({
    quizId: formData.get("quizId"),
    draftTitle: formData.get("draftTitle") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Donnees invalides." };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Cle Groq manquante (GROQ_API_KEY).",
    };
  }

  // Charge le quiz + 3 premieres questions pour donner du contexte au LLM
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: {
      id: true,
      userId: true,
      title: true,
      questions: {
        orderBy: { order: "asc" },
        take: 5,
        select: { text: true },
      },
    },
  });
  if (!quiz) return { ok: false, error: "Quiz introuvable." };
  if (!isAdmin && quiz.userId !== session.user.id) {
    return { ok: false, error: "Tu n'es pas proprietaire de ce quiz." };
  }

  const title = (parsed.data.draftTitle?.trim() || quiz.title || "").slice(0, 120);
  const questionList = quiz.questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  const prompt = `Tu es un copywriter expert en quizz interactifs. Genere UNE description courte (1 a 2 phrases, MAX 200 caracteres) pour ce quizz, destinee aux participants qui vont decider de le rejoindre.

Titre du quizz : « ${title} »

${
  questionList
    ? `Aperçu des premieres questions :\n${questionList}\n`
    : "Le quizz n'a pas encore de questions, base-toi uniquement sur le titre."
}

Contraintes :
- Ton : engageant, chaleureux, leger (eviter les tournures pompeuses)
- Pas de superlatifs creux ("genial", "incroyable")
- Public francais
- MAX 200 caracteres (compte-les)
- Pas de hashtags, pas d'emojis a l'exterieur (1 emoji ok max au debut)
- Ne reprends pas le titre dans la description

Reponds STRICTEMENT en JSON valide au format :
{ "description": "Ta description ici." }

Aucun commentaire, aucun markdown.`;

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
        temperature: 0.8,
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
    if (!raw) return { ok: false, error: "Reponse vide de l'IA." };

    const parsedJson = JSON.parse(raw);
    const desc =
      typeof parsedJson?.description === "string"
        ? parsedJson.description.trim()
        : null;
    if (!desc) {
      return { ok: false, error: "Format de reponse IA invalide." };
    }
    // Safety : tronque a 500 caracteres max (la limite du formulaire)
    return { ok: true, description: desc.slice(0, 500) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
