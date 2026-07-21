"use client";

// V60.5b — Uploader audio simple pour un EscapeStep

import { useActionState, useRef } from "react";

import {
  uploadEscapeStepAudioAction,
  removeEscapeStepAudioAction,
} from "@/lib/actions/upload";

type UploadState = { ok: boolean; message?: string; url?: string };
const INITIAL: UploadState = { ok: false };

type Props = {
  escapeId: string;
  stepId: string;
  currentUrl: string | null;
};

export function EscapeAudioUploader({ escapeId, stepId, currentUrl }: Props) {
  const [state, formAction, isPending] = useActionState(
    uploadEscapeStepAudioAction,
    INITIAL
  );
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      {currentUrl && (
        <div className="flex items-center gap-2">
          <audio controls src={currentUrl} className="flex-1 h-9" />
          <form action={removeEscapeStepAudioAction}>
            <input type="hidden" name="escapeId" value={escapeId} />
            <input type="hidden" name="stepId" value={stepId} />
            <button
              type="submit"
              className="text-xs text-destructive hover:bg-destructive/10 rounded px-2 py-1"
              title="Supprimer l'audio"
            >
              ✕
            </button>
          </form>
        </div>
      )}
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="escapeId" value={escapeId} />
        <input type="hidden" name="stepId" value={stepId} />
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept="audio/*"
          className="text-xs file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-violet-100 file:text-violet-800 file:font-semibold file:cursor-pointer file:hover:bg-violet-200"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              e.target.form?.requestSubmit();
            }
          }}
        />
        {isPending && <span className="text-xs opacity-70">Upload...</span>}
      </form>
      {state.message && (
        <p
          className={`text-xs ${
            state.ok ? "text-green-700" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
