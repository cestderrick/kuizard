# Emails transactionnels — Mise en service (Resend)

## 1. Comptes & DNS

1. Créer un compte sur https://resend.com (gratuit jusqu'à 3000 mails/mois)
2. Aller dans **Domains** → **Add Domain** → entrer `kuizard.fr`
3. Resend te donne 3 enregistrements DNS à ajouter chez Cloudflare :
   - `SPF` (TXT)
   - `DKIM` (TXT)
   - `MX` (parfois, si tu veux recevoir des mails sur noreply@)
4. Une fois propagés (5-30 min), Resend les marque "Verified"
5. Récupérer un **API Key** dans **API Keys**
6. Coller dans le `.env` :
   ```
   RESEND_API_KEY="re_xxx..."
   RESEND_FROM_EMAIL="noreply@kuizard.fr"
   ```

## 2. En dev local sans Resend

Si `RESEND_API_KEY` est vide, les emails sont **loggés dans la console**
au lieu d'être envoyés. Tu peux donc tester tout le flow sans avoir à
créer un compte Resend.

## 3. Emails envoyés automatiquement

| Trigger                              | Destinataire | Template                       |
| ------------------------------------ | ------------ | ------------------------------ |
| Inscription `/signup`                | Nouveau user | `welcomeEmail`                 |
| Webhook `checkout.session.completed` | Acheteur     | `paymentReceiptEmail`          |
| Webhook `customer.subscription.created` (1ère fois) | Souscripteur | `subscriptionActivatedEmail` |
| Admin répond à une conversation      | User concerné| `newMessageNotificationEmail`  |

Tous sont **fire-and-forget** : un échec d'envoi ne fait jamais planter
l'action principale. Les erreurs sont loggées dans la console / PM2.

## 4. Personnaliser les templates

Tout est dans `lib/email/templates.ts`. Couleurs et structure HTML alignées
sur la charte Kuizard (violet + or sur fond crème). Compatible Gmail,
Outlook, Apple Mail (HTML inline + table layout).

## 5. Déploiement

```bash
# Local
git add -A
git commit -m "feat: emails transactionnels (Resend)"
git push

# VPS
git pull
npm install            # installe `resend`
npm run build
pm2 restart kuizard-app
```

Puis sur le VPS, mettre à jour le `.env` prod avec `RESEND_API_KEY` réel.

## 6. Idées d'emails futurs (V3.1)

- Quizz qui expire bientôt (J-3)
- Récap mensuel des participations pour les Bars
- Confirmation suggestion reçue
- Récap fin de soirée pour LIVE
- Onboarding goutte-à-goutte (J+1, J+3, J+7)
