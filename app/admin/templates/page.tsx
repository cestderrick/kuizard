import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TemplateForm } from "@/components/admin/template-form";

export const metadata: Metadata = {
  title: "Admin · Templates",
};

export default async function AdminTemplatesPage() {
  await requireAdmin();

  const templates = await prisma.quizTemplate.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          📝 Templates de quizz
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Crée/édite les modèles proposés aux utilisateurs au moment de la
          création d'un quizz. Les templates inactifs sont cachés des users.
        </p>
      </header>

      <details
        open={templates.length === 0}
        className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4"
      >
        <summary className="cursor-pointer font-semibold text-sm">
          + Créer un nouveau template
        </summary>
        <div className="mt-4">
          <TemplateForm />
        </div>
      </details>

      <div className="flex flex-col gap-3">
        {templates.length === 0 ? (
          <p className="text-sm opacity-60 italic text-center py-6">
            Aucun template dans la BDD. Les 6 templates hardcodés sont encore
            disponibles côté user — crée-en ici pour migrer.
          </p>
        ) : (
          templates.map((t) => (
            <TemplateForm
              key={t.id}
              template={{
                id: t.id,
                slug: t.slug,
                title: t.title,
                description: t.description,
                category: t.category,
                coverImageUrl: t.coverImageUrl,
                displayOrder: t.displayOrder,
                isActive: t.isActive,
                questions: t.questions,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
