// =============================================
// Backend de stockage Cloudflare R2 (S3-compatible)
// =============================================
//
// Activé uniquement si les 4 variables d'env sont définies :
//   - R2_ACCOUNT_ID
//   - R2_BUCKET
//   - R2_ACCESS_KEY_ID
//   - R2_SECRET_ACCESS_KEY
//   - R2_PUBLIC_URL (URL du domaine custom ou r2.dev qui sert le bucket)
//
// Sinon, le `save.ts` retombe automatiquement sur le stockage local.

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export function r2IsConfigured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL
  );
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

export async function putToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<{ url: string; key: string }> {
  const bucket = process.env.R2_BUCKET!;
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Cache 1 an, immutable (les noms sont random donc on peut)
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  // URL publique servie via le custom domain ou *.r2.dev configuré côté CF
  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return { url: `${publicUrl}/${key}`, key };
}

export async function deleteFromR2(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET!;
  try {
    await client().send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key })
    );
  } catch (err) {
    console.warn("[r2] delete failed:", err);
  }
}

/**
 * Extrait la clé R2 depuis une URL publique (si applicable).
 * Renvoie null si l'URL n'est pas dans notre bucket.
 */
export function r2KeyFromUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl) return null;
  if (!url.startsWith(publicUrl + "/")) return null;
  return url.slice(publicUrl.length + 1);
}
