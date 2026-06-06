# V2 — Features livrées en rafale

## 0. Mise à jour BDD

```bash
docker start kuizard-postgres        # ou docker compose up -d
npx prisma migrate dev --name add_promo_gift
```

La migration ajoute le champ `giftPlanSlug` à la table `PromoCode`.

Pour la prod :
```bash
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart kuizard-app
```

## 1. Gating des limites par plan (V2.C)

Côté serveur, toutes les actions check désormais les limites du plan effectif :

| Action                          | Limite vérifiée    |
| ------------------------------- | ------------------ |
| Ajouter une question            | `maxQuestions`     |
| Démarrer une participation      | `maxParticipants`  |
| Activer mode SCHEDULED          | `scheduledMode`    |
| Activer mode LIVE               | `liveMode`         |
| Personnaliser couleurs          | `customColors`     |
| Personnaliser lots              | `customPrizes`     |
| Upload cover image              | `coverImage`       |
| Upload photo question           | `questionImages`   |

L'éditeur de quizz affiche maintenant **"Plan : X / Y questions"** + les
features actives, avec bouton "Voir les plans →" si gratuit.

## 2. Subscription Checkout (V2.D)

Page `/dashboard/subscription` :
- Affiche les plans `type=subscription` (Bar Essentiel / Bar Pro)
- Bouton "Souscrire" → Stripe Checkout en mode subscription
- Webhook gère création/update/cancel des `Subscription`

⚠️ **Pour que les abos fonctionnent**, il faut renseigner le `stripePriceId`
sur chaque plan d'abo dans `/admin/plans` (créé manuellement dans Stripe
dashboard → Products → Prices).

## 3. Customer Portal Stripe (V2.E)

Bouton "🔐 Gérer mon abo" sur `/dashboard/subscription` →
`stripe.billingPortal.sessions.create` → portail Stripe pour :
- Voir factures
- Mettre à jour CB
- Annuler l'abo
- Etc.

Pas d'UI à coder côté nous, Stripe héberge.

## 4. Mes suggestions (V2.F)

Page `/dashboard/suggestions` : liste des suggestions envoyées par l'user
connecté avec leur statut (📬 Reçue / 👀 Vue / ✓ Traitée / Pas retenue).

## 5. Mes stats (V2.G)

Page `/dashboard/stats` :
- Total quizz / publiés / questions / participations
- Activité 7d / 30d
- Top 5 quizz par participation
- Total dépensé

## 6. Codes promos user (V2.H)

Page `/dashboard/promos` :
- Saisie d'un code
- Si **code réduction** (% off ou amount off) → message "applique au prochain checkout"
- Si **code cadeau** (nouveau champ `giftPlanSlug`) → choix d'un quizz à
  débloquer instantanément sans paiement
- Historique des codes utilisés

Côté admin (`/admin/promos`), le formulaire accepte maintenant un champ
"🎁 Plan offert" pour créer des codes cadeau.

## 7. Templates BDD côté user (V2.I)

`/dashboard/quizzes/templates` lit désormais en priorité depuis la table
`QuizTemplate` (créée via `/admin/templates`). Si la BDD est vide, le
hardcoded `lib/quiz/templates.ts` sert de fallback.

Quand tu auras migré tes 6 templates dans `/admin/templates`, tu pourras
supprimer le hardcoded TS.

---

## Récapitulatif des routes V2

### User
- `/dashboard/subscription` — gérer son abo
- `/dashboard/promos` — codes promos
- `/dashboard/stats` — stats globales
- `/dashboard/suggestions` — mes suggestions
- `/dashboard/quizzes/[id]/upgrade` — choisir un plan

### Admin
- `/admin/plans` — CRUD plans + limites
- `/admin/promos` — CRUD codes promos (incl. gift)
- `/admin/payments` — historique
- `/admin/subscriptions` — vue abos
- `/admin/templates` — CRUD templates

## Idées V3 (pas urgentes)

- Email transactionnel (welcome, paiement reçu, abo renouvelé) via Resend
- Notifications dans l'app (cloche dans navbar)
- Export CSV des participations
- Page publique de profil créateur
- Multi-langue (next-intl déjà installé)
- Migration uploads vers Cloudflare R2
- Live leaderboard pendant le jeu (refacto SSE)
- Statistiques temps réel pour bars (sessions par soir, etc.)
