// =============================================
// Script de traduction auto via DeepL API Free
// =============================================
//
// Usage :
//   1. Créer un compte DeepL Free → https://www.deepl.com/pro-api
//   2. Coller la clé dans .env :  DEEPL_API_KEY="xxx:fx"
//   3. Lancer :  npm run i18n:translate
//
// Le script :
// - Lit l'objet `fr` (source de vérité) dans lib/i18n/messages.ts
// - Pour chaque autre langue, appelle DeepL pour traduire chaque chaîne
// - Génère un fichier lib/i18n/messages-auto.ts avec toutes les traductions
// - Préserve les substitutions {var} (DeepL respecte les placeholders)
//
// IMPORTANT : ce script ne touche PAS `fr` dans messages.ts. Si tu veux
// override une traduction auto, modifie directement messages.ts pour cette
// langue/clé et le script la respectera au prochain run (via le système de
// hash, à venir si tu veux).

import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

import { LOCALES, SUPPORTED_LOCALES } from "../lib/i18n/messages";

// Fallback : lire DEEPL_API_KEY depuis .env si Node ne l'a pas chargée
async function loadEnvFallback(): Promise<void> {
  if (process.env.DEEPL_API_KEY) return;
  try {
    const envFile = await readFile(
      path.join(process.cwd(), ".env"),
      "utf-8"
    );
    for (const line of envFile.split("\n")) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n\r]*)"?/i);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // pas de .env trouvé, on tentera quand même
  }
}

const DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate";
// DEEPL_KEY lu dans main() après chargement éventuel du .env
let DEEPL_KEY: string | undefined;

// Mapping des locales Kuizard → codes DeepL
const DEEPL_LANG: Record<string, string> = {
  fr: "FR",
  en: "EN-GB",
  es: "ES",
  it: "IT",
  de: "DE",
  pt: "PT-PT",
  ru: "RU",
  zh: "ZH",
};

type Dict = Record<string, unknown>;

