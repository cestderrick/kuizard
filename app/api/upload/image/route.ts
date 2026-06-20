// =============================================
// V43.2 — Route Handler upload image (quiz cover ou question image)
// =============================================
// Pourquoi un Route Handler au lieu d\'une Server Action :
//   - Les Server Actions Next.js ont un protocole strict. Si nginx ou
//     Cloudflare rejette la requête (413 Request Entity Too Large,
//     timeout…) avant qu\'elle n\'atteigne Next, le client reçoit du
//     HTML d\'erreur au lieu du payload Server Action et lève
//     "An unexpected response was received from the server".
//   - Un Route Handler retourne du JSON clair, debuggable, et donne un
//     control total sur les codes HTTP.
//
// Côté nginx, ne pas oublier `client_max_body_size 15M;` dans le server
// block pour ne pas couper les uploads > 1Mo (défaut nginx).
//
// Body : multipart/form-data avec
//   - file: l\'image
//   - quizId: string (toujours requis)
//   - questionId: string (optionnel → si présent = image de question, sinon
//                          = cover du quiz)
// Réponse : { ok: boolean, url?: string, message?: string }

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { saveImageFile, deleteImageByUrl } from "@/lib/upload/save";
import { r2IsConfigured } from "@/lib/upload/r2";
import { getEffectivePlan } from "@/lib/plans/gating";

export const runtime = "nodejs";
// On désactive le cache Next sur ce endpoint
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, message: "Non authentifié." },
        { status: 401 }
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch (err) {
      console.error("[upload route] formData parse failed:", err);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Impossible de lire le fichier. Vérifie qu\'il fait moins de 8 Mo.",
        },
        { status: 400 }
      );
    }

    const quizId = form.get("quizId");
    const questionId = form.get("questionId");
    const file = form.get("file");

    if (typeof quizId !== "string" || !quizId) {
      return NextResponse.json(
        { ok: false, message: "quizId manquant." },
        { status: 400 }
      );
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, message: "Aucun fichier valide reçu." },
        { status: 400 }
      );
    }

    // Mode 1 : image de question
    if (typeof questionId === "string" && questionId) {
      const question = await prisma.question.findFirst({
        where: { id: questionId, quizId, quiz: { userId: session.user.id } },
        select: { id: true, imageUrl: true },
      });
      if (!question) {
        return NextResponse.json(
          { ok: false, message: "Question introuvable." },
          { status: 404 }
        );
      }

      const plan = await getEffectivePlan(quizId);
      if (plan.limits.questionImages === false) {
        return NextResponse.json(
          {
            ok: false,
            message: `Les photos sur les questions ne sont pas incluses dans ton plan "${plan.name}".`,
          },
          { status: 403 }
        );
      }

      const result = await saveImageFile(file, `quizzes-${quizId}`);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, message: result.message },
          { status: 400 }
        );
      }
      console.log(
        "[upload route] question image stored — backend:",
        r2IsConfigured() ? "R2" : "LOCAL",
        "url:",
        result.url,
        "questionId:",
        questionId
      );

      const oldUrl = question.imageUrl;
      await prisma.question.update({
        where: { id: questionId },
        data: { imageUrl: result.url },
      });
      if (oldUrl && oldUrl !== result.url) {
        await deleteImageByUrl(oldUrl).catch((e) =>
          console.warn("[upload route] old delete failed:", e)
        );
      }

      // V43.3 : invalide les caches Next sur les pages qui affichent l'image
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
      revalidatePath(`/dashboard/quizzes/${quizId}/questions/${questionId}/edit`);

      return NextResponse.json({
        ok: true,
        url: result.url,
        message: "Image enregistrée.",
      });
    }

    // Mode 2 : cover du quiz
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
      select: { id: true, coverImageUrl: true },
    });
    if (!quiz) {
      return NextResponse.json(
        { ok: false, message: "Quizz introuvable." },
        { status: 404 }
      );
    }

    const plan = await getEffectivePlan(quizId);
    if (plan.limits.coverImage === false) {
      return NextResponse.json(
        {
          ok: false,
          message: `La photo de couverture n\'est pas incluse dans ton plan "${plan.name}".`,
        },
        { status: 403 }
      );
    }

    const result = await saveImageFile(file, `quizzes-${quizId}`);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 400 }
      );
    }
    console.log(
      "[upload route] cover image stored — backend:",
      r2IsConfigured() ? "R2" : "LOCAL",
      "url:",
      result.url,
      "quizId:",
      quizId
    );

    const oldUrl = quiz.coverImageUrl;
    await prisma.quiz.update({
      where: { id: quizId },
      data: { coverImageUrl: result.url },
    });
    if (oldUrl && oldUrl !== result.url) {
      await deleteImageByUrl(oldUrl).catch((e) =>
        console.warn("[upload route] old delete failed:", e)
      );
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
    revalidatePath(`/q/${quiz.id}`);

    return NextResponse.json({
      ok: true,
      url: result.url,
      message: "Photo de couverture enregistrée.",
    });
  } catch (err) {
    console.error("[upload route] unexpected error:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error
            ? `Erreur serveur : ${err.message}`
            : "Erreur serveur inconnue.",
      },
      { status: 500 }
    );
  }
}
