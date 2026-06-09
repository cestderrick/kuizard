# i18n — Workflow pour modifier ou ajouter du texte FR

## TL;DR — process en 4 étapes

1. **Modifier ou ajouter le FR** dans `lib/i18n/messages.ts`
2. **Lancer la traduction auto** : `npm run i18n:translate`
3. **Commit & push** les 2 fichiers (`messages.ts` + `messages-auto.json`)
4. **Déployer** sur le VPS comme d'hab

---

## Cas 1 — Modifier un texte existant

Tu veux changer "Mes quizz récents" en "Mes derniers quizz" sur la home dashboard.

### Étape 1 — trouve la clé

Ouvre `lib/i18n/messages.ts`, recherche le texte FR actuel :
```ts
recent_quizzes_title: "Mes quizz récents",  // ← ici, dans le bloc fr.dashboard
```

### Étape 2 — modifie la valeur en français

```ts
recent_quizzes_title: "Mes derniers quizz",
```

### Étape 3 — re-traduit auto

Dans ton terminal local (dossier kuizard) :
```bash
npm run i18n:translate
```

DeepL met à jour le fichier `lib/i18n/messages-auto.json` avec les nouvelles traductions pour EN/ES/IT/DE/PT/RU/ZH.

### Étape 4 — déploie

```bash
git add -A
git commit -m "tweak: rename recent quizzes title"
git push

# Sur le VPS
git pull
npm run build
pm2 restart kuizard-app
```

---

## Cas 2 — Ajouter une nouvelle clé (texte nouveau)

Tu veux ajouter un bouton "Importer un quizz" sur la page Mes quizz.

### Étape 1 — ajoute la clé dans le type

Dans `lib/i18n/messages.ts`, trouve le bloc `quizzes?: {...}` et ajoute la nouvelle propriété :
```ts
quizzes?: {
  // …existant…
  import_button?: string;
};
```

(Marquer `?` rend la clé optionnelle, comme ça les langues sans la trad ne plantent pas.)

### Étape 2 — ajoute la valeur FR

Dans le bloc `fr.quizzes` :
```ts
quizzes: {
  // …existant…
  import_button: "Importer un quizz",
},
```

### Étape 3 — utilise la clé dans ton composant

Dans le `.tsx` concerné :
```tsx
const messages = await getMessages();
const t = messages.quizzes;
// …
<Button>{t?.import_button ?? "Importer un quizz"}</Button>
```

(Le `?? "Importer un quizz"` est un fallback si la clé n'existe pas.)

### Étape 4 — traduit + déploie

```bash
npm run i18n:translate
git add -A
git commit -m "feat: import quiz button"
git push
# VPS : git pull && npm run build && pm2 restart kuizard-app
```

---

## Cas 3 — Override une traduction auto qui n'est pas bonne

DeepL a traduit "Mes quizz" en "My quizzes" mais tu préfères "My quiz collection".

### Étape — ajoute la valeur dans le bloc en

Dans `lib/i18n/messages.ts`, trouve le bloc `en: Messages = {...}` (ou le sous-objet pertinent) et ajoute la clé avec ta valeur manuelle :
```ts
const en: Messages = {
  // …
  quizzes: {
    page_title: "My quiz collection",  // override DeepL
    // les autres clés restent traduites par DeepL automatiquement
  },
};
```

Le système fusionne automatiquement : tes valeurs manuelles ont priorité, DeepL remplit le reste.

Puis déploie (pas besoin de re-runner DeepL).

---

## Cas 4 — Ajouter une nouvelle langue

Tu veux ajouter le néerlandais (`nl`).

### Étape 1 — ajoute le code

Dans `lib/i18n/messages.ts`, étend le type `Locale` :
```ts
export type Locale = "fr" | "en" | "it" | "de" | "es" | "pt" | "ru" | "zh" | "nl";
```

Ajoute dans `SUPPORTED_LOCALES` :
```ts
{ value: "nl", label: "Nederlands", flag: "🇳🇱" },
```

Ajoute dans `LOCALES` :
```ts
nl: mergeDeep(MANUAL_LOCALES.nl, AUTO.nl),
```

Ajoute un objet `MANUAL_LOCALES.nl` minimal (juste la structure, traductions vides — DeepL les remplit) :
```ts
const nl: Messages = {
  nav: { home: "Home", dashboard: "Dashboard", /* … */ },
  // …
};
```

### Étape 2 — mappe DeepL

Dans `scripts/translate-i18n.ts` :
```ts
const DEEPL_LANG: Record<string, string> = {
  // …
  nl: "NL",
};
```

### Étape 3 — traduit + déploie

```bash
npm run i18n:translate
git add -A && git commit -m "feat: add Dutch language" && git push
```

---

## Recap visuel

```
┌─────────────────────────────────────────────────────┐
│   lib/i18n/messages.ts        ← Source de vérité    │
│   (tu modifies SEULEMENT le FR ici)                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  │  npm run i18n:translate
                  ▼
┌─────────────────────────────────────────────────────┐
│   lib/i18n/messages-auto.json  ← Généré par DeepL   │
│   (NE PAS éditer à la main)                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼   au runtime, fusion :
┌─────────────────────────────────────────────────────┐
│   manuel (messages.ts)  >  auto (json)              │
│   → ton site affiche le bon texte selon la locale   │
└─────────────────────────────────────────────────────┘
```

## Tips

- **Ne touche jamais à `messages-auto.json` à la main** — il est régénéré à chaque run
- **DeepL préserve les `{variables}` `{name}`** — tu peux les utiliser sans crainte
- **Si une chaîne contient du HTML, ne le passe pas à DeepL** — fais une trad manuelle
- **DeepL ne traduit pas les emojis** — tu peux les laisser dans le FR, ils sont conservés
- **Crédit gratuit : 500k/mois** — largement suffisant pour Kuizard
- **Pour bypasser DeepL temporairement** : édite directement `messages-auto.json` (mais sera écrasé au prochain run)
