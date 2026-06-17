import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { LibraryCsvImportForm } from "@/components/admin/library-csv-import-form";

export const metadata: Metadata = {
  title: "Admin · Import CSV banque",
};

export default async function AdminLibraryImportPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header>
        <Link
          href="/admin/library"
          className="text-sm text-[var(--color-lavender-2)] hover:text-[var(--color-gold)]"
        >
          ← Banque de quizz
        </Link>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)] mt-3">
          📥 Import CSV banque de quizz
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Crée plusieurs quizz d'un coup à partir d'un fichier CSV. Chaque
          quizz importé est automatiquement marqué <code>isLibrary=true</code>{" "}
          et publié.
        </p>
      </header>

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[var(--color-gold)]/30 p-5">
        <h2 className="font-display text-lg tracking-wide mb-3">
          1. Télécharge le template
        </h2>
        <p className="text-sm opacity-80 mb-3">
          Format CSV avec toutes les colonnes attendues + 2 exemples (quizz
          mariage + quizz bar).
        </p>
        <a
          href="/templates/banque-quizz-template.csv"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-violet-primary)] text-white text-sm font-semibold hover:opacity-90"
        >
          ⬇️ Télécharger banque-quizz-template.csv
        </a>
      </section>

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5">
        <h2 className="font-display text-lg tracking-wide mb-3">
          2. Remplis ton CSV puis upload
        </h2>
        <p className="text-sm opacity-80 mb-4">
          1 ligne = 1 question. Plusieurs lignes consécutives avec le même{" "}
          <code>quiz_title</code> = 1 seul quiz avec toutes ses questions.{" "}
          <Link
            href="https://github.com/cestderrick/kuizard/blob/main/docs/csv-import-banque-format.md"
            target="_blank"
            className="underline text-[var(--color-gold-light)]"
          >
            Voir la doc complète
          </Link>
          .
        </p>
        <LibraryCsvImportForm />
      </section>

      <section className="rounded-xl bg-[rgba(245,158,11,0.08)] border border-[var(--color-gold)]/20 p-4 text-xs space-y-1">
        <p className="font-semibold">⚠️ Pièges classiques</p>
        <ul className="list-disc list-inside opacity-80">
          <li>
            Encodage <strong>UTF-8</strong> obligatoire (sinon les accents
            sortent cassés).
          </li>
          <li>
            Pour échapper un guillemet dans une cellule quotée : doubler le
            guillemet : <code>&quot;Marc dit &quot;&quot;wow&quot;&quot;&quot;</code>.
          </li>
          <li>
            Valeur <code>option_N_correct</code> : <strong>0 ou 1</strong>{" "}
            (pas "vrai"/"faux").
          </li>
          <li>
            Pour les questions <code>TEXT</code>, laisser les colonnes{" "}
            <code>option_*</code> vides.
          </li>
        </ul>
      </section>
    </div>
  );
}
