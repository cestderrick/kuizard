"use client";

import { useActionState } from "react";

import { updateHomeVideosAction } from "@/lib/actions/admin-site-settings";

const initial: { ok: boolean; message?: string; errors?: Record<string, string[]> } = {
  ok: false,
};

export function HomeVideosForm({
  initialIntro,
  initialCreation,
  initialJoueur,
}: {
  initialIntro: string;
  initialCreation: string;
  initialJoueur: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateHomeVideosAction,
    initial
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <VideoField
        name="videoIntro"
        label="🎥 Vidéo d&apos;intro (hero, juste sous la fold)"
        defaultValue={initialIntro}
        placeholder="https://youtube.com/shorts/XXXX ou https://youtube.com/watch?v=XXXX"
        error={state.errors?.videoIntro}
      />
      <VideoField
        name="videoCreation"
        label="🛠️ Vidéo &quot;Création d&apos;un quizz&quot; (section comment ça marche)"
        defaultValue={initialCreation}
        placeholder="URL YouTube / Vimeo / .mp4"
        error={state.errors?.videoCreation}
      />
      <VideoField
        name="videoJoueur"
        label="🎮 Vidéo &quot;Expérience joueur&quot; (en bas)"
        defaultValue={initialJoueur}
        placeholder="URL YouTube / Vimeo / .mp4"
        error={state.errors?.videoJoueur}
      />

      {state.message && (
        <p
          className={
            "text-sm rounded-lg p-3 " +
            (state.ok
              ? "bg-green-500/10 text-green-300 border border-green-500/30"
              : "bg-red-500/10 text-red-300 border border-red-500/30")
          }
        >
          {state.ok ? "✓ " : "⚠ "}
          {state.message}
        </p>
      )}

      <div className="flex gap-3 items-center pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-violet-deep)",
          }}
        >
          {isPending ? "Enregistrement…" : "💾 Enregistrer"}
        </button>
        <p className="text-xs text-[var(--color-lavender-2)] opacity-60">
          Les changements sont visibles immédiatement sur la home (cache 1 min).
        </p>
      </div>
    </form>
  );
}

function VideoField({
  name,
  label,
  defaultValue,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  error?: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-[2px] font-semibold text-[var(--color-lavender)]"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <input
        id={name}
        name={name}
        type="url"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2 text-sm bg-[var(--color-night)] border text-[var(--color-lavender)] placeholder:text-[var(--color-lavender-2)]/40 focus:outline-none focus:border-[var(--color-gold)]"
        style={{ borderColor: "rgba(167,139,250,0.2)" }}
      />
      {error && error.length > 0 && (
        <p className="text-xs text-red-300">{error.join(", ")}</p>
      )}
    </div>
  );
}
