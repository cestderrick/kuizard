# Sprint Stripe + Admin V2 — Mise en service

## 1. Installer les nouvelles dépendances

```bash
npm install
# Installe : stripe (SDK serveur) + tsx (pour le seed plans)
```

## 2. Migrer la BDD

```bash
docker start kuizard-postgres
npx prisma migrate dev --name add_monetization
```

La migration ajoute :
- `PlanConfig` — config dynamique des plans (modifiable par admin)
- `PromoCode` — codes promos synchronisés avec Stripe Coupons
- `Payment` — historique paiements
- `Subscription` — abos
- `QuizTemplate` — CRUD templates (remplace progressivement le hardcoded)

## 3. Seed des plans initiaux

```bash
npm run db:seed:plans
```

Crée 6 plans : `free`, `essentiel`, `festif`, `magique`, `bar_essentiel`,
`bar_pro` avec leurs limites par défaut. Tu peux ensuite les éditer depuis
`/admin/plans`.

## 4. Webhook Stripe

### En dev local (CLI Stripe)

Installer le CLI : https://stripe.com/docs/stripe-cli

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie le `whsec_xxx` affiché et colle-le dans `.env` :

```
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Garde la commande qui tourne dans un terminal pendant que tu testes.

### En prod (VPS)

1. Dashboard Stripe → Developers → Webhooks → **Add endpoint**
2. URL : `https://kuizard.fr/api/webhooks/stripe`
3. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Stripe te donne un signing secret `whsec_...` → coller dans le `.env` prod
5. `pm2 restart kuizard`

## 5. Tester un paiement (mode test)

1. Connecte-toi avec ton compte
2. Crée un quizz
3. Clique sur "Voir les plans →" depuis l'éditeur
4. Choisis "Essentiel" (5€)
5. Sur la page Stripe Checkout, utilise la carte test :
   - Numéro : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
6. Tu es redirigé vers `/payment/success` et le quizz est marqué payé

## 6. Pages livrées

### Admin
| Route                      | Contenu                                          |
| -------------------------- | ------------------------------------------------ |
| `/admin/plans`             | CRUD plans + limites (tarifs, features)          |
| `/admin/promos`            | CRUD codes promos (sync Stripe Coupons)          |
| `/admin/payments`          | Historique paiements (filtrable)                 |
| `/admin/subscriptions`     | Vue read-only des abos                           |
| `/admin/templates`         | CRUD templates (remplace hardcoded TS)           |

### User
| Route                                          | Contenu                |
| ---------------------------------------------- | ---------------------- |
| `/dashboard/quizzes/[id]/upgrade`              | Choisir un plan        |
| `/payment/success`                             | Confirmation paiement  |
| `/payment/cancel`                              | Annulation paiement    |

## 7. Workflow Stripe expliqué

```
User clique "Débloquer" → createCheckoutSessionAction
  → crée Payment(status=pending) en BDD
  → crée Customer Stripe (si pas déjà)
  → crée Checkout Session Stripe
  → redirige vers checkout.stripe.com
User paie sur la page Stripe → Stripe redirige vers /payment/success
                            → Stripe envoie webhook checkout.session.completed
                                → Payment(status=succeeded) en BDD
                                → Quiz.isPaid = true
                                → Promo.redemptions++
```

## 8. Gating par plan (à venir V2.C)

Pour l'instant le check des limites côté création de questions n'est pas
encore implémenté. Quand on l'ajoutera, on lira `plan.limits.maxQuestions`
et on refusera l'ajout au-delà.

## 9. Production — checklist déploiement

```bash
# Sur le VPS
git pull
npm install              # installe stripe + tsx, regénère client Prisma via postinstall
npx prisma migrate deploy
npm run db:seed:plans    # seed les 6 plans (idempotent)
npm run build
pm2 restart kuizard
```

⚠️ Penser à mettre à jour le `.env` prod avec les vraies clés Stripe LIVE
(`sk_live_...`, `pk_live_...`, `whsec_...`) quand tu seras prêt.
