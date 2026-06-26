# V51 — Wiring code promo société

Ce qui est livré ✅ :
- Schema Prisma : `CompanyPromoCode` + `CompanyPromoCodeUsage` + `Quiz.displayCompanyPromoId`
- Helper `lib/promo/company-promo.ts` : `getActiveCompanyPromos`, `getQuizCompanyPromo`, `logCompanyPromoUsage`
- Admin server actions `lib/actions/admin/company-promos.ts` : upsert + delete
- **Page admin** `/admin/company-promos` (CRUD complet, accessible aux admins)
- API route `/api/promo/log` (tracking view/copy)
- Composant joueur `<CompanyPromoBanner>`

## Reste à wirer (2 points)

### 1️⃣ Sur l'éditeur de quiz côté créateur (pro)

Dans le formulaire d'édition de quiz (probablement `components/quiz/quiz-form.tsx` ou `app/(dashboard)/dashboard/quizzes/[id]/edit/page.tsx`), récupère les codes promo actifs du user :

```tsx
import { getActiveCompanyPromos } from "@/lib/promo/company-promo";

// dans le server component:
const userPromos = await getActiveCompanyPromos(quiz.userId);
```

Puis dans le form, ajouter (uniquement si `userPromos.length > 0`) :
```tsx
{userPromos.length > 0 && (
  <div className="flex flex-col gap-2">
    <Label htmlFor="displayCompanyPromoId">
      🎁 Code promo à afficher en bandeau (optionnel)
    </Label>
    <select
      id="displayCompanyPromoId"
      name="displayCompanyPromoId"
      defaultValue={quiz.displayCompanyPromoId ?? ""}
      className="..."
    >
      <option value="">Aucun</option>
      {userPromos.map(p => (
        <option key={p.id} value={p.id}>
          {p.code} — {p.description}
        </option>
      ))}
    </select>
  </div>
)}
```

Et dans le server action `updateQuizMetaAction` (lib/actions/quiz.ts), ajouter le champ au schema Zod + l'update :
```ts
displayCompanyPromoId: z.string().optional().nullable(),
```

### 2️⃣ Sur la page joueur `app/q/[code]/page.tsx`

En haut de la page, juste avant le `<QuizPlayer />` ou `<LivePlayer />` :

```tsx
import { getQuizCompanyPromo } from "@/lib/promo/company-promo";
import { CompanyPromoBanner } from "@/components/promo/company-promo-banner";

// dans le server component, après avoir chargé le quiz :
const promo = await getQuizCompanyPromo(quiz.id);

// dans le rendu (au-dessus de QuizPlayer/LivePlayer) :
{promo && (
  <div className="max-w-xl mx-auto px-4 pt-4">
    <CompanyPromoBanner
      promo={{
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountPercent: promo.discountPercent,
        validUntil: promo.validUntil?.toISOString() ?? null,
      }}
      quizId={quiz.id}
    />
  </div>
)}
```

### 3️⃣ Migration BDD

```bash
cd /var/www/kuizard
npx prisma migrate deploy
# (ou npx prisma migrate dev --name add-company-promos en local)
```

### 4️⃣ Ajouter le lien dans la navbar admin

Dans `app/admin/layout.tsx`, ajouter un AdminNavLink :
```tsx
<AdminNavLink href="/admin/company-promos" label="🎁 Codes promo" />
```

## Workflow utilisateur après wiring

1. **Admin** crée un code promo dans `/admin/company-promos` (choisit la société, le code, etc.)
2. **Créateur pro** voit dans l'édition de son quiz un select "🎁 Code promo à afficher" (uniquement si sa société a un code actif)
3. Il sélectionne le code → enregistre
4. Les **joueurs** voient un bandeau or en haut du quiz : "🎁 50% de réduction avec le code EVENT50" + bouton "📋 Copier"
5. **Tracking** : chaque vue / copie est loggée dans `CompanyPromoCodeUsage`. L'admin peut consulter les stats via le compteur `currentUses` ou requêter `CompanyPromoCodeUsage` pour des stats détaillées.
