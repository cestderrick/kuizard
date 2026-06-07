// =============================================
// Templates d'emails supplémentaires (V5+)
// =============================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.fr";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Email d'avertissement avant suppression auto d'un compte inactif.
 * Envoyé 30 jours avant la suppression effective.
 */
export function inactivityWarningEmail({
  name,
  daysRemaining,
}: {
  name: string | null;
  daysRemaining: number;
}): { subject: string; html: string; text: string } {
  const who = name ?? "magicien(ne)";
  const subject = `[Kuizard] Ton compte sera supprimé dans ${daysRemaining} jours`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#F5F0FF;font-family:-apple-system,sans-serif;">
  <table style="max-width:560px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;">
    <tr><td style="padding:24px 32px;background:#3D1786;color:#fff;">
      <div style="font-family:Georgia,serif;font-size:24px;letter-spacing:2px;font-weight:bold;">🎩 KUIZARD</div>
    </td></tr>
    <tr><td style="padding:32px;color:#1F1731;line-height:1.6;">
      <h1 style="font-family:Georgia,serif;color:#3D1786;margin:0 0 16px;font-size:22px;">Ton compte va être supprimé</h1>
      <p>Salut ${escape(who)},</p>
      <p>On n'a pas eu de tes nouvelles depuis longtemps ! Pour respecter
      ta vie privée (RGPD), <strong>ton compte sera automatiquement
      supprimé dans ${daysRemaining} jours</strong> si tu ne te reconnectes
      pas.</p>
      <p>Si tu veux le garder, il te suffit de te connecter une fois sur
      kuizard.fr — ça reset le compteur d'inactivité.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}/login" style="display:inline-block;background:#F59E0B;color:#3D1786;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:10px;">
          Me reconnecter ✨
        </a>
      </p>
      <p style="color:#6B5B8A;font-size:13px;">
        Si tu ne souhaites pas garder ton compte, tu n'as rien à faire —
        on s'occupera de la suppression automatiquement.
      </p>
    </td></tr>
    <tr><td style="padding:20px 32px;background:#FAF7FF;font-size:12px;color:#6B5B8A;text-align:center;">
      <a href="${APP_URL}/cgu" style="color:#6B5B8A;">CGU</a> ·
      <a href="${APP_URL}/confidentialite" style="color:#6B5B8A;">Confidentialité</a>
    </td></tr>
  </table>
</body></html>`;
  const text = `Ton compte Kuizard sera supprimé dans ${daysRemaining} jours faute d'activité. Reconnecte-toi pour le garder : ${APP_URL}/login`;
  return { subject, html, text };
}
