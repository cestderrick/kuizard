// =============================================
// VideoEmbed — placeholder ou vidéo réelle
// =============================================
// Tu pourras remplir `src` plus tard avec un lien YouTube/Vimeo embed
// (ex : "https://www.youtube.com/embed/XXXX") ou un MP4 direct.

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
  const ratioClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : aspectRatio === "4:3"
      ? "aspect-[4/3]"
      : "aspect-video";

  return (
    <figure className="flex flex-col gap-2">
      <div
        className={`${ratioClass} rounded-2xl overflow-hidden border border-[rgba(167,139,250,0.3)] bg-[var(--color-night-2)]`}
      >
        {src ? (
          // Si c'est une URL d'iframe (YouTube embed, Vimeo embed), on iframe
          /(youtube\.com\/embed|vimeo\.com\/video|player\.vimeo)/.test(src) ? (
            <iframe
              src={src}
              title={title}
              loading="lazy"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            />
          ) : (
            // Sinon (fichier .mp4 par exemple), on utilise <video>
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
