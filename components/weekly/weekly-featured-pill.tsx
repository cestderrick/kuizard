import Link from "next/link";
import type { WeeklyFeaturedDTO } from "@/lib/weekly/featured";

/**
 * Mini-bandeau / pill compact pour mettre en avant le quizz de la semaine
 * dans les endroits où la WeeklyFeaturedCard est trop grosse (navbar,
 * dessus de Quizthèque, etc.). Cliquable, mène à la page joueur du quizz.
 */
export function WeeklyFeaturedPill({
  data,
  variant = "compact",
}: {
  data: WeeklyFeaturedDTO;
  variant?: "compact" | "banner";
}) {
  const accentColor = data.quizColor ?? "var(--color-violet-primary)";

  if (variant === "banner") {
    // Variante "banner" — large, pour le haut de la Quizthèque
    return (
      <Link
        href={`/q/${data.quizCode}`}
        className="block rounded-2xl overflow-hidden transition hover:opacity-95 hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, #2e1065 100%)`,
        }}
      >
        <div className="relative p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(212,160,23,0.4) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10 shrink-0">
            <span
              className="inline-block text-[10px] uppercase tracking-[3px] font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              🎁 Quizz de la semaine
            </span>
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="font-display text-lg sm:text-2xl font-bold tracking-wide leading-tight">
              {data.title}
            </p>
            {data.subtitle && (
              <p className="text-sm opacity-90 mt-0.5">{data.subtitle}</p>
            )}
            <p className="text-xs opacity-80 mt-1">
              🎁 {data.prizesText}
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <span
              className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold whitespace-nowrap"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              {data.ctaLabel ?? "Jouer maintenant"} →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Variante "compact" — petite pill pour la navbar
  return (
    <Link
      href={`/q/${data.quizCode}`}
      className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition hover:opacity-90"
      style={{
        background:
          "linear-gradient(135deg, var(--color-gold), #d4a017)",
        color: "var(--color-violet-deep)",
      }}
      title={data.title}
    >
      <span aria-hidden>🎁</span>
      <span className="truncate max-w-[200px]">
        Quizz de la semaine : <strong>{data.title}</strong>
      </span>
    </Link>
  );
}
