import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique cookies de Kuizard",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" lastUpdate="11 juin 2026">
      <p>
        Kuizard utilise uniquement des cookies <strong>techniques</strong>{" "}
        nécessaires au fonctionnement du service. Aucun cookie publicitaire,
        aucun tracker tiers d'analyse marketing, aucune analyse comportementale.
      </p>

      <h2>1. Cookies utilisés sur Kuizard</h2>
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
            <td>
              <code>authjs.session-token</code>
            </td>
            <td>Te garder connecté à ton compte créateur.</td>
            <td>30 jours</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td>
              <code>__Host-authjs.csrf-token</code>
            </td>
            <td>Protection contre les attaques CSRF.</td>
            <td>Session</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td>
              <code>__Secure-authjs.callback-url</code>
            </td>
            <td>Mémoriser la page demandée avant connexion.</td>
            <td>Session</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td>
              <code>kz_play_&lt;quizId&gt;</code>
            </td>
            <td>Identifier ta participation à un quiz (sans compte).</td>
            <td>30 jours</td>
            <td>Strictement nécessaire</td>
          </tr>
          <tr>
            <td>
              <code>kz_locale</code>
            </td>
            <td>
              Mémoriser ta langue préférée (FR, EN, ES, IT, DE, PT, RU, ZH).
            </td>
            <td>1 an</td>
            <td>Préférence</td>
          </tr>
          <tr>
            <td>
              <code>kuizard:cookies-ack:v1</code>
            </td>
            <td>
              Mémoriser que tu as vu le bandeau d'information (stocké en{" "}
              <em>localStorage</em>, pas en cookie HTTP).
            </td>
            <td>Permanent</td>
            <td>Préférence</td>
          </tr>
        </tbody>
      </table>
      <p>
        Les cookies dits « strictement nécessaires » sont indispensables
        pour&nbsp;:
      </p>
      <ul>
        <li>maintenir ta session créateur&nbsp;;</li>
        <li>sécuriser les formulaires (CSRF)&nbsp;;</li>
        <li>permettre la participation aux quiz&nbsp;;</li>
        <li>assurer le fonctionnement technique de l'application.</li>
      </ul>

      <h2>2. Aucun tracker analytique ni publicitaire</h2>
      <p>
        Nous n'utilisons aucun outil de tracking à des fins statistiques ou
        publicitaires&nbsp;:
      </p>
      <ul>
        <li>pas de Google Analytics&nbsp;;</li>
        <li>pas de Google Tag Manager&nbsp;;</li>
        <li>pas de Facebook Pixel&nbsp;;</li>
        <li>pas de Hotjar, PostHog, Plausible, Mixpanel ou équivalents.</li>
      </ul>

      <h2>3. Cookies tiers</h2>
      <p>
        Il n'y a pas de cookies tiers sur la majorité du site Kuizard.
        Néanmoins, certains services intégrés peuvent en déposer&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — lors du paiement, Stripe utilise ses propres
          cookies sur sa page de paiement (sécurité, lutte contre la fraude,
          fonctionnement du paiement). Plus d'infos sur la{" "}
          <a
            href="https://stripe.com/fr/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique de confidentialité de Stripe
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare</strong> (notre CDN) — Cloudflare peut déposer un
          cookie technique de type <code>__cf_bm</code> pour distinguer le
          trafic humain du trafic automatisé (bots). Plus d'infos sur la{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique de confidentialité de Cloudflare
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare R2</strong> — stockage des photos uploadées dans
          tes quiz. R2 ne dépose pas de cookies analytiques&nbsp;; les fichiers
          sont servis via des URL signées.
        </li>
      </ul>
      <p>
        Ces cookies sont gérés directement par ces prestataires, selon leurs
        propres règles.
      </p>

      <h2>4. Refuser ou gérer les cookies</h2>
      <p>
        Les cookies listés ci-dessus sont, pour la plupart, strictement
        nécessaires au fonctionnement du service (au sens de l'article 82 de la
        loi Informatique et Libertés / RGPD et de la position de la CNIL). Ils
        ne nécessitent donc pas ton consentement préalable.
      </p>
      <p>
        Tu peux configurer ton navigateur pour bloquer les cookies ou être
        alerté lorsqu'un cookie est déposé. Mais si tu bloques les cookies
        strictement nécessaires&nbsp;:
      </p>
      <ul>
        <li>
          la connexion à ton compte créateur risque de ne plus
          fonctionner&nbsp;;
        </li>
        <li>la participation aux quiz peut être dégradée ou impossible&nbsp;;</li>
        <li>
          certaines fonctionnalités (langue, redirection après login, etc.)
          peuvent cesser de fonctionner correctement.
        </li>
      </ul>

      <h2>5. En savoir plus</h2>
      <p>
        Pour plus de détails sur&nbsp;:
      </p>
      <ul>
        <li>les données personnelles que nous traitons&nbsp;;</li>
        <li>les finalités des traitements&nbsp;;</li>
        <li>les durées de conservation&nbsp;;</li>
        <li>tes droits (RGPD).</li>
      </ul>
      <p>
        Consulte notre{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>
    </LegalLayout>
  );
}
