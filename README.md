# Kuizard

> **Kuizard, pour un moment magique** ✨

Plateforme web de création de quizz personnalisés pour événements (mariages, anniversaires, EVJF, baby-showers…) et pour des bars/hôtels/pros (abonnement, mode live).

---

## Stack technique

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **PostgreSQL 16** + Prisma ORM
- **Auth.js v5** (NextAuth) pour l'authentification
- **Stripe** pour les paiements (one-shot + abonnements + codes promos)
- **Cloudflare R2** pour le stockage des images (à venir)
- **Server-Sent Events** pour le temps réel admin/joueurs

## Démarrer en local

### Pré-requis

- Node.js 20+ et npm
- Docker Desktop (pour PostgreSQL)
- Git

### Installation

```bash
# 1. Cloner et installer
git clone git@github.com:tonusername/kuizard.git
cd kuizard
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Édite .env selon tes besoins (Stripe, Resend, etc. peuvent rester vides au démarrage)

# 3. Lancer PostgreSQL
docker compose up -d

# 4. Initialiser la base et générer le client Prisma
npx prisma migrate dev --name init
npx prisma generate

# 5. Lancer le dev server
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le dev server (hot reload) |
| `npm run build` | Build de prod |
| `npm run start` | Lance le build de prod |
| `npm run lint` | Lint ESLint |
| `docker compose up -d` | Démarre PostgreSQL |
| `docker compose down` | Arrête PostgreSQL |
| `docker compose down -v` | Arrête + supprime les données (reset complet) |
| `npx prisma studio` | Ouvre le GUI BDD sur http://localhost:5555 |
| `npx prisma migrate dev --name <nom>` | Crée + applique une migration |
| `npx prisma migrate reset` | Reset complet de la BDD (DEV uniquement) |

## Structure du projet

```
kuizard/
├── app/                 # Pages Next.js (App Router)
├── lib/                 # Utilitaires (Prisma client, helpers)
├── components/          # Composants React partagés (à venir)
│   └── ui/              # Composants shadcn/ui (à venir)
├── prisma/
│   └── schema.prisma    # Schéma BDD
├── public/              # Assets statiques
├── docker-compose.yml   # PostgreSQL local
├── .env                 # Variables d'env (DEV — ne pas committer)
├── .env.example         # Template
└── package.json
```

## Documentation

- Cahier des charges complet : voir le dossier de spécifications partagé
- Charte graphique : voir `charte-graphique-kuizard.html`
- Maquettes des écrans clés : voir `maquettes-kuizard.html`

## Statut

🚧 **En cours de développement** — version 0.1.0

Voir le cahier des charges pour la roadmap détaillée.
