import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TemplateForm } from "@/components/admin/template-form";
import { CloneHardcodedButton } from "@/components/admin/clone-hardcoded-button";
import { QUIZ_TEMPLATES } from "@/lib/quiz/templates";

export const metadata: Metadata = {
  title: "Admin · Templates",
};

export default async function AdminTemplatesPage() {
  await requireAdmin();

  // V47.3 : on liste DB + hardcoded fusionnés (DB prioritaire).
  // Pour les hardcoded NON encore en DB, on propose un bouton "Cloner en BDD"
  // qui les copie pour qu'ils deviennent éditables.
  const dbTemplates = await prisma.quizTemplate.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
  const hardcodedNotInDb = QUIZ_TEMPLATES.filter((t) => !dbSlugs.has(t.slug));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          📝 Templates de quizz
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Crée/édite les modèles proposés aux utilisateurs au moment de la
          création d&apos;un quizz. Les 6 templates d&apos;origine sont
          hardcodés dans le code — clone-les en BDD pour pouvoir les modifier.
        </p>
      </header>

      <details
        open={dbTemplates.length === 0 && hardcodedNotInDb.length === 0}
        className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4"
      >
        <summary className="cursor-pointer font-semibold text-sm">
          + Créer un nouveau template
        </summary>
        <div className="mt-4">
          <TemplateForm />
        </div>
      </details>

      {/* V47.3 — Hardcoded encore non clonés : invitation à les cloner */}
      {hardcodedNotInDb.length > 0 && (
        <section className="rounded-2xl border-2 p-5" style={{ borderColor: "var(--color-gold)", background: "rgba(245,158,11,0.05)" }}>
          <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-2">
            📋 Templates d&apos;origine (hardcodés)
          </h2>
          <p className="text-xs text-[var(--color-lavender-2)] opacity-80 mb-4">
            Ces {hardcodedNotInDb.length} templates sont définis en dur dans
            le code source. Pour pouvoir les <strong>modifier</strong> (titre,
            description, questions, etc.), commence par les <strong>cloner
            en BDD</strong>. Tu pourras ensuite les éditer comme n&apos;importe
            quel template BDD ci-dessous.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {hardcodedNotInDb.map((t) => (
              <div
                key={t.slug}
                className="rounded-xl bg-[var(--color-night)] border border-[rgba(167,139,250,0.15)] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {t.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: "var(--color-lavender)" }}>
                      {t.title}
                    </p>
                    <p className="text-xs opacity-70">
                      slug : <code className="font-mono">{t.slug}</code> · {t.questions.length} question{t.questions.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-xs opacity-80 line-clamp-2">
                  {t.description}
                </p>
                <CloneHardcodedButton slug={t.slug} title={t.title} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Templates BDD éditables */}
      <section>
        <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-3">
          ✏️ Templates en BDD ({dbTemplates.length})
        </h2>
        <div className="flex flex-col gap-3">
          {dbTemplates.length === 0 ? (
            <p className="text-sm opacity-60 italic text-center py-6">
              Aucun template en BDD pour l&apos;instant. Clone un template
              d&apos;origine ci-dessus, ou crée-en un nouveau via le formulaire.
            </p>
          ) : (
            dbTemplates.map((t) => (
              <TemplateForm
                key={t.id}
                template={{
                  id: t.id,
                  slug: t.slug,
                  title: t.title,
                  description: t.description,
                  category: t.category,
                  theme: t.theme,
                  tags: t.tags,
                  coverImageUrl: t.coverImageUrl,
                  displayOrder: t.displayOrder,
                  isActive: t.isActive,
                  questions: t.questions,
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
