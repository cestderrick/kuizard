"use client";

import { useState } from "react";

type Props = {
  /** ID de la vidéo YouTube (la partie après /watch?v= ou /shorts/) */
  videoId: string;
  /** Titre pour l'a11y et le hover */
  title: string;
  /** "9:16" pour Shorts (vertical), "16:9" pour vidéos classiques */
  aspectRatio?: "16:9" | "9:16";
  /** Texte affiché sous la vidéo */
  caption?: string;
};

/**
 * V40 — Lecteur YouTube "Lite" : vignette puis iframe au clic.
 * Économise ~500ko de JS au load initial, vue comptabilisée par YouTube
 * dès que l'utilisateur clique play.
 */
export function LiteYouTube({
  videoId,
  title,
  aspectRatio = "16:9",
  caption,
}: Props) {
  const [activated, setActivated] = useState(false);

  // Thumbnail haute déf si dispo, sinon fallback hqdefault
  // (maxresdefault peut renvoyer un placeholder gris si pas généré)
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // youtube-nocookie domain pour limiter les cookies tiers (RGPD)
  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const ratioClass = aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video";
  // En vertical, on limite la largeur pour ne pas écraser la page
  const containerClass =
    aspectRatio === "9:16" ? "max-w-[360px] mx-auto" : "w-full";

  return (
    <figure className={`flex flex-col gap-2 ${containerClass}`}>
      <div
        className={`${ratioClass} relative rounded-2xl overflow-hidden border border-[rgba(167,139,250,0.3)] bg-black shadow-lg`}
      >
        {activated ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Lire la vidéo : ${title}`}
            className="absolute inset-0 w-full h-full group cursor-pointer"
          >
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay sombre subtil pour faire ressortir le play */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            {/* Gros bouton play centré */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gold), #f59e0b)",
                  color: "var(--color-violet-deep)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Badge YouTube discret en bas */}
            <div className="absolute bottom-2 right-2 text-[10px] uppercase tracking-[1.5px] px-2 py-1 rounded bg-black/60 text-white font-semibold">
              ▶ Lire
            </div>
          </button>
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


