// =============================================
// Client Resend — emails transactionnels
// =============================================
//
// Si RESEND_API_KEY est vide (dev sans compte), on log dans la console au
// lieu d'envoyer — on évite ainsi d'avoir à se créer un compte juste pour
// pouvoir tester le flow d'inscription en local.
//
// Pour activer en prod :
// 1. Créer un compte sur resend.com
// 2. Vérifier le domaine kuizard.fr (DNS records SPF/DKIM)
// 3. Coller RESEND_API_KEY dans le .env
// 4. Vérifier que RESEND_FROM_EMAIL est noreply@kuizard.fr (déjà set)

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@kuizard.fr";

const resendClient = apiKey ? new Resend(apiKey) : null;

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<{
  ok: boolean;
  id?: string;
  message?: string;
}> {
  // Mode DEV sans clé : on log et on simule un succès
  if (!resendClient) {
    console.log(
      `[email] ⚠ RESEND_API_KEY manquante — email NON envoyé.\n` +
        `  to: ${payload.to}\n` +
        `  subject: ${payload.subject}\n` +
        `  (preview HTML below)\n` +
        `${payload.html.slice(0, 300)}…`
    );
    return { ok: true, message: "Logged in console (no API key)." };
  }

  try {
    const result = await resendClient.emails.send({
      from: `Kuizard <${FROM}>`,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      console.error("[email] resend error:", result.error);
      return { ok: false, message: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] exception:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
