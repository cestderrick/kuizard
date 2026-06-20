// =============================================
// V43.4 — Sert les fichiers uploadés depuis notre stockage local
// =============================================
// Pourquoi : Next.js sert `public/` mais en prod (PM2 + nginx) on a observé
// des 404 sur les fichiers écrits APRÈS le build. Plutôt que de chercher
// d'où ça vient (cwd PM2, location nginx, output standalone…), on contrôle
// nous-mêmes le serving via ce Route Handler.
//
// On stocke dans `<cwd>/storage/uploads/...` (HORS de public/) et on stream
// depuis cet emplacement. Les URLs côté DB restent /uploads/<subdir>/<file>
// donc rétrocompatible avec les anciennes images.

import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

import { getLocalUploadsRoot } from "@/lib/upload/save";
import { r2IsConfigured } from "@/lib/upload/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Si R2 est configuré, on ne devrait jamais arriver ici (les URLs sont
  // celles de R2). Mais si quelqu'un tape /uploads/... à la main, on 404.
  if (r2IsConfigured()) {
    return NextResponse.json({ error: "R2 mode" }, { status: 404 });
  }

  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Anti-path-traversal : on résout le chemin et on vérifie qu'il est bien
  // CONTENU dans le dossier de uploads. path.resolve gère ".." correctement.
  const uploadsRoot = path.resolve(getLocalUploadsRoot());
  const requested = path.resolve(uploadsRoot, ...segments);
  if (
    requested !== uploadsRoot &&
    !requested.startsWith(uploadsRoot + path.sep)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let fileStat;
  try {
    fileStat = await stat(requested);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!fileStat.isFile()) {
    return NextResponse.json({ error: "Not a file" }, { status: 404 });
  }

  // Content-Type basé sur l'extension
  const ext = path.extname(requested).slice(1).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

  // Stream le fichier (pas de buffer complet en RAM pour les grosses images)
  const nodeStream = createReadStream(requested);
  // Conversion Node stream → Web ReadableStream pour NextResponse
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(
          chunk instanceof Buffer ? new Uint8Array(chunk) : chunk
        );
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      // Cache fort côté navigateur + CDN (le filename est aléatoire, jamais
      // ré-utilisé pour une autre image → safe d'immutable-cache)
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
