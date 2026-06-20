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
  // V42 : iPhone shoot par défaut en HEIC. Si on bloque, l'utilisateur ne
  // comprend pas pourquoi son image ne marche pas. On accepte le MIME mais
  // les magic bytes restent vérifiés en complément (HEIC commence par
  // 'ftypheic' à l'offset 4).
  "image/heic",
  "image/heif",
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

/**
 * V38 — Vérification des "magic bytes" pour confirmer le vrai type du fichier.
 * Le `file.type` envoyé par le browser est SPOOFABLE — un attaquant peut
 * envoyer un .exe ou .svg avec contentType="image/png" et bypasser le check
 * basé uniquement sur la chaîne déclarée. On vérifie les premiers octets.
 */
function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) return "image/png";
  // JPEG : FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // GIF : 47 49 46 38 (3 ou 9 puis 'a')
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) return "image/gif";
  // WebP : RIFF....WEBP
  if (
    buf[0] === 0x52 && // R
    buf[1] === 0x49 && // I
    buf[2] === 0x46 && // F
    buf[3] === 0x46 && // F
    buf[8] === 0x57 && // W
    buf[9] === 0x45 && // E
    buf[10] === 0x42 && // B
    buf[11] === 0x50 // P
  ) return "image/webp";
  // V42 : HEIC/HEIF (iPhone). Conteneur ISOBMFF, magic à l'offset 4 = "ftyp",
  // puis le brand à l'offset 8 indique le type exact (heic, heix, mif1, etc.)
  if (
    buf[4] === 0x66 && // f
    buf[5] === 0x74 && // t
    buf[6] === 0x79 && // y
    buf[7] === 0x70 // p
  ) {
    const brand = buf.slice(8, 12).toString("ascii").toLowerCase();
    if (
      brand === "heic" ||
      brand === "heix" ||
      brand === "mif1" ||
      brand === "msf1" ||
      brand === "heim" ||
      brand === "heis"
    ) {
      return "image/heic";
    }
  }
  return null;
}

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
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
    console.warn("[upload] rejected MIME:", file.type, "size:", file.size);
    return {
      ok: false,
      message: `Format \"${file.type || "inconnu"}\" non supporté. Formats acceptés : JPG, PNG, WebP, GIF, HEIC (iPhone).`,
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

  const buffer = Buffer.from(await file.arrayBuffer());

  // V38 : magic bytes — refuse si le contenu réel n'est pas une image valide
  const realMime = detectImageMime(buffer);
  if (!realMime || !ALLOWED_MIME.has(realMime)) {
    console.warn(
      "[upload] magic bytes rejected. declared=" + file.type,
      "detected=" + (realMime ?? "unknown"),
      "first16=" + Array.from(buffer.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join(" ")
    );
    return {
      ok: false,
      message:
        "Le contenu du fichier ne correspond pas à une image standard. " +
        "Si tu as pris la photo avec un iPhone récent, change le format " +
        "dans Réglages > Appareil photo > Formats > Plus compatible.",
    };
  }
  // Si le navigateur a menti, on se cale sur le type réel.
  const ext = MIME_TO_EXT[realMime] ?? "jpg";
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;

  // ---- BRANCHE R2 ----
  if (r2IsConfigured()) {
    const key = `${safeSubdir}/${filename}`;
    try {
      const { url } = await putToR2({
        key,
        body: buffer,
        contentType: realMime,
      });
      return { ok: true, url, path: key };
    } catch (err) {
      console.error("[upload] R2 put failed:", err);
      return { ok: false, message: "Échec de l'upload sur R2." };
    }
  }

  // ---- BRANCHE LOCALE (fallback) ----
  // V43.4 : on stocke dans un dossier configurable HORS de `public/` pour
  // ne plus dépendre du serving Next.js de public/ (qui pose souvent
  // problème en prod avec PM2 + nginx). Les fichiers sont ensuite servis
  // par notre propre Route Handler `/uploads/[...path]/route.ts`.
  //
  // Par défaut : `<cwd>/storage/uploads`. Override possible via env
  // LOCAL_UPLOADS_DIR=/var/www/kuizard/storage/uploads (chemin absolu).
  const uploadsRoot =
    process.env.LOCAL_UPLOADS_DIR ||
    path.join(process.cwd(), "storage", "uploads");
  const baseDir = path.join(uploadsRoot, safeSubdir);
  await mkdir(baseDir, { recursive: true });
  const filePath = path.join(baseDir, filename);
  await writeFile(filePath, buffer);
  console.log("[upload] local file written:", filePath);
  const url = `/uploads/${safeSubdir}/${filename}`;
  return { ok: true, url, path: filePath };
}

/**
 * V43.4 — Helper exposé pour le Route Handler /uploads/[...path]
 * Retourne le chemin absolu où sont stockés les fichiers locaux.
 */
export function getLocalUploadsRoot(): string {
  return (
    process.env.LOCAL_UPLOADS_DIR ||
    path.join(process.cwd(), "storage", "uploads")
  );
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
    // V43.4 : on résout le path relatif vers le dossier de stockage actuel
    // (configurable via LOCAL_UPLOADS_DIR) + check anti-path-traversal.
    const uploadsRoot = path.resolve(getLocalUploadsRoot());
    const relative = url.slice("/uploads/".length); // ex: "quizzes-xxx/abc.jpg"
    const absolute = path.resolve(uploadsRoot, relative);
    if (
      absolute === uploadsRoot ||
      absolute.startsWith(uploadsRoot + path.sep)
    ) {
      try {
        await unlink(absolute);
      } catch {
        // ignore : fichier déjà absent
      }
    } else {
      console.warn("[upload] path traversal blocked:", url);
    }
  }
}
