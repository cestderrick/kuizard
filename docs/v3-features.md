# V3 — Profil, messagerie admin, stats publiques, templates riches, timer

## 0. Migration BDD

```bash
docker start kuizard-postgres
npx prisma migrate dev --name v3_features
```

La migration ajoute :
- `Message.readByAdminAt` + `Message.readByUserAt` (read receipts)
- `QuizTemplate.theme` + `QuizTemplate.tags[]`
- `Quiz.fromTemplateSlug` (tracking templates utilisés)
- Table `PublicStatsConfig` (singleton, configuration des stats publiques)

Prod :
```bash
git pull && npm install && npx prisma migrate deploy && npm run build && pm2 restart kuizard-app
```

## 1. V3.B — Page profil user

`/dashboard/profile` : modifier nom, email, type de compte + changement de
mot de passe (avec vérif de l'actuel).

Lien ajouté dans la nav user.

## 2. V3.C — Placeholders questions

À la création d'une question, plus de texte "Réponse A", "Nouvelle
question". L'éditeur affiche un placeholder gris en exemple. L'utilisateur
tape directement, sans avoir à supprimer un texte fictif.

## 3. V3.D — Messagerie admin v2

- **Read receipts** : chaque message stocke `readByUserAt` / `readByAdminAt`
- Dans `/admin/messages/[id]`, les messages envoyés par l'admin affichent
  **"✓ Envoyé (non lu)"** ou **"✓✓ Lu le DD/MM HH:mm"**
- Visible UNIQUEMENT côté admin
- **Admin peut initier une conversation** : `/admin/users/[id]` → formulaire
  "✉️ Envoyer un message" qui crée la conversation et envoie un email au user

## 4. V3.E — Stats publiques configurables

- `/admin/public-stats` : toggle global + checkboxes pour choisir quelles
  stats afficher (users, quizz, questions, participations, score moyen) +
  titre/sous-titre personnalisés
- Bloc affiché sur **home** (entre hero et "comment ça marche") et **dashboard user**
- Si désactivé : rien n'apparaît (composant retourne `null`)

## 5. V3.F — Tags + thèmes templates

Dans `/admin/templates`, le formulaire accepte :
- **Thème visuel** (string libre, ex "romantique", "vintage")
- **Tags** (séparés par virgules, ex "famille, humour, années 90")

## 6. V3.G — Browser templates user avec filtres

`/dashboard/quizzes/templates` propose désormais :
- Filtres par **catégorie** et **tag**
- Filtre **statut** : "🆕 Jamais utilisés" ou "↩ Déjà utilisés"
- Tri par **popularité**, **nombre de questions** asc/desc
- Badge "✓ Déjà utilisé" sur les cards
- Popularité = nombre de quizz créés à partir de ce template (tous users
  cumulés)

## 7. V3.H — Timer par question

Le champ `timerSeconds` (déjà existant) est désormais utilisé en player :

- **LIVE_MANUAL** : timer synchronisé via SSE+polling. `questionStartedAtMs`
  est diffusé à l'ouverture de chaque question — tous les joueurs voient le
  même décompte
- **SCHEDULED / autres modes** : timer local au téléphone, démarre au mount
  du composant (chaque question a son propre décompte)

Le timer affiche un cercle de progression coloré (vert → orange → rouge)
avec le nombre de secondes restantes. À 0, le texte "Temps écoulé" remplace
le chiffre (le user peut toujours techniquement répondre — pas de blocage
serveur pour rester souple).

## Modifs nav admin

Nouvelle entrée : **🌍 Stats publiques** dans la section Monétisation.

## Sources & idées V4

- Notification "tu as un message non lu" (cloche dans navbar)
- Export CSV des participations
- Stats temps réel pendant un LIVE pour le pilote
- Multi-langue (next-intl)
- Migration uploads vers Cloudflare R2
