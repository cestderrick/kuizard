"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { UploadState } from "@/lib/actions/upload";

type Props = {
  currentUrl: string | null;
  /** Server action d'upload (fichier) */
  uploadAction: (
    prev: UploadState,
    formData: FormData
  ) => Promise<UploadState>;
  /** Server action de suppression */
  removeAction: (formData: FormData) => Promise<void>;
  /** Server action pour set depuis URL externe (optionnel) */
  setFromUrlAction?: (
    prev: UploadState,
    formData: FormData
  ) => Promise<UploadState>;
  /** Champs cachés à passer dans tous les formData (quizId, questionId, etc.) */
  hiddenFields: Record<string, string>;
  /** Texte à afficher quand il n'y a pas d'image */
  emptyLabel?: string;
  /** Hauteur de l'aperçu */
  previewHeightClass?: string;
  /** V43 : grise tout si feature non autorisée par le plan + message de gating */
  disabledMessage?: string | null;
};

/**
 * V43 — Refonte : on n'utilise PLUS de <form> interne (qui créait des forms
 * imbriquées quand utilisé dans QuestionForm → upload silencieusement
 * remplacé par updateQuestionAction côté serveur, image jamais sauvée).
 * À la place on appelle les server actions DIRECTEMENT via useTransition
 * avec un FormData construit manuellement.
 *
 * Bonus : nouvelle tab "URL externe" pour coller un lien d'image au lieu
 * d'uploader un fichier, et grisage si le plan ne permet pas les images.
 */
