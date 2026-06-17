# Format CSV — Import banque de quizz

Ce document décrit le format CSV attendu pour importer en masse des quizz dans la banque publique côté admin.

**Fichier template** : [`/public/templates/banque-quizz-template.csv`](../public/templates/banque-quizz-template.csv) (disponible aussi sur `https://kuizard.com/templates/banque-quizz-template.csv`).

## Principe

- **Une ligne = une question.**
- Plusieurs lignes consécutives avec le même `quiz_title` constituent **un seul quiz** avec toutes ses questions.
- Le parser détecte un nouveau quiz quand le `quiz_title` change.
- L'encodage attendu est **UTF-8** (avec ou sans BOM).
- Les valeurs avec virgule, retour à la ligne ou guillemet doivent être encadrées par des `"` (CSV standard RFC 4180).
- Pour échapper un `"` dans une valeur quotée : doubler le guillemet (`""`).

## Colonnes du CSV

### Métadonnées du quiz (répétées sur chaque ligne du même quiz)

| Colonne | Type | Requis | Description |
|---|---|---|---|
| `quiz_title` | string | ✅ | Titre du quiz (3-200 chars). Toutes les lignes d'un même quiz partagent ce titre. |
| `quiz_description` | string | ⭕ | Description courte (max 1000 chars). |
| `quiz_cover_url` | URL | ⭕ | URL d'une image de couverture (R2/Cloudinary/etc.). Laisser vide pour aucune. |
| `quiz_color` | hex | ⭕ | Couleur principale du quiz (ex: `#7c3aed`). Défaut : violet Kuizard. |
| `quiz_mode` | enum | ⭕ | `LIVE_MANUAL` (mode pilotage) ou `SCHEDULED` (créneau fixe). Défaut : `LIVE_MANUAL`. |
| `quiz_language` | code | ⭕ | Code langue 2 lettres : `fr`, `en`, `es`, `it`, `de`, `pt`, `ru`, `zh`. Défaut : `fr`. |
| `library_description` | string | ⭕ | Description affichée aux users dans le browser library. |
| `library_tags` | string | ⭕ | Tags séparés par des virgules (ex: `mariage,couple,romantique`). Min 3 chars / tag. |

### Question (1 ligne = 1 question)

| Colonne | Type | Requis | Description |
|---|---|---|---|
| `question_order` | int | ✅ | Position de la question dans le quiz (1, 2, 3…). |
| `question_type` | enum | ✅ | `SINGLE_CHOICE` (1 bonne réponse), `MULTIPLE_CHOICE` (plusieurs bonnes), `TRUE_FALSE` (vrai/faux), `TEXT` (réponse libre). |
| `question_text` | string | ✅ | Le texte de la question (3-500 chars). |
| `question_timer_sec` | int | ⭕ | Temps imparti en secondes (0 ou vide = pas de timer). |
| `question_points` | int | ⭕ | Points rapportés si bonne réponse (défaut 1, max 10). |
| `question_image_url` | URL | ⭕ | Image illustrant la question. |

### Options de réponse (jusqu'à 4 par question)

Pour chaque option `N` (de 1 à 4) :
- `option_N` (string) — texte de la réponse
- `option_N_correct` (0 ou 1) — 1 si c'est une bonne réponse

**Selon le type de question :**

- `SINGLE_CHOICE` — au moins 2 options, **exactement 1** marquée `option_N_correct = 1`.
- `MULTIPLE_CHOICE` — au moins 2 options, **1 ou plusieurs** marquées `option_N_correct = 1`.
- `TRUE_FALSE` — 2 options : `Vrai` et `Faux`. Exactement 1 marquée 1.
- `TEXT` — **aucune option remplie** (toutes vides). Pour les réponses textuelles libres.

## Exemple minimaliste

```csv
quiz_title,quiz_description,quiz_language,library_description,library_tags,question_order,question_type,question_text,option_1,option_1_correct,option_2,option_2_correct
"Mon quiz test","Quizz de démo","fr","Quizz à dupliquer","demo,test",1,"SINGLE_CHOICE","Quelle est la capitale de la France ?","Paris",1,"Lyon",0
```

Toutes les autres colonnes peuvent être absentes ou laissées vides (sauf le bloc question/options qui est obligatoire).

## Pièges classiques

- ❌ Mélanger plusieurs quizz et avoir le **même `quiz_title`** par erreur → le parser pensera que c'est un seul quiz avec toutes les questions cumulées.
- ❌ Oublier de **dédoubler les guillemets** dans une question qui en contient (ex: `Marc dit "wow"` doit s'écrire `"Marc dit ""wow"""`).
- ❌ Mettre `option_N_correct = vrai` au lieu de `1` (le parser n'accepte que `0` et `1`).
- ❌ Importer un fichier en encodage Windows-1252 → les accents seront corrompus. Toujours UTF-8.

## Workflow recommandé

1. Télécharger le template : `https://kuizard.com/templates/banque-quizz-template.csv`
2. L'ouvrir dans Google Sheets / Excel / LibreOffice
3. Remplir tes quizz (1 ligne par question)
4. Exporter en CSV UTF-8
5. Uploader sur `/admin/library/import` (UI à venir au prochain sprint)
6. Le parser créera un quiz par groupe de lignes partageant le même `quiz_title`, marqué `isLibrary=true` automatiquement

## Statut implémentation

- ✅ Template CSV disponible
- ✅ Format documenté
- ⏸ UI upload sur `/admin/library/import` — au prochain sprint
- ⏸ Parser CSV → Quiz + Questions (utilisera la lib `papaparse` qu'on a déjà via shadcn)
