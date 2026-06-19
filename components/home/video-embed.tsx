// =============================================
// VideoEmbed — placeholder ou vidéo réelle
// =============================================
// V40 : si la src est une URL YouTube (n'importe quel format), on utilise
// LiteYouTube (vignette + iframe au clic) pour économiser ~500ko au load.
// Sinon fallback sur iframe direct (Vimeo) ou <video> (mp4).

import { LiteYouTube, extractYouTubeId } from "@/components/home/lite-youtube";

type Props = {
  src?: string | null;
  title: string;
  aspectRatio?: "16:9" | "9:16" | "4:3";
  caption?: string;
};

export function VideoEmbed({
  src,
  title,
  aspectRatio = "16:9",
  caption,
}: Props) {
  // V40 : route auto vers LiteYouTube si on détecte une URL YouTube
  if (src) {
    const ytId = extractYouTubeId(src);
    if (ytId) {
      return (
        <LiteYouTube
          videoId={ytId}
          title={title}
          aspectRatio={aspectRatio === "9:16" ? "9:16" : "16:9"}
          caption={caption}
        />
      );
    }
  }

  const ratioClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : aspectRatio === "4:3"
      ? "aspect-[4/3]"
      : "aspect-video";

  // En vertical (Shorts), on limite la largeur pour ne pas écraser la page
  const containerClass =
    aspectRatio === "9:16" ? "max-w-[360px] mx-auto" : "w-full";

  return (
    <figure className={`flex flex-col gap-2 ${containerClass}`}>
      <div
        className={`${ratioClass} rounded-2xl overflow-hidden border border-[rgba(167,139,250,0.3)] bg-[var(--color-night-2)]`}
      >
        {src ? (
          /(vimeo\.com\/video|player\.vimeo)/.test(src) ? (
            <iframe
              src={src}
              title={title}
              loading="lazy"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            />
          ) : (
            // Fichier .mp4 par exemple
            <video
              src={src}
              controls
              preload="metadata"
              className="w-full h-full bg-black"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )
        ) : (
          <VideoPlaceholder title={title} />
        )}
      </div>
      {caption && (
        <figcaption className="text-xs text-center text-[var(--color-lavender-2)] opacity-70">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-gradient-to-br from-[var(--color-violet-deep)] via-[var(--color-night-2)] to-[var(--color-night)] text-[var(--color-lavender)]">
      <div className="text-5xl" aria-hidden>
        🎬
      </div>
      <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold">
        Vidéo à venir
      </p>
      <p className="font-display text-lg tracking-wide">{title}</p>
      <p className="text-xs text-[var(--color-lavender-2)] opacity-70 max-w-xs">
        Cette vidéo explicative sera ajoutée prochainement.
      </p>
    </div>
  );
}
