# V5 — Setup R2, backups, cron, i18n, stats live

## 0. Mise à jour générale

```bash
docker start kuizard-postgres
npx prisma migrate dev --name v5_inactivity_tracking
# Ajoute User.lastLoginAt + User.inactivityWarnedAt

git pull && npm install && npx prisma migrate deploy && npm run build && pm2 restart kuizard-app
```

## 1. Cloudflare R2 (uploads)

### Configurer R2

1. Dashboard Cloudflare → **R2** → Create bucket
2. Nomme-le `kuizard-uploads`
3. **Settings** → **R2.dev subdomain** : active-le pour obtenir une URL publique (`https://pub-xxxxx.r2.dev`)
4. Ou (meilleur) **Custom Domain** : pointe `uploads.kuizard.fr` vers le bucket
5. **Manage R2 API Tokens** → Create API token (permissions Object Read & Write sur ce bucket)

### Variables d'env (à coller dans .env prod)

```
R2_ACCOUNT_ID="ton-account-id"
R2_BUCKET="kuizard-uploads"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_PUBLIC_URL="https://uploads.kuizard.fr"
```

### Comportement automatique

- Si **les 5 vars** sont présentes → uploads vers R2 (URLs en `R2_PUBLIC_URL/...`)
- Si **manquantes** → fallback `public/uploads/` (comportement actuel)

Pas de migration des anciennes images — elles restent sur le disque local
et continuent d'être servies par Next. Les nouveaux uploads partent sur R2.

## 2. Stats live temps réel

Sur `/dashboard/quizzes/[id]/live`, un nouveau panneau "📡 Temps réel"
affiche :
- Joueurs connectés / terminés / total
- Répartition des réponses sur la question courante (barres %)
- Mise en avant des bonnes réponses

Polling toutes les **2 secondes** via `/api/quiz/[code]/live-stats`
(protégé : seul le propriétaire du quizz a accès).

## 3. Backup BDD automatique

Le script `scripts/backup-db.sh` :
- Dump Postgres via Docker
- Compresse en gzip
- Rotation auto (garde 14 jours)
- Vérifie que le dump n'est pas vide

### Setup cron sur le VPS

```bash
# 1. Rendre le script exécutable
chmod +x ~/kuizard/scripts/backup-db.sh

# 2. Tester manuellement
cd ~/kuizard && set -a && source .env && set +a && ./scripts/backup-db.sh

# 3. Cron quotidien à 3h
crontab -e
# Ajouter :
0 3 * * * cd /home/ubuntu/kuizard && set -a && source .env && set +a && ./scripts/backup-db.sh >> /var/log/kuizard-backup.log 2>&1
```

### Backup OFF-SITE (recommandé)

Synchronise `BACKUP_DIR` vers R2 ou Backblaze B2 :
```bash
# Exemple avec rclone vers R2
rclone sync ~/kuizard-backups r2:kuizard-backups
```

## 4. Cron suppression comptes inactifs

Endpoint protégé : `POST /api/cron/cleanup-inactive`.

### Variables d'env

```
CRON_SECRET="un-secret-long-aleatoire"      # généré par openssl rand -hex 32
INACTIVITY_DAYS="1095"                       # 3 ans par défaut
```

### Comportement

- **Lance tous les jours** (cron) → scanne les users :
  - **Avertissement email** envoyé 30 jours avant la deadline (une seule fois)
  - **Suppression effective** si dernière connexion dépasse `INACTIVITY_DAYS`
- Admins exclus (jamais supprimés auto)
- Le user qui se reconnecte → `lastLoginAt` mis à jour, `inactivityWarnedAt` reset

### Cron VPS

```bash
crontab -e
# Ajouter :
15 3 * * * curl -X POST -H "Authorization: Bearer TON_CRON_SECRET" https://kuizard.fr/api/cron/cleanup-inactive >> /var/log/kuizard-cron.log 2>&1
```

## 5. Multi-langue (FR/EN)

I18n minimaliste sans routing localisé (pas de breaking change sur les
routes existantes).

### Comment ça marche

- Cookie `kz_locale` = "fr" ou "en"
- Helper serveur `getLocale()` lit cookie + Accept-Language + fallback "fr"
- Helper `t(messages, "ma.cle")` pour interpoler
- Sélecteur 🇫🇷/🇬🇧 visible dans le footer

### Migrer des textes vers i18n

Avant :
```tsx
<span>Tableau de bord</span>
```

Après :
```tsx
import { getMessages } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/messages";

const messages = await getMessages();
<span>{t(messages, "nav.dashboard")}</span>
```

Ajoute la clé dans `lib/i18n/messages.ts` (objets `fr` et `en`).

### Étendre à d'autres langues

Dans `lib/i18n/messages.ts` :
1. Copier l'objet `fr`, traduire les valeurs
2. Ajouter dans `LOCALES` et `SUPPORTED_LOCALES`

## 6. Récap des nouvelles routes

- `/api/quiz/[code]/live-stats` — stats pilote (auth requise)
- `/api/cron/cleanup-inactive` — endpoint cron (CRON_SECRET requis)

## 7. Prod déploiement complet

```bash
git pull
npm install                # installe @aws-sdk + autres
npx prisma migrate deploy
npm run build
pm2 restart kuizard-app

# Optionnel : activer R2 (ajouter les 5 R2_* dans .env)
# Optionnel : activer le cron suppression (ajouter CRON_SECRET + crontab)
# Optionnel : configurer le cron backup
```

Tout est rétro-compatible : sans aucune variable supplémentaire, l'app
fonctionne comme avant (uploads locaux, pas de cleanup, pas de backup).