export function ImageUploader({
  currentUrl,
  uploadAction,
  removeAction,
  setFromUrlAction,
  hiddenFields,
  emptyLabel = "Glisse une image ou clique pour parcourir",
  previewHeightClass = "h-48",
  disabledMessage = null,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlValue, setUrlValue] = useState("");

  const isDisabled = !!disabledMessage;

  function buildHiddenFormData(): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(hiddenFields)) fd.append(k, v);
    return fd;
  }

  function handleFileUpload(file: File) {
    if (isDisabled) return;
    // V43.1 : check taille côté client pour éviter d'envoyer un fichier trop
    // gros au serveur (qui throw, crash le rendering React).
    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        ok: false,
        text: `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 10 Mo.`,
      });
      return;
    }
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    setMessage(null);
    startTransition(async () => {
      const fd = buildHiddenFormData();
      fd.append("file", file);
      // V43.1 : try/catch indispensable — une server action qui throw fait
      // exploser le boundary React et la page entière crash. On capture
      // tout, on affiche l'erreur, et on garde la session vivante.
      try {
        const res = await uploadAction({ ok: false }, fd);
        if (res.ok && res.url) {
          setPreviewUrl(res.url);
          setMessage({ ok: true, text: res.message ?? "Image enregistrée." });
        } else {
          setPreviewUrl(currentUrl);
          setMessage({
            ok: false,
            text: res.message ?? "Erreur lors de l'upload.",
          });
        }
      } catch (err) {
        console.error("[upload] action threw:", err);
        setPreviewUrl(currentUrl);
        setMessage({
          ok: false,
          text:
            err instanceof Error
              ? `Erreur réseau : ${err.message}`
              : "Erreur réseau pendant l'upload. Réessaie.",
        });
      }
    });
  }

  function handleUrlSubmit() {
    if (!setFromUrlAction || isDisabled) return;
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setMessage({ ok: false, text: "Saisis une URL d'image." });
      return;
    }
    setMessage(null);
    setPreviewUrl(trimmed);
    startTransition(async () => {
      const fd = buildHiddenFormData();
      fd.append("imageUrl", trimmed);
      try {
        const res = await setFromUrlAction({ ok: false }, fd);
        if (res.ok && res.url) {
          setPreviewUrl(res.url);
          setUrlValue("");
          setMessage({ ok: true, text: res.message ?? "Image enregistrée." });
        } else {
          setPreviewUrl(currentUrl);
          setMessage({
            ok: false,
            text: res.message ?? "Erreur lors de l'enregistrement.",
          });
        }
      } catch (err) {
        console.error("[setFromUrl] action threw:", err);
        setPreviewUrl(currentUrl);
        setMessage({
          ok: false,
          text:
            err instanceof Error
              ? `Erreur : ${err.message}`
              : "Erreur réseau. Réessaie.",
        });
      }
    });
  }

  function handleRemove() {
    if (isDisabled) return;
    setMessage(null);
    startTransition(async () => {
      const fd = buildHiddenFormData();
      try {
        await removeAction(fd);
        setPreviewUrl(null);
        setMessage({ ok: true, text: "Image supprimée." });
      } catch (err) {
        console.error("[remove] action threw:", err);
        setMessage({
          ok: false,
          text:
            err instanceof Error
              ? `Erreur : ${err.message}`
              : "Erreur lors de la suppression.",
        });
      }
    });
  }

  function triggerFilePicker() {
    if (isDisabled) return;
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
    // Reset l'input pour permettre de re-sélectionner le même fichier
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      handleFileUpload(dt.files[0]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* V43 : Bandeau de gating si feature non incluse dans le plan */}
      {disabledMessage && (
        <div
          className="rounded-lg border-2 p-3 flex items-start gap-2 text-sm"
          style={{
            borderColor: "rgba(245,158,11,0.4)",
            backgroundColor: "rgba(245,158,11,0.08)",
          }}
        >
          <span className="text-lg shrink-0" aria-hidden>🔒</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold" style={{ color: "var(--color-violet-deep)" }}>
              Photos non incluses dans ton plan actuel
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {disabledMessage}
            </p>
            <a
              href="/tarifs"
              className="inline-block mt-2 text-xs font-bold underline-offset-2 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              Voir les plans qui débloquent les photos →
            </a>
          </div>
        </div>
      )}

      {message && (
        <Alert variant={message.ok ? "default" : "destructive"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs Upload / URL externe */}
      {setFromUrlAction && (
        <div
          className="inline-flex rounded-lg border self-start text-xs"
          style={{ borderColor: "var(--color-violet-light, #e9d5ff)" }}
        >
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setMode("upload")}
            className={
              "px-3 py-1.5 rounded-l-lg transition " +
              (mode === "upload"
                ? "bg-[var(--color-violet-primary)] text-white font-bold"
                : "text-muted-foreground hover:bg-zinc-50")
            }
          >
            📤 Uploader
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setMode("url")}
            className={
              "px-3 py-1.5 rounded-r-lg transition " +
              (mode === "url"
                ? "bg-[var(--color-violet-primary)] text-white font-bold"
                : "text-muted-foreground hover:bg-zinc-50")
            }
          >
            🔗 URL externe
          </button>
        </div>
      )}

      {/* Mode Upload : zone drag&drop + preview */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDisabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={triggerFilePicker}
          className={
            "relative rounded-xl border-2 border-dashed overflow-hidden " +
            previewHeightClass +
            " " +
            (isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition-colors")
          }
          style={{
            borderColor: isDragging
              ? "var(--color-violet-primary)"
              : previewUrl
              ? "transparent"
              : "var(--color-violet-light, #c4b5fd)",
            backgroundColor: isDragging
              ? "rgba(124,58,237,0.05)"
              : previewUrl
              ? "transparent"
              : "var(--color-lavender, #f5f0ff)",
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
              <span className="text-4xl" aria-hidden>🖼️</span>
              <span className="text-sm font-medium text-[var(--color-violet-primary)]">
                {emptyLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF, HEIC — max 8 Mo
              </span>
            </div>
          )}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold pointer-events-none">
              Téléversement…
            </div>
          )}
        </div>
      )}

      {/* Mode URL externe */}
      {mode === "url" && setFromUrlAction && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              disabled={isDisabled || isPending}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--color-violet-primary)" }}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={isDisabled || isPending || !urlValue.trim()}
              size="sm"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              {isPending ? "…" : "Utiliser"}
            </Button>
          </div>
          {previewUrl && (
            <div className={"rounded-xl overflow-hidden border " + previewHeightClass}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            ⚠ L'URL doit être en HTTPS. L'image doit rester accessible
            publiquement — si elle est supprimée chez l'hébergeur, elle
            disparaît aussi côté Kuizard.
          </p>
        </div>
      )}

      {/* Input file caché — déclenché via triggerFilePicker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Boutons : changer / supprimer */}
      <div className="flex flex-wrap gap-2">
        {mode === "upload" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFilePicker}
            disabled={isDisabled || isPending}
          >
            {previewUrl ? "Changer l'image" : "Choisir une image"}
          </Button>
        )}
        {previewUrl && !isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            Supprimer l'image
          </Button>
        )}
      </div>

      {/* Disclaimer légal photos — V43.1 renforcé */}
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold mb-1">
          ⚠️ Important — Responsabilité du créateur
        </p>
        <p className="mb-2">
          En ajoutant une image (upload ou URL externe), tu déclares en être
          l&apos;auteur ou détenir les droits nécessaires à sa diffusion, et
          tu confirmes avoir l&apos;accord des personnes représentées le cas
          échéant.{" "}
          <strong>
            Le créateur du quizz est seul garant du respect du droit à
            l&apos;image, du droit d&apos;auteur et de la protection des
            données personnelles.
          </strong>{" "}
          Kuizard et Projiat ne peuvent en aucun cas être tenus responsables
          des contenus ajoutés par les utilisateurs et se réservent le droit
          de supprimer toute image signalée comme litigieuse.
        </p>
        <p>
          📅 Les photos uploadées sont stockées de manière sécurisée pendant{" "}
          <strong>1 mois après la fin du quizz</strong>, puis supprimées
          automatiquement. Les images référencées par URL externe restent
          hébergées chez le fournisseur tiers.
        </p>
      </div>
    </div>
  );
}
