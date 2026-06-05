"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { UploadState } from "@/lib/actions/upload";

const initial: UploadState = { ok: false };

type Props = {
  currentUrl: string | null;
  /** Server action d'upload */
  uploadAction: (
    prev: UploadState,
    formData: FormData
  ) => Promise<UploadState>;
  /** Server action de suppression (form classique, pas useActionState) */
  removeAction: (formData: FormData) => Promise<void>;
  /** Champs cachés à inclure dans les forms (quizId, questionId, etc.) */
  hiddenFields: Record<string, string>;
  /** Texte à afficher quand il n'y a pas d'image */
  emptyLabel?: string;
  /** Hauteur de l'aperçu en CSS (par défaut 200px) */
  previewHeightClass?: string;
};

export function ImageUploader({
  currentUrl,
  uploadAction,
  removeAction,
  hiddenFields,
  emptyLabel = "Glisse une image ou clique pour parcourir",
  previewHeightClass = "h-48",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);

  const [state, formAction, isPending] = useActionState(uploadAction, initial);

  // Lorsque l'action a renvoyé une nouvelle URL, on met à jour l'aperçu
  if (state.ok && state.url && state.url !== previewUrl) {
    setPreviewUrl(state.url);
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      // Aperçu instantané côté client
      const file = e.target.files[0];
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      // Soumettre la form (upload)
      formRef.current?.requestSubmit();
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0 && fileInputRef.current) {
      // Affecter les fichiers à l'input et déclencher onChange
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form ref={formRef} action={formAction} className="contents">
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={triggerFilePicker}
          className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${previewHeightClass}`}
          style={{
            borderColor: isDragging
              ? "var(--color-violet-primary)"
              : previewUrl
              ? "transparent"
              : "var(--color-violet-light)",
            backgroundColor: isDragging
              ? "rgba(124,58,237,0.05)"
              : previewUrl
              ? "transparent"
              : "var(--color-lavender)",
          }}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 pointer-events-none">
              <span className="text-4xl" aria-hidden>
                🖼️
              </span>
              <span className="text-sm font-medium text-[var(--color-violet-primary)]">
                {emptyLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP — max 8 Mo
              </span>
            </div>
          )}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold pointer-events-none">
              Téléversement…
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileChange}
          className="hidden"
        />
      </form>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFilePicker}
          disabled={isPending}
        >
          {previewUrl ? "Changer l'image" : "Choisir une image"}
        </Button>
        {previewUrl && (
          <form action={removeAction}>
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setPreviewUrl(null)}
            >
              Supprimer
            </Button>
          </form>
        )}
      </div>

      {/* Disclaimer légal photos */}
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold mb-1">
          ⚠️ Important — droit à l'image
        </p>
        <p>
          Kuizard et Projiat ne peuvent pas être tenus responsables des photos
          ajoutées. Assure-toi que ton public et les personnes présentes sur
          les photos sont d'accord. Les photos sont stockées de manière
          sécurisée pendant <strong>1 mois après la fin du quizz</strong> puis
          supprimées automatiquement.
        </p>
      </div>
    </div>
  );
}
