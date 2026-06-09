# SEO — Checklist Kuizard

## ✅ Côté code (déjà fait)

- [x] `sitemap.xml` dynamique multilingue (alternates pour 8 langues)
- [x] `robots.txt` qui bloque /admin, /dashboard, /api, /payment
- [x] Metadata OG + Twitter Card + canonical sur le RootLayout
- [x] Balise `<html lang="...">` dynamique selon la locale du visiteur
- [x] Hreflang dans les metadata alternates.languages
- [x] OG image SVG (1200×630) `/og-image.svg`

## 📋 Côté toi (à faire sur les outils externes)

### Google Search Console
1. Va sur https://search.google.com/search-console
2. **+ Ajouter une propriété** → "Préfixe d'URL" → `https://kuizard.com`
3. Vérifie la propriété (méthode DNS chez Cloudflare le plus rapide : Cloudflare → DNS → ajoute le TXT record que Google te donne)
4. Une fois vérifiée → Sitemaps → soumets `https://kuizard.com/sitemap.xml`
5. Au bout de quelques jours, Google indexera tes pages

### Bing Webmaster Tools
1. https://www.bing.com/webmasters → tu peux importer directement depuis Google Search Console (1 clic)
2. Soumets le sitemap pareil

### Cloudflare — gestion du `.fr`
- Vérifie que `kuizard.fr` redirige bien 301 vers `kuizard.com` (la conf nginx que tu as mise)
- Dans Search Console, ajoute aussi `kuizard.fr` comme propriété → soumets une "Address change" pour transférer l'autorité de domaine

### Open Graph image en PNG (optionnel mais conseillé)
- Le SVG marche sur la plupart des plateformes modernes, mais Facebook / WhatsApp / LinkedIn préfèrent un PNG
- Utilise https://cloudconvert.com/svg-to-png ou un design tool pour exporter `og-image.svg` → `og-image.png` (1200×630)
- Remplace dans `app/layout.tsx` : `"/og-image.svg"` → `"/og-image.png"`

### Schema.org JSON-LD (V8 éventuelle)
- Ajouter un script `<script type="application/ld+json">` sur la home avec le type `WebSite` + `Organization`
- Permet à Google d'afficher des extraits enrichis (rich snippets)

## 🎯 Optimisations rapides à venir

### Performance (Web Vitals)
- Convertir le logo Kuizard en `next/image` au lieu de `<img>` (lazy load + format auto)
- Précharger les fonts critiques (Cinzel) via `<link rel="preload">` (déjà fait par Next.js avec next/font normalement)
- Audit Lighthouse après déploiement pour identifier les goulots

### Contenu
- Crée des **landing pages** dédiées par cas d'usage : `/quizz-mariage`, `/quizz-anniversaire`, `/quizz-bar` → forte valeur SEO long-tail
- Ajoute un **blog** `/blog` avec quelques articles utiles ("Comment animer un EVJF avec un quizz", etc.) → backlinks naturels
- Inscris-toi sur **DigitaleventEU**, **Annuaire des outils mariage**, etc. pour récolter quelques backlinks gratuits

### Backlinks (le plus dur, le plus impactant)
- Profils sur Product Hunt, BetaList, Indie Hackers
- Inscription dans annuaires : annuaire des startups françaises, etc.
- Demande à des blogueurs mariage/EVJF de te tester

## Vérifications après déploiement

1. https://www.opengraph.xyz/ → colle `https://kuizard.com` → vérifie le preview
2. https://cards-dev.twitter.com/validator → vérifie la card Twitter
3. https://search.google.com/test/rich-results → tape ton URL pour voir les enrichissements
4. https://pagespeed.web.dev/ → audit Lighthouse complet, score de perf
