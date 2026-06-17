"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { parseCSV } from "@/lib/csv/parse";
import { generateUniqueQuizCode } from "@/lib/quiz/generate-code";

export type ImportState = {
  ok: boolean;
  message?: string;
  summary?: {
    quizzesCreated: number;
    questionsCreated: number;
    errors: string[];
  };
};

const REQUIRED_HEADERS = [
  "quiz_title",
  "question_order",
  "question_type",
  "question_text",
];

type Row = Record<string, string>;

function rowsToObjects(table: string[][]): { headers: string[]; rows: Row[] } {
  if (table.length === 0) return { headers: [], rows: [] };
  const headers = table[0].map((h) => h.trim());
  const rows = table.slice(1).map((cells) => {
    const obj: Row = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? "").trim();
    });
    return obj;
  });
  return { headers, rows };
}

function parseTags(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 32);
}

function buildOptions(
  row: Row,
  type: string
): { label: string; isCorrect: boolean }[] {
  const opts: { label: string; isCorrect: boolean }[] = [];
  for (let n = 1; n <= 8; n++) {
    const label = row[`option_${n}`];
    if (!label || label.length === 0) continue;
    const correct = row[`option_${n}_correct`];
    opts.push({
      label,
      isCorrect: correct === "1" || correct.toLowerCase() === "true",
    });
  }
  if (type === "TEXT") return [];
  return opts;
}

export async function importLibraryCsvAction(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const { user: admin } = await requireAdmin();

  const csvRaw = formData.get("csv");
  if (typeof csvRaw !== "string" || csvRaw.length === 0) {
    return { ok: false, message: "CSV vide." };
  }

  const table = parseCSV(csvRaw);
  const { headers, rows } = rowsToObjects(table);

  // Vérifie qu'on a les colonnes requises
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      return {
        ok: false,
        message: `Colonne requise manquante : "${required}". Voir le template.`,
      };
    }
  }

  // Regroupe les lignes par quiz_title (un quiz = N lignes consécutives)
  const errors: string[] = [];
  const grouped = new Map<
    string,
    {
      title: string;
      description: string;
      coverImageUrl: string | null;
      color: string;
      mode: "LIVE_MANUAL" | "SCHEDULED";
      language: string;
      libraryDescription: string;
      libraryTags: string[];
      questions: Row[];
    }
  >();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row.quiz_title;
    if (!title) {
      errors.push(`Ligne ${i + 2} : quiz_title vide, ignorée.`);
      continue;
    }
    if (!grouped.has(title)) {
      const mode = row.quiz_mode === "SCHEDULED" ? "SCHEDULED" : "LIVE_MANUAL";
      grouped.set(title, {
        title,
        description: row.quiz_description ?? "",
        coverImageUrl: row.quiz_cover_url || null,
        color: row.quiz_color || "#5b21b6",
        mode,
        language: row.quiz_language || "fr",
        libraryDescription: row.library_description ?? "",
        libraryTags: parseTags(row.library_tags ?? ""),
        questions: [],
      });
    }
    grouped.get(title)!.questions.push(row);
  }

  let quizzesCreated = 0;
  let questionsCreated = 0;

  for (const [, group] of grouped) {
    if (group.questions.length === 0) {
      errors.push(`Quiz "${group.title}" : aucune question, ignoré.`);
      continue;
    }

    try {
      const code = await generateUniqueQuizCode();
      await prisma.$transaction(async (tx) => {
        const created = await tx.quiz.create({
          data: {
            userId: admin.id, // l'admin est propriétaire
            code,
            title: group.title,
            description: group.description || null,
            coverImageUrl: group.coverImageUrl,
            theme: { primaryColor: group.color } as object,
            settings: {} as object,
            mode: group.mode,
            isLibrary: true,
            libraryDescription: group.libraryDescription || null,
            libraryTags: group.libraryTags,
            libraryLanguage: group.language,
            status: "PUBLISHED",
          },
        });

        // Crée les questions
        const validQuestions = group.questions
          .map((q, idx) => {
            const type = q.question_type;
            const allowedTypes = [
              "SINGLE_CHOICE",
              "MULTIPLE_CHOICE",
              "TRUE_FALSE",
              "TEXT",
            ];
            if (!allowedTypes.includes(type)) {
              errors.push(
                `Quiz "${group.title}" Q${idx + 1} : type invalide "${type}", ignorée.`
              );
              return null;
            }
            const text = q.question_text;
            if (!text || text.length < 3) {
              errors.push(
                `Quiz "${group.title}" Q${idx + 1} : texte vide ou trop court, ignorée.`
              );
              return null;
            }
            const order = parseInt(q.question_order) || idx + 1;
            const points = Math.min(
              10,
              Math.max(0, parseInt(q.question_points) || 1)
            );
            const timerSec = parseInt(q.question_timer_sec);
            const options = buildOptions(q, type);
            return {
              quizId: created.id,
              order,
              type: type as
                | "SINGLE_CHOICE"
                | "MULTIPLE_CHOICE"
                | "TRUE_FALSE"
                | "TEXT",
              text,
              imageUrl: q.question_image_url || null,
              options: options as unknown as object,
              points,
              timerSeconds:
                Number.isFinite(timerSec) && timerSec > 0 ? timerSec : null,
            };
          })
          .filter((q): q is NonNullable<typeof q> => q !== null);

        if (validQuestions.length > 0) {
          await tx.question.createMany({ data: validQuestions });
          questionsCreated += validQuestions.length;
        }
      });
      quizzesCreated++;
    } catch (err) {
      errors.push(
        `Quiz "${group.title}" : ${err instanceof Error ? err.message : "erreur"}`
      );
    }
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "library_toggle",
    payload: {
      action: "csv_import",
      quizzesCreated,
      questionsCreated,
      errorCount: errors.length,
    },
  });

  revalidatePath("/admin/library");
  revalidatePath("/dashboard/quizzes/library");

  return {
    ok: true,
    message: `Import terminé : ${quizzesCreated} quiz créés, ${questionsCreated} questions.`,
    summary: { quizzesCreated, questionsCreated, errors },
  };
}
