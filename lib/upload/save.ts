// =============================================
// Stockage des images uploadées (R2 si configuré, sinon local)
// =============================================
// Backend automatiquement choisi :
//   1. Cloudflare R2 si les variables d'env R2_* sont définies
//   2. Local public/uploads/ sinon (dev ou prod sans R2)

import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

import {
  r2IsConfigured,
  putToR2,
  deleteFromR2,
  r2KeyFromUrl,
} from "@/lib/upload/r2";

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

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Sauvegarde un File et retourne son URL publique.
 * Auto-route entre R2 et local selon la configuration.
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

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // ---- BRANCHE R2 ----
  if (r2IsConfigured()) {
    const key = `${safeSubdir}/${filename}`;
    try {
      const { url } = await putToR2({
        key,
        body: buffer,
        contentType: file.type,
      });
      return { ok: true, url, path: key };
    } catch (err) {
      console.error("[upload] R2 put failed:", err);
      return { ok: false, message: "Échec de l'upload sur R2." };
    }
  }

  // ---- BRANCHE LOCALE (fallback) ----
  const baseDir = path.join(process.cwd(), "public", "uploads", safeSubdir);
  await mkdir(baseDir, { recursive: true });
  const filePath = path.join(baseDir, filename);
  await writeFile(filePath, buffer);
  const url = `/uploads/${safeSubdir}/${filename}`;
  return { ok: true, url, path: filePath };
}

/**
 * Supprime un fichier image. Détecte automatiquement R2 vs local depuis l'URL.
 */
export async function deleteImageByUrl(url: string | null | undefined) {
  if (!url) return;

  // R2 : URL préfixée par R2_PUBLIC_URL
  if (r2IsConfigured()) {
    const key = r2KeyFromUrl(url);
    if (key) {
      await deleteFromR2(key);
      return;
    }
  }

  // Local : URL préfixée par /uploads/
  if (url.startsWith("/uploads/")) {
    const safe = url.replace(/\.\.+/g, "");
    const absolute = path.join(process.cwd(), "public", safe);
    try {
      await unlink(absolute);
    } catch {
      // ignore : fichier déjà absent
    }
  }
}
