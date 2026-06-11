# Setup monitoring prod — Sentry + UptimeRobot

Ce doc explique comment activer le monitoring d'erreurs (Sentry) et le monitoring de disponibilité (UptimeRobot) sur Kuizard prod.

Les deux services ont une formule gratuite suffisante pour démarrer.

---

## 1. Sentry — monitoring des erreurs

### Pourquoi
- Te notifie par email à la moindre erreur JS côté client OU côté serveur.
- Te donne la stack trace complète + le contexte (URL, user, navigateur).
- Tu vois venir les régressions avant tes utilisateurs râlent.

### Setup (15 minutes)

1. Crée un compte gratuit sur https://sentry.io (formule **Developer free**, 5000 erreurs/mois suffisent largement au démarrage).
2. Crée un nouveau projet **Next.js**. Sentry te donne :
   - Un **DSN** (URL longue qui finit par `.ingest.sentry.io/123`).
   - Un **Auth Token** (pour upload des sourcemaps).
   - Une **org slug** et un **project slug**.
3. Ajoute ces variables dans `/var/www/kuizard/.env` (VPS) :

   ```bash
   # DSN serveur (privé)
   SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/123"
   # DSN client (public, peut être exposé dans le bundle JS)
   NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/123"
   # Pour upload des sourcemaps au build
   SENTRY_ORG="ton-org-slug"
   SENTRY_PROJECT="kuizard"
   SENTRY_AUTH_TOKEN="sntrys_xxx"
   ```

4. Installe la dépendance :

   ```bash
   cd /var/www/kuizard
   npm install @sentry/nextjs
   ```

5. Rebuild + restart :

   ```bash
   rm -rf .next
   npm run build
   pm2 restart kuizard-app
   ```

6. **Teste** : ajoute temporairement `throw new Error("Test Sentry")` dans une page (par exemple `app/page.tsx`), build, reload la home → tu devrais voir l'erreur arriver dans Sentry en ~30 secondes. Retire le throw ensuite.

### Code en place
- `instrumentation.ts` — init côté Node/Edge runtime
- `instrumentation-client.ts` — init côté browser
- `sentry.server.config.ts` — config serveur
- `sentry.edge.config.ts` — config edge (middleware)
- `next.config.ts` — wrapping conditionnel avec `withSentryConfig` (uniquement si `SENTRY_DSN` présent)

Si `SENTRY_DSN` est absent (= dev local), Sentry est complètement désactivé. Aucun bruit.

### Filtres déjà configurés
On ignore par défaut les bruits classiques :
- `AbortError` (navigation user)
- `ResizeObserver loop limit` (faux positif navigateur)
- `Non-Error promise rejection captured` (bots crawler)
- Erreurs réseau Node (`ECONNRESET`, `ECONNREFUSED`)

Modifie `sentry.server.config.ts` / `instrumentation-client.ts` pour ajouter d'autres filtres si besoin.

---

## 2. UptimeRobot — monitoring de disponibilité

### Pourquoi
- Te ping toutes les 5 minutes que kuizard.com répond bien.
- T'envoie un email/SMS si le site est down.
- Te donne un % d'uptime mensuel propre.

### Setup (5 minutes)

1. Crée un compte gratuit sur https://uptimerobot.com (formule **Free**, 50 monitors / interval 5 min).
2. Clique **+ Add New Monitor**.
3. Configure :
   - **Monitor Type** : `HTTP(s)`
   - **Friendly Name** : `Kuizard prod`
   - **URL** : `https://kuizard.com/api/health`
   - **Monitoring Interval** : `5 minutes` (max sur le plan free)
   - **Alert Contacts** : ton email perso
4. **Advanced settings** :
   - **Keyword Type** : `exists`
   - **Keyword** : `"status":"ok"`
   - → Comme ça, si le serveur répond mais que la BDD est down, l'alerte se déclenche quand même.
5. Save.

### Endpoint déjà en place
`/api/health` répond :
- **200** + `{ "status": "ok", ... }` si tout va bien
- **503** + `{ "status": "degraded", ... }` si la BDD est inaccessible

L'endpoint vérifie la connexion Postgres via un `SELECT 1`. C'est ultra léger et fait un vrai roundtrip.

### Optionnel — Status page publique
UptimeRobot peut générer une **status page publique** gratuite (genre `status.kuizard.com`) en 1 clic. Sympa pour la transparence si tu as des clients pros qui demandent.

Settings → Status Pages → Add Status Page → URL custom → ajoute un CNAME `status.kuizard.com` chez Cloudflare pointant vers `stats.uptimerobot.com`.

---

## 3. Récap dashboard quotidien

Une fois en place, ton quotidien monitoring devient :
- **Sentry** : 1 onglet ouvert dans un coin, alerte par mail si nouvelle erreur.
- **UptimeRobot** : email si downtime > 5 min, sinon silence radio.

Si tu veux pousser plus loin plus tard : Logflare ou Better Stack pour agréger les logs PM2, ou un APM comme Datadog si Sentry ne suffit plus. Mais pour démarrer, ces deux outils gratuits couvrent 95 % des besoins d'un SaaS micro-entreprise.
