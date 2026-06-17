"use client";

import { useActionState, useRef, useState } from "react";

import {
  importLibraryCsvAction,
  type ImportState,
} from "@/lib/actions/admin/import-library";

const INITIAL: ImportState = { ok: false };

export function LibraryCsvImportForm() {
  const [state, action, pending] = useActionState(
    importLibraryCsvAction,
    INITIAL
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      setPreviewText("");
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    setPreviewText(text);
    if (csvInputRef.current) csvInputRef.current.value = text;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Champ caché qui transporte le texte CSV vers la server action.
          On évite l'upload type=file (server actions ne prennent que des
          champs string/blob, et passer le contenu en string simplifie le
          parsing côté serveur). */}
      <input ref={csvInputRef} type="hidden" name="csv" />

      <div className="rounded-xl bg-[rgba(0,0,0,0.25)] border-2 border-dashed border-[rgba(167,139,250,0.3)] p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file"
        />
        <label
          htmlFor="csv-file"
          className="cursor-pointer inline-flex flex-col items-center gap-2"
        >
          <span className="text-4xl">📄</span>
          {fileName ? (
            <>
              <p className="font-semibold text-sm">{fileName}</p>
              <p className="text-xs opacity-60">
                Cliquer pour changer de fichier
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sm">
                Cliquer pour choisir un fichier CSV
              </p>
              <p className="text-xs opacity-60">
                Format : UTF-8, séparateur virgule. Voir le template.
              </p>
            </>
          )}
        </label>
      </div>

      {previewText && (
        <details className="rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(167,139,250,0.15)]">
          <summary className="cursor-pointer text-xs px-3 py-2 opacity-80">
            👁 Aperçu du fichier ({previewText.split("\n").length} lignes)
          </summary>
          <pre className="text-[10px] overflow-x-auto p-3 max-h-[200px] font-mono">
            {previewText.split("\n").slice(0, 20).join("\n")}
            {previewText.split("\n").length > 20 && "\n…"}
          </pre>
        </details>
      )}

      {state.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            state.ok
              ? "bg-green-900/30 border border-green-700/40 text-green-200"
              : "bg-red-900/30 border border-red-700/40 text-red-200"
          }`}
        >
          <p className="font-semibold">{state.message}</p>
          {state.summary && (
            <div className="mt-2 text-xs space-y-1">
              <p>
                ✓ {state.summary.quizzesCreated} quiz créés ·{" "}
                {state.summary.questionsCreated} questions
              </p>
              {state.summary.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">
                    ⚠️ {state.summary.errors.length} avertissement(s)
                  </summary>
                  <ul className="mt-2 list-disc list-inside opacity-90">
                    {state.summary.errors.slice(0, 20).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {state.summary.errors.length > 20 && (
                      <li className="italic opacity-70">
                        … et {state.summary.errors.length - 20} de plus
                      </li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !fileName}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Import en cours…" : "📥 Importer dans la banque"}
        </button>
      </div>
    </form>
  );
}
