# Sprint Admin V1 + Messagerie + Reprise multi-session — Mise en service

## 1. Lancer Docker Desktop, vérifier Postgres

```bash
docker start kuizard-postgres   # si déjà créé
# OU
docker compose up -d            # si non
```

## 2. Régénérer le client Prisma + migrer la BDD

```bash
# Génère les types TS (UserRole + Conversation + Message + Participation.currentQuestionIndex)
npx prisma generate

# Une seule migration pour tout le sprint
npx prisma migrate dev --name add_admin_messaging_resume
```

La migration ajoute :
- l'enum `UserRole` (USER | ADMIN) + colonne `role` sur User (default USER)
- Tables `Conversation` + `Message` (messagerie support)
- Colonnes `currentQuestionIndex` (Int, default 0) et `lastActivityAt` (DateTime) sur Participation

## 3. Te promouvoir admin

Connecte-toi à Postgres (Docker) :

```bash
docker exec -it kuizard-postgres psql -U kuizard -d kuizard
```

Puis :

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE email = 'ghironzicedric@gmail.com';
SELECT id, email, role FROM "User" WHERE email = 'ghironzicedric@gmail.com';
\q
```

## 4. Vérifier

- Va sur `/dashboard` → un bouton "🛡️ Admin" doit apparaître en haut à droite
- Clique → tu arrives sur `/admin` (tableau de bord global)
- Les autres comptes (non-admin) ne voient ni le bouton ni `/admin` (404)

## 5. Déploiement prod (VPS)

Sur le VPS, après `git pull` :

```bash
npx prisma migrate deploy   # applique la migration en prod
npm run build
pm2 restart kuizard
```

Puis SQL identique pour te promouvoir admin sur la BDD prod.

## Pages livrées

### Admin
| Route                      | Contenu                                          |
| -------------------------- | ------------------------------------------------ |
| `/admin`                   | Stats globales (users, quizz, participations…)   |
| `/admin/users`             | Liste des 200 derniers users                     |
| `/admin/quizzes`           | Liste des 200 derniers quizz (tous users)        |
| `/admin/suggestions`       | Inbox modération suggestions                     |
| `/admin/messages`          | Inbox messagerie support (filtres open/closed)   |
| `/admin/messages/[id]`     | Thread + réponse + clôture/réouverture           |

### User
| Route                          | Contenu                                  |
| ------------------------------ | ---------------------------------------- |
| `/dashboard/messages`          | Mes conversations avec l'équipe          |
| `/dashboard/messages/new`      | Démarrer une nouvelle conversation       |
| `/dashboard/messages/[id]`     | Thread + réponse                         |

## Reprise multi-session

- Cookie `kz_play_<quizId>` (30 jours) — survit à la fermeture du navigateur
- Autosave des réponses toutes les 800ms (debounce)
- En mode SCHEDULED : tant que `now < scheduledCloseAt`, le joueur peut
  revenir et **modifier ses réponses**, même après avoir vu son score
- En mode LIVE_MANUAL : une fois `completedAt` set, plus de modif possible
  (la question a déjà avancé pour tous)
- Bouton « 📝 Modifier mes réponses » dans le ResultCard en SCHEDULED ouvert

## Modules V2 (à venir)

- Gestion abonnements (couplé Stripe)
- Gestion business plan / codes promos
- CRUD templates (passe d'un hardcodage TS à une table BDD)
- Promotion en ADMIN via bouton (pour l'instant SQL only)
