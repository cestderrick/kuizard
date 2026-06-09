import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique cookies",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique cookies" lastUpdate="3 juin 2026">
      <p>
        Kuizard utilise <strong>uniquement des cookies techniques</strong> nécessaires
        au fonctionnement du service. Aucun cookie publicitaire, aucun
        tracker tiers, aucune analyse de comportement.
      </p>

      <h2>Cookies utilisés</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Rôle</th>
            <th>Durée</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>authjs.session-token</code></td>
            <td>Te garder connecté à ton compte créateur</td>
            <td>30 jours</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td><code>__Host-authjs.csrf-token</code></td>
            <td>Protection contre les attaques CSRF</td>
            <td>Session</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td><code>__Secure-authjs.callback-url</code></td>
            <td>Mémoriser la page demandée avant login</td>
            <td>Session</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td><code>kz_play_&lt;quizId&gt;</code></td>
            <td>Identifier ta participation à un quizz (sans compte)</td>
            <td>30 jours</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td><code>kz_locale</code></td>
            <td>Mémoriser ta langue préférée (FR, EN, ES, IT, DE, PT, RU, ZH)</td>
            <td>1 an</td>
            <td>Préférence</td>
          </tr>
          <tr>
            <td><code>kuizard:cookies-ack:v1</code></td>
            <td>Mémoriser que tu as vu ce bandeau (localStorage)</td>
            <td>Permanent</td>
            <td>Préférence</td>
          </tr>
        </tbody>
      </table>

      <h2>Aucun tracking</h2>
      <p>
        Nous n'utilisons <strong>aucun</strong> outil de tracking : ni Google
        Analytics, ni Facebook Pixel, ni hotjar, ni Tag Manager, ni équivalent.
      </p>

      <h2>Cookies tiers</h2>
      <p>Aucun cookie tiers sur la majorité du site. Exceptions :</p>
      <ul>
        <li>
          <strong>Stripe</strong> : lors du paiement, Stripe pose ses propres
          cookies sur sa page de paiement. Voir leur{" "}
          <a
            href="https://stripe.com/cookies-policy/legal"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare</strong> (notre CDN) peut poser un cookie
          technique <code>__cf_bm</code> pour la protection anti-bot. Voir leur{" "}
          <a
            href="https://www.cloudflare.com/cookie-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique
          </a>
          .
        </li>
      </ul>

      <h2>Refuser les cookies</h2>
      <p>
        Les cookies listés ci-dessus sont <em>strictement nécessaires</em> au
        fonctionnement du service (RGPD art. 82 + position CNIL). Tu peux les
        bloquer dans les réglages de ton navigateur, mais l'app risque alors
        de ne plus marcher (impossible de se connecter, etc.).
      </p>

      <h2>Plus d'infos</h2>
      <p>
        Pour le détail des données traitées, voir la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </LegalLayout>
  );
}