async function translateBatch(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  if (!DEEPL_KEY) {
    throw new Error("DEEPL_API_KEY manquant dans le .env");
  }
  // DeepL accepte un array de texts en query string, mais on poste en form data
  const body = new URLSearchParams();
  body.append("source_lang", "FR");
  body.append("target_lang", targetLang);
  body.append("preserve_formatting", "1");
  // tag_handling=xml empêche DeepL de traduire les balises {var}, mais comme
  // DeepL ne reconnaît pas nativement {xxx}, on convertit en <ph id="xxx"/>
  // puis on remet à la fin. Approche plus simple ici : on garde le texte
  // tel quel, DeepL préserve généralement les placeholders {var}.
  for (const t of texts) body.append("text", t);

  const res = await fetch(DEEPL_FREE_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL ${res.status} : ${errText}`);
  }
  const data = (await res.json()) as {
    translations: { text: string; detected_source_language: string }[];
  };
  return data.translations.map((t) => t.text);
}

/**
 * Flatten un objet imbriqué → array de paires [chemin, valeur]
 */
function flatten(obj: Dict, prefix = ""): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      out.push([key, v]);
    } else if (typeof v === "object" && v !== null) {
      out.push(...flatten(v as Dict, key));
    }
  }
  return out;
}

/**
 * Reconstruit un objet imbriqué à partir d'array [chemin, valeur]
 */
function unflatten(pairs: Array<[string, string]>): Dict {
  const root: Dict = {};
  for (const [key, value] of pairs) {
    const parts = key.split(".");
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cursor[p] || typeof cursor[p] !== "object")
        cursor[p] = {} as Dict;
      cursor = cursor[p] as Dict;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return root;
}

async function main() {
  console.log("🌍 Traduction i18n via DeepL");

  // Charge .env si Node ne l'a pas fait
  await loadEnvFallback();
  DEEPL_KEY = process.env.DEEPL_API_KEY;
  if (!DEEPL_KEY) {
    console.error("❌ DEEPL_API_KEY manquant dans le .env");
    console.error("   Ajoute une ligne :  DEEPL_API_KEY=\"ta-cle-ici:fx\"");
    process.exit(1);
  }
  console.log(`  → clé DeepL OK (finit par "${DEEPL_KEY.slice(-3)}")`);

  // CLI flag : --force pour retraduire TOUT, sinon diff intelligent
  const forceAll = process.argv.includes("--force");
  if (forceAll) {
    console.log("  ⚠ --force : retraduction complète (consomme la quota DeepL)");
  }

  // Source = fr (vérité)
  const sourcePairs = flatten(LOCALES.fr as unknown as Dict);
  console.log(`  → ${sourcePairs.length} clés source (fr)`);

  // Charge l'existant pour faire un diff (économie de quota DeepL)
  const filePath = path.join(
    process.cwd(),
    "lib",
    "i18n",
    "messages-auto.json"
  );
  let existing: Record<string, Dict> = {};
  try {
    const raw = await readFile(filePath, "utf-8");
    existing = JSON.parse(raw);
  } catch {
    console.log("  → pas de messages-auto.json existant — première run");
  }

  // Map des FR existants pour comparer aux FR actuels
  const existingFrMap = new Map<string, string>(
    existing.fr ? flatten(existing.fr as Dict) : []
  );
  const sourceMap = new Map(sourcePairs);

  // Clés à retraduire = clés nouvelles OU clés dont la valeur FR a changé
  const changedKeys = forceAll
    ? new Set(sourcePairs.map(([k]) => k))
    : new Set(
        sourcePairs
          .filter(([k, v]) => existingFrMap.get(k) !== v)
          .map(([k]) => k)
      );
  console.log(
    `  → ${changedKeys.size} clé(s) ${forceAll ? "à (re)traduire" : "nouvelle(s) ou modifiée(s)"}`
  );
  if (changedKeys.size === 0 && !forceAll) {
    console.log("  ✅ Aucun changement détecté côté FR — rien à traduire.");
    console.log("     (pour forcer une retraduction complète : npm run i18n:translate -- --force)");
    return;
  }

  const targetLocales = SUPPORTED_LOCALES
    .map((l) => l.value)
    .filter((l) => l !== "fr");

  const result: Record<string, Dict> = {};
  result.fr = LOCALES.fr as unknown as Dict;

  for (const lang of targetLocales) {
    const deeplCode = DEEPL_LANG[lang];
    if (!deeplCode) {
      console.warn(`  ⚠ Pas de mapping DeepL pour ${lang}, skipped`);
      result[lang] = (existing[lang] as Dict) ?? {};
      continue;
    }

    // Pairs existants pour cette langue (toutes les clés déjà traduites)
    const existingLangMap = new Map<string, string>(
      existing[lang] ? flatten(existing[lang] as Dict) : []
    );

    // On ne traduit que les clés à retraduire ET on garde les autres telles quelles
    const toTranslatePairs = sourcePairs.filter(([k]) =>
      changedKeys.has(k)
    );
    console.log(
      `  → ${lang} (${deeplCode}) : ${toTranslatePairs.length} clé(s) à traduire`
    );

    let translated: string[] = [];
    if (toTranslatePairs.length > 0) {
      const texts = toTranslatePairs.map(([, v]) => v);
      for (let i = 0; i < texts.length; i += 50) {
        const batch = texts.slice(i, i + 50);
        const out = await translateBatch(batch, deeplCode);
        translated.push(...out);
      }
    }

    // Fusionne : pour chaque clé source FR, on prend la nouvelle trad si on
    // vient de la calculer, sinon on garde l'ancienne trad existante.
    const newTransMap = new Map<string, string>(
      toTranslatePairs.map(([k], idx) => [k, translated[idx]])
    );
    const finalPairs: Array<[string, string]> = sourcePairs.map(([k]) => [
      k,
      newTransMap.get(k) ?? existingLangMap.get(k) ?? sourceMap.get(k) ?? "",
    ]);
    result[lang] = unflatten(finalPairs);
  }

  await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ Écrit dans ${filePath}`);
  console.log(`\n💡 Pense à committer messages-auto.json et déployer.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
