# V50 — Wiring Find the score

Le core est livré (schema, lib scoring, 2 composants). Reste 3 wiring manuels.

## 1️⃣ Activer SCORE_GUESS dans le select du formulaire

Fichier : `components/quiz/question-form.tsx`

**Imports** (en haut, après les autres):
```tsx
import { ScoreGuessEditor } from "@/components/quiz/score-guess-editor";
import type { ScoreGuessConfig } from "@/lib/quiz/score-guess";
```

**Activer dans le select** (chercher `disabled` sur les options) :
```tsx
<option value="SCORE_GUESS">⚽ Find the score (foot/rugby)</option>
```

**State séparé pour la config SCORE_GUESS** (dans le composant):
```tsx
const [scoreGuessConfig, setScoreGuessConfig] = useState<ScoreGuessConfig | null>(null);
```

**Hidden input** : remplacer la ligne actuelle
```tsx
<input type="hidden" name="optionsJson" value={JSON.stringify(options)} />
```
par
```tsx
<input
  type="hidden"
  name="optionsJson"
  value={
    type === "SCORE_GUESS"
      ? JSON.stringify(scoreGuessConfig ?? {})
      : JSON.stringify(options)
  }
/>
```

**Render conditionnel** : juste après le `<div>` qui rend les options A/B/C/D, ajouter :
```tsx
{type === "SCORE_GUESS" && (
  <ScoreGuessEditor
    initialJson={question.options}
    onChange={setScoreGuessConfig}
  />
)}
```

Et wrap le block existant avec `{type !== "SCORE_GUESS" && (...)}` pour ne pas rendre les options A/B/C/D quand on est en SCORE_GUESS.

## 2️⃣ Render player dans quiz-player.tsx

Fichier : `components/play/quiz-player.tsx`

**Import** :
```tsx
import { ScoreGuessPlayer } from "@/components/play/score-guess-player";
```

**Render conditionnel** dans le rendu de la question, à côté du switch type :
```tsx
{question.type === "SCORE_GUESS" && (
  <ScoreGuessPlayer
    rawConfig={(question as { rawOptions?: unknown }).rawOptions ?? null}
    initialAnswer={
      answer?.type === "score"
        ? { type: "score", home: answer.home, away: answer.away }
        : null
    }
    onChange={(a) => setAnswer(a)}
    locked={locked}
  />
)}
```

⚠️ Il faut que `quiz-player.tsx` ait accès à `question.options` (la config brute). Si la page parente sanitize les options (`opts` filtrés), il faut **garder la version brute** pour SCORE_GUESS dans une nouvelle prop `rawOptions`.

Dans `app/q/[code]/page.tsx` (sanitizedQuestions ~ligne 154), ajouter :
```tsx
return {
  // ... champs existants
  rawOptions: q.options, // V50 : pour SCORE_GUESS
};
```

## 3️⃣ Migration BDD

```bash
cd /var/www/kuizard
npx prisma migrate deploy
```

(Le `SCORE_GUESS` ajouté à l'enum QuestionType nécessite une migration.)

## 4️⃣ Tester

1. Crée un nouveau quiz, ajoute une question type "⚽ Find the score"
2. Configure : PSG vs OM, score 2-1, exact = 10 pts, paliers (1→6, 3→3, 5→1)
3. Joue le quiz, propose plusieurs scores
4. Vérifie le scoring backend
