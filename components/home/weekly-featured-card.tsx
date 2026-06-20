import Link from "next/link";
import type { WeeklyFeaturedDTO } from "@/lib/weekly/featured";

export function WeeklyFeaturedCard({ data }: { data: WeeklyFeaturedDTO }) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
  const accentColor = data.quizColor ?? "#5b21b6";

  return (
    <section className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden p-6 md:p-10 text-white"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #2e1065 100%)`,
          }}
        >
          {/* Halo doré pulsant */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212, 160, 23, 0.4) 0%, transparent 65%)",
            }}
          />

          {/* Étiquette "Cette semaine" */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <span
              className="text-[10px] uppercase tracking-[3px] font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              🎁 Cette semaine
            </span>
            <span className="text-xs opacity-80">
              Jusqu'au {fmt(data.weekEnd)}
            </span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 min-w-0">
              {/* V30 : force la couleur blanche pour éviter que le gradient
                  magic-show (-webkit-text-fill-color: transparent) ne rende
                  le titre illisible sur fond sombre */}
              <h2
                className="text-2xl md:text-4xl font-bold tracking-wide mb-3 leading-tight"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  fontFamily: "var(--font-display, inherit)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {data.title}
              </h2>
              {data.subtitle && (
                <p className="text-base md:text-lg opacity-90 mb-4 leading-relaxed">
                  {data.subtitle}
                </p>
              )}

              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 mb-6">
                <p className="text-xs uppercase tracking-[2px] font-bold mb-2 text-[var(--color-gold-light)]">
                  🏆 Lots à gagner
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {data.prizesText}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Link
                  href={`/q/${data.quizCode}`}
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-bold text-sm transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  {data.ctaLabel ?? "🎁 Tenter ma chance"}
                </Link>
                <p className="text-xs opacity-70">
                  Gratuit
                </p>
              </div>
            </div>

            {/* Visuel de droite : QR-like ou cover image */}
            {data.quizCoverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.quizCoverImageUrl}
                alt={data.title}
                className="w-full md:w-64 h-48 md:h-64 object-cover rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full md:w-64 h-48 md:h-64 rounded-2xl flex items-center justify-center text-9xl font-display font-bold opacity-90 bg-white/10 backdrop-blur-sm border-2 border-white/20">
                🎁
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
