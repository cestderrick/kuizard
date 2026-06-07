# Registre des traitements RGPD — Kuizard / Projiat

> ⚠️ Document INTERNE, à tenir à jour. Pas à publier ni à transmettre, mais
> à pouvoir produire en cas de contrôle CNIL.
>
> **Avertissement** : ce document a été pré-rédigé à partir de l'architecture
> du projet. Fais-le valider par un juriste ou un DPO externe avant de t'en
> servir comme référence officielle.

## Identité du responsable de traitement

- **Raison sociale** : Projiat (micro-entreprise)
- **Représentant légal / référent données** : Cédric Ghironzi
- **Email contact RGPD** : ghironzicedric@gmail.com (à remplacer par une
  adresse dédiée type rgpd@kuizard.fr quand possible)
- **Service en ligne** : kuizard.fr / kuizard.com

## Liste des traitements

### T1. Gestion des comptes utilisateurs
- **Finalité** : permettre la création et l'utilisation d'un compte Kuizard
- **Données collectées** : nom (facultatif), email, mot de passe hashé
  (bcrypt), type de compte (particulier/pro), date d'inscription
- **Base légale** : exécution du contrat (art. 6.1.b RGPD)
- **Durée de conservation** : tant que le compte est actif. Suppression
  immédiate sur demande (bouton dans /dashboard/profile) ou après 3 ans
  d'inactivité (à automatiser)
- **Destinataires** : aucun tiers
- **Sous-traitants** : OVH (hébergement VPS, France)
- **Mesures de sécurité** : HTTPS partout, mots de passe hashés bcrypt,
  sessions Auth.js v5, cookies httpOnly + sameSite=lax

### T2. Création et hébergement de quizz
- **Finalité** : permettre aux utilisateurs de créer/diffuser des quizz
- **Données collectées** : titre, description, photos (upload), questions,
  réponses, lots, thème
- **Base légale** : exécution du contrat
- **Durée** : tant que le compte créateur est actif, supprimé en cascade
  lors de la suppression du compte
- **Sous-traitants** : OVH (stockage local sur VPS)

### T3. Participations aux quizz (joueurs)
- **Finalité** : permettre aux joueurs de répondre et figurer au classement
- **Données collectées** : pseudo libre, email (facultatif), réponses, score,
  date début/fin, cookie de session `kz_play_<quizId>` (durée 30 jours)
- **Base légale** : intérêt légitime (animation d'évènement) — pas de
  consentement requis car les données restent dans le périmètre du quizz
- **Durée** : tant que le quizz est actif (par défaut 30 jours)
- **Sous-traitants** : OVH

### T4. Messagerie support
- **Finalité** : échange utilisateur ↔ équipe Kuizard
- **Données** : sujet, contenu des messages, dates, read receipts
- **Base légale** : intérêt légitime (support client)
- **Durée** : 2 ans après dernier message (à automatiser)
- **Sous-traitants** : OVH + Resend (notifications email)

### T5. Paiements
- **Finalité** : facturer les plans payants et abonnements
- **Données** : montant, plan acheté, statut, IDs Stripe Customer/Session/
  PaymentIntent
- **Base légale** : exécution du contrat + obligation légale (comptabilité)
- **Durée** : 10 ans (obligation comptable française art. L123-22 Code de
  commerce). Les Stripe Customer IDs sont conservés côté Stripe même après
  suppression du compte Kuizard.
- **Sous-traitants** : Stripe (Irlande/USA, certifié PCI-DSS), OVH

### T6. Abonnements récurrents
- **Finalité** : facturer périodiquement les plans Bar
- **Données** : ID abo Stripe, statut, période, prochain renouvellement
- **Base légale** : exécution du contrat
- **Durée** : pendant la durée de l'abo + 10 ans
- **Sous-traitants** : Stripe, OVH

### T7. Codes promos
- **Finalité** : appliquer des réductions ou offrir des plans
- **Données** : code, paramètres de remise, statistiques d'usage
- **Base légale** : intérêt légitime
- **Sous-traitants** : Stripe (Coupons)

### T8. Stats publiques (optionnel, configurable admin)
- **Finalité** : afficher les chiffres globaux (totaux anonymisés) sur la
  home et le dashboard
- **Données** : aucune donnée nominative — uniquement des compteurs
  agrégés
- **Base légale** : intérêt légitime
- **Risque RGPD** : nul (aucune identification possible)

### T9. Suggestions et signalements
- **Finalité** : récolter les retours utilisateurs
- **Données** : email (facultatif), userId si connecté, contenu, catégorie
- **Base légale** : consentement (le user clique volontairement Envoyer)
- **Durée** : 2 ans, ou jusqu'à traitement complet
- **Sous-traitants** : OVH

## Sous-traitants principaux

| Sous-traitant | Service              | Localisation | Conformité           |
| ------------- | -------------------- | ------------ | -------------------- |
| OVH           | Hébergement VPS, DB  | France       | RGPD natif           |
| Cloudflare    | DNS, CDN, WAF        | USA          | Clauses contractuelles type |
| Stripe        | Paiements            | Irlande/USA  | DPA disponible       |
| Resend        | Emails transactionnels | USA        | DPA disponible       |

## Droits des personnes concernées

Tout utilisateur peut, à tout moment, exercer :
- **Droit d'accès** : copie de ses données (export via /dashboard/payments,
  /dashboard/messages, /dashboard/profile)
- **Droit de rectification** : modification de ses infos via /dashboard/profile
- **Droit à l'effacement** : bouton "Supprimer mon compte" dans
  /dashboard/profile (suppression immédiate, cascade complète)
- **Droit à la portabilité** : export CSV des participations à ses quizz
  via /api/quiz/{code}/export
- **Droit d'opposition** : par email à l'adresse contact

## Mesures de sécurité

- HTTPS forcé (Cloudflare + nginx)
- Mots de passe hashés bcrypt (salt 10)
- Sessions HTTPOnly, sameSite=lax, secure en prod
- Pas de tracking analytics ni publicitaire
- Backups BDD : à automatiser (V4)
- Logs minimaux, pas de PII inutiles

## En cas de violation de données

1. Détecter et qualifier l'incident (gravité, données impactées)
2. Notifier la CNIL dans les **72 heures** via notifications.cnil.fr si
   risque pour les droits et libertés
3. Notifier les personnes concernées si risque élevé
4. Documenter l'incident dans ce registre

## À mettre en place / améliorer (TODO)

- [ ] Adresse email dédiée rgpd@kuizard.fr
- [ ] DPA signés avec Stripe, Resend
- [ ] Politique de suppression automatique des comptes inactifs (3 ans)
- [ ] Backups BDD chiffrés
- [ ] Audit annuel (ou faire appel à un DPO externe)
