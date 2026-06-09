# i18n — Workflow DeepL

## Setup (une fois)

1. Crée un compte DeepL API Free : https://www.deepl.com/pro-api
2. Récupère ta clé API (finit par `:fx` pour la version Free)
3. Ajoute dans ton `.env` local :
   ```
   DEEPL_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
   ```

## Utilisation

1. Modifie **uniquement** l'objet `fr` dans `lib/i18n/messages.ts` (source de vérité)
2. Lance :
   ```bash
   npm run i18n:translate
   ```
3. Le script :
   - Lit toutes les clés `fr` (string par string)
   - Appelle DeepL pour traduire vers EN/ES/IT/DE/PT/RU/ZH
   - Écrit le résultat dans `lib/i18n/messages-auto.json`
4. Commit les 2 fichiers (`messages.ts` + `messages-auto.json`)

## Comportement au runtime

`lib/i18n/messages.ts` exporte `LOCALES` qui fusionne automatiquement :
- **Manuelles** (objets `fr`, `en`, etc. dans le fichier) : priorité
- **Auto-générées** (`messages-auto.json`) : fallback pour les clés absentes des manuelles

→ Si tu corriges une traduction à la main dans `messages.ts`, c'est elle qui s'affiche.
→ Si tu ajoutes une nouvelle clé en FR, elle est traduite auto au prochain run.

## Quota DeepL Free

- **500 000 caractères / mois** (renouvelés le 1er du mois)
- **+1 000 000 de bonus** sur ton premier mois (offre nouveau compte)
- Vérifie ta consommation : https://www.deepl.com/account/summary

Estimation Kuizard : ~30 000 caractères pour une traduction complète des
clés actuelles × 7 langues = consommation très faible.

## En cas d'erreur

- **456 Quota exceeded** : tu as épuisé ton quota, attends le mois suivant
- **403 Forbidden** : ta clé est invalide ou expirée
- **Pas de DEEPL_API_KEY** : ajoute-la dans `.env`

## Modifier une traduction spécifique

Si DeepL fait une erreur ou si tu veux un ton particulier dans une langue :

1. Trouve la clé dans `messages.ts`
2. Renseigne la valeur manuelle dans la bonne langue
3. Au prochain `npm run i18n:translate`, ta valeur manuelle est conservée
   (le script écrase juste les clés non-renseignées)

## Idées futures

- Ajout d'un système de hash pour ne pas re-traduire les clés inchangées
  (économise du quota DeepL)
- Support de glossaires DeepL (pour imposer le mot "quizz" en FR au lieu de
  "quiz", par exemple)
