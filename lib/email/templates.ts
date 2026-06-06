// =============================================
// Templates HTML pour les emails transactionnels
// =============================================
//
// On garde le HTML inline (compatibilité max clients mail). Couleurs alignées
// sur la charte Kuizard (violet + or sur fond crème).

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.fr";

function shell({
  preheader,
  title,
  body,
  ctaLabel,
  ctaUrl,
  footer,
}: {
  preheader: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1F1731;">
  <span style="display:none !important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escape(preheader)}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0FF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 16px rgba(85,35,187,0.08);">
          <tr>
            <td style="padding:24px 32px;background:#3D1786;color:#fff;">
              <div style="font-family:Georgia,serif;font-size:24px;letter-spacing:2px;font-weight:bold;">
                🎩 KUIZARD
              </div>
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#F59E0B;margin-top:4px;">
                Quizz magiques
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:22px;color:#3D1786;letter-spacing:1px;">
                ${escape(title)}
              </h1>
              <div style="font-size:15px;line-height:1.6;color:#1F1731;">
                ${body}
              </div>
              ${
                ctaLabel && ctaUrl
                  ? `<div style="text-align:center;margin:28px 0 8px;">
                      <a href="${ctaUrl}" style="display:inline-block;background:#F59E0B;color:#3D1786;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;">
                        ${escape(ctaLabel)} ✨
                      </a>
                    </div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#FAF7FF;border-top:1px solid rgba(85,35,187,0.1);font-size:12px;color:#6B5B8A;text-align:center;">
              ${footer ?? `Tu reçois cet email parce que tu as un compte sur <a href="${APP_URL}" style="color:#5523BB;">kuizard.fr</a>.`}
              <br/>
              <a href="${APP_URL}/cgu" style="color:#6B5B8A;">CGU</a> ·
              <a href="${APP_URL}/confidentialite" style="color:#6B5B8A;">Confidentialité</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =============================================
// Templates
// =============================================

export function welcomeEmail({
  name,
}: {
  name: string | null;
}): { subject: string; html: string; text: string } {
  const displayName = name ?? "magicien(ne)";
  const subject = "Bienvenue sur Kuizard ! 🎩✨";
  const html = shell({
    preheader: "Crée ton premier quizz en quelques minutes.",
    title: `Bienvenue ${displayName} !`,
    body: `
      <p>Merci d'avoir rejoint <strong>Kuizard</strong> ! La magie peut opérer 🪄</p>
      <p>Voici ce que tu peux faire dès maintenant :</p>
      <ul>
        <li>Créer un quizz à partir d'un <strong>template</strong> (mariage, EVJF, blind-test…)</li>
        <li>Personnaliser tes questions, photos, lots, couleurs</li>
        <li>Partager le code ou le QR code à tes invités</li>
        <li>Suivre le classement en direct</li>
      </ul>
      <p>Si tu as la moindre question, écris-nous depuis l'onglet <em>Messages</em> de ton espace.</p>
    `,
    ctaLabel: "Créer mon premier quizz",
    ctaUrl: `${APP_URL}/dashboard/quizzes/templates`,
  });
  const text = `Bienvenue ${displayName} sur Kuizard ! Crée ton premier quizz : ${APP_URL}/dashboard/quizzes/templates`;
  return { subject, html, text };
}

export function paymentReceiptEmail({
  name,
  amountCents,
  planSlug,
  planName,
  quizTitle,
  quizCode,
}: {
  name: string | null;
  amountCents: number;
  planSlug: string;
  planName: string;
  quizTitle: string;
  quizCode: string;
}): { subject: string; html: string; text: string } {
  const amount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amountCents / 100);
  const subject = `Reçu Kuizard — ${amount} pour ${quizTitle}`;
  const displayName = name ?? "magicien(ne)";

  const html = shell({
    preheader: `Ton quizz "${quizTitle}" est débloqué.`,
    title: "Paiement confirmé ✨",
    body: `
      <p>Salut ${escape(displayName)} !</p>
      <p>On confirme ton paiement de <strong>${amount}</strong> pour le plan <strong>${escape(planName)}</strong>${planSlug !== planName ? ` (${escape(planSlug)})` : ""}.</p>
      <p>Ton quizz <strong>${escape(quizTitle)}</strong> (code <code>${escape(quizCode)}</code>) est maintenant débloqué avec toutes les options de ton plan.</p>
      <p>Tu peux télécharger ta facture depuis le portail Stripe (bouton <em>Gérer mon abo</em> sur ta page Paiements).</p>
    `,
    ctaLabel: "Voir mon quizz",
    ctaUrl: `${APP_URL}/q/${quizCode}`,
  });
  const text = `Paiement confirmé : ${amount} pour ${planName}. Quizz "${quizTitle}" (${quizCode}) débloqué. ${APP_URL}/q/${quizCode}`;
  return { subject, html, text };
}

export function subscriptionActivatedEmail({
  name,
  planName,
  amountCents,
  interval,
}: {
  name: string | null;
  planName: string;
  amountCents: number;
  interval: string | null;
}): { subject: string; html: string; text: string } {
  const amount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amountCents / 100);
  const period = interval === "year" ? "an" : "mois";
  const subject = `Bienvenue dans ${planName} ! Ton abo Kuizard est actif`;
  const displayName = name ?? "magicien(ne)";

  const html = shell({
    preheader: `${planName} est actif. Tu peux créer plusieurs quizz simultanément.`,
    title: `Bienvenue dans ${planName} !`,
    body: `
      <p>Salut ${escape(displayName)} 👋</p>
      <p>Ton abonnement <strong>${escape(planName)}</strong> est activé. Tu seras facturé <strong>${amount} / ${period}</strong>.</p>
      <p>Tu peux désormais gérer plusieurs quizz actifs en même temps, profiter de l'affichage TV, et toutes les options premium.</p>
      <p>Tu peux annuler à tout moment depuis le portail Stripe (page <em>Mon abonnement</em>).</p>
    `,
    ctaLabel: "Aller à mon espace",
    ctaUrl: `${APP_URL}/dashboard/subscription`,
  });
  const text = `Abo ${planName} activé : ${amount}/${period}. ${APP_URL}/dashboard/subscription`;
  return { subject, html, text };
}

export function newMessageNotificationEmail({
  name,
  senderRole,
  subject: convoSubject,
  preview,
  conversationUrl,
}: {
  name: string | null;
  senderRole: "USER" | "ADMIN";
  subject: string;
  preview: string;
  conversationUrl: string;
}): { subject: string; html: string; text: string } {
  const fromLabel =
    senderRole === "ADMIN" ? "L'équipe Kuizard" : "Un utilisateur";
  const subject = `[Kuizard] ${fromLabel} t'a écrit · ${convoSubject}`;
  const displayName = name ?? "magicien(ne)";
  const shortPreview =
    preview.length > 220 ? `${preview.slice(0, 220)}…` : preview;

  const html = shell({
    preheader: `${fromLabel} : ${shortPreview}`,
    title: `📬 Nouveau message`,
    body: `
      <p>Salut ${escape(displayName)},</p>
      <p><strong>${fromLabel}</strong> t'a écrit dans la conversation :</p>
      <p style="font-style:italic;color:#6B5B8A;">"${escape(convoSubject)}"</p>
      <div style="background:#FAF7FF;border-left:3px solid #5523BB;padding:12px 16px;border-radius:6px;margin:12px 0;">
        ${escape(shortPreview)}
      </div>
    `,
    ctaLabel: "Lire et répondre",
    ctaUrl: conversationUrl,
  });
  const text = `${fromLabel} t'a écrit : ${shortPreview}. Réponds : ${conversationUrl}`;
  return { subject, html, text };
}
