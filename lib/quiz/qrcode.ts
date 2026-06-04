// =============================================
// Helper QR code SVG
// =============================================
// On utilise qrcode (npm) qui peut produire directement du SVG inline.
// Plus pratique qu'un PNG : scalable, léger, pas de canvas côté client.

import QRCode from "qrcode";

export async function generateQrSvg(
  text: string,
  options?: { color?: string; backgroundColor?: string; margin?: number }
): Promise<string> {
  const color = options?.color ?? "#1F1B3A"; // night
  const bg = options?.backgroundColor ?? "#FFFFFF";

  const svg = await QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: options?.margin ?? 2,
    color: {
      dark: color,
      light: bg,
    },
  });

  return svg;
}

/**
 * URL canonique d'un quizz côté joueur.
 * On utilise NEXT_PUBLIC_APP_URL pour générer le lien complet
 * (utile pour le QR code qui doit avoir l'URL absolue).
 */
export function buildQuizPlayUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/q/${code}`;
}
