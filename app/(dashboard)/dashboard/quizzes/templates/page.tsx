import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import {
  listAllTemplates,
  getUsedTemplateSlugs,
} from "@/lib/quiz/templates-source";
import { createFromTemplateAction } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Templates de quizz",
};

type SearchParams = Promise<{
  tag?: string;
  category?: string;
  sort?: "popular" | "questions_asc" | "questions_desc";
  status?: "all" | "todo" | "done";
}>;

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const allTemplates = await listAllTemplates();
  const usedSlugs = userId ? await getUsedTemplateSlugs(userId) : new Set();

  // Collecte tous les tags et catégories pour les filtres
  const allTags = Array.from(
    new Set(allTemplates.flatMap((t) => t.tags))
  ).sort();
  const allCategories = Array.from(
    new Set(allTemplates.map((t) => t.category))
  ).sort();

  // Application des filtres
  let filtered = allTemplates;
  if (sp.tag) filtered = filtered.filter((t) => t.tags.includes(sp.tag!));
  if (sp.category)
    filtered = filtered.filter((t) => t.category === sp.category);
  if (sp.status === "done")
    filtered = filtered.filter((t) => usedSlugs.has(t.slug));
  if (sp.status === "todo")
    filtered = filtered.filter((t) => !usedSlugs.has(t.slug));

  // Tri
  if (sp.sort === "popular") {
    filtered = [...filtered].sort((a, b) => b.popularity - a.popularity);
  } else if (sp.sort === "questions_asc") {
    filtered = [...filtered].sort((a, b) => a.questionsCount - b.questionsCount);
  } else if (sp.sort === "questions_desc") {
    filtered = [...filtered].sort((a, b) => b.questionsCount - a.questionsCount);
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/quizzes"
          className="hover:text-[var(--color-violet-primary)]"
        >
          Mes quizz
        </Link>
        <span>›</span>
        <span>Templates</span>
      </div>

      <header>
        <h1
          className="font-display text-3xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          ✨ Templates de quizz
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Démarre vite à partir d'un modèle. Tu pourras tout modifier après
          (titre, questions, photos, lots, couleurs).
        </p>
      </header>

      {/* Barre de filtres */}
      <div className="rounded-2xl bg-white border p-4 flex flex-col gap-3">
        <FilterRow
          label="🎨 Catégorie"
          options={allCategories.map((c) => ({ value: c, label: c }))}
          current={sp.category ?? null}
          paramName="category"
          searchParams={sp}
        />
        {allTags.length > 0 && (
          <FilterRow
            label="🏷️ Tag"
            options={allTags.map((t) => ({ value: t, label: t }))}
            current={sp.tag ?? null}
            paramName="tag"
            searchParams={sp}
          />
        )}
        {userId && (
          <FilterRow
            label="✓ Statut"
            options={[
              { value: "todo", label: "🆕 Jamais utilisés" },
              { value: "done", label: "↩ Déjà utilisés" },
            ]}
            current={sp.status ?? null}
            paramName="status"
            searchParams={sp}
          />
        )}
        <FilterRow
          label="🔀 Tri"
          options={[
            { value: "popular", label: "Populaires" },
            { value: "questions_asc", label: "Moins de questions" },
            { value: "questions_desc", label: "Plus de questions" },
          ]}
          current={sp.sort ?? null}
          paramName="sort"
          searchParams={sp}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} template{filtered.length > 1 ? "s" : ""}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => {
          const used = usedSlugs.has(tpl.slug);
          return (
            <Card
              key={tpl.slug}
              className="flex flex-col hover:shadow-lg transition-shadow relative"
              style={{
                borderTopWidth: 4,
                borderTopColor: tpl.themeColor,
                borderTopStyle: "solid",
              }}
            >
              {used && (
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
                  ✓ Déjà utilisé
                </span>
              )}
              <CardHeader>
                <div className="text-4xl mb-2" aria-hidden>
                  {tpl.emoji}
                </div>
                <CardTitle className="font-display tracking-wide">
                  {tpl.title}
                </CardTitle>
                <CardDescription>{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {tpl.questionsCount} questions ·{" "}
                    {tpl.popularity > 0
                      ? `${tpl.popularity} utilisation${tpl.popularity > 1 ? "s" : ""}`
                      : "Tout nouveau"}
                  </p>
                  {tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tpl.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-[var(--color-violet-primary)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <form action={createFromTemplateAction}>
                  <input type="hidden" name="slug" value={tpl.slug} />
                  <Button
                    type="submit"
                    className="w-full font-bold"
                    style={{
                      backgroundColor: tpl.themeColor,
                      color: "white",
                    }}
                  >
                    ✨ Utiliser ce template
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="text-muted-foreground">
            Aucun template ne correspond aux filtres.
          </p>
        </div>
      )}

      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/dashboard/quizzes/new">
            Créer un quizz vierge à la place
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  options,
  current,
  paramName,
  searchParams,
}: {
  label: string;
  options: { value: string; label: string }[];
  current: string | null;
  paramName: string;
  searchParams: Record<string, string | undefined>;
}) {
  // Construit l'URL en gardant les autres filtres + togglant celui-ci
  function urlFor(value: string | null) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(searchParams)) {
      if (k !== paramName && v) next[k] = v;
    }
    if (value !== null) next[paramName] = value;
    const qs = new URLSearchParams(next).toString();
    return `/dashboard/quizzes/templates${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold min-w-[100px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={urlFor(null)}
          className={`px-2.5 py-1 rounded-full text-xs ${
            current === null
              ? "bg-[var(--color-violet-primary)] text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Tous
        </Link>
        {options.map((o) => (
          <Link
            key={o.value}
            href={urlFor(o.value)}
            className={`px-2.5 py-1 rounded-full text-xs ${
              current === o.value
                ? "bg-[var(--color-violet-primary)] text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
