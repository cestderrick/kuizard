// =============================================
// Stockage local des images uploadées
// =============================================
// Pour V1 on stocke sur disque dans public/uploads/. Les fichiers sont alors
// servis automatiquement par Next à l'URL /uploads/...
// Quand on scalera, on migrera vers Cloudflare R2 ou S3.

import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

/**
 * Sauvegarde un File dans public/uploads/<subdir>/ et retourne son URL publique.
 * Le nom de fichier est randomisé pour éviter les collisions et le path traversal.
 */
export async function saveImageFile(
  file: File,
  subdir: string
): Promise<UploadResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      message: `Format non supporté. JPG, PNG, WebP ou GIF uniquement.`,
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      message: `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(
        1
      )} Mo). Maximum 8 Mo.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, message: "Fichier vide." };
  }

  // Sanitize le subdir (anti path-traversal)
  const safeSubdir = subdir.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeSubdir) return { ok: false, message: "Sous-dossier invalide." };

  // Extension à partir du type MIME
  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;

  const baseDir = path.join(process.cwd(), "public", "uploads", safeSubdir);
  await mkdir(baseDir, { recursive: true });

  const filePath = path.join(baseDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // URL publique servie par Next
  const url = `/uploads/${safeSubdir}/${filename}`;
  return { ok: true, url, path: filePath };
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Supprime un fichier image dans public/uploads/ (si l'URL pointe bien chez nous).
 * Best-effort : on n'échoue pas si le fichier n'existe plus.
 */
export async function deleteImageByUrl(url: string | null | undefined) {
  if (!url) return;
  if (!url.startsWith("/uploads/")) return;
  const safe = url.replace(/\.\.+/g, "");
  const absolute = path.join(process.cwd(), "public", safe);
  try {
    await unlink(absolute);
  } catch {
    // ignore : fichier déjà absent
  }
}
