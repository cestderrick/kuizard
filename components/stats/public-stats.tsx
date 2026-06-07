import { getPublicStats } from "@/lib/stats/public";

/**
 * Bloc public affichant les chiffres clés de Kuizard.
 * Renvoie `null` si l'admin a désactivé l'affichage.
 *
 * variant="light" : pour les fonds clairs (dashboard, home)
 * variant="night" : pour les fonds sombres (player, etc.)
 */
export async function PublicStats({
  variant = "light",
}: {
  variant?: "light" | "night";
}) {
  const data = await getPublicStats();
  if (!data) return null;

  const isLight = variant === "light";

  return (
    <section
      className={`rounded-2xl p-6 md:p-8 border ${
        isLight
          ? "bg-white border-violet-100"
          : "bg-[var(--color-night-2)] border-[rgba(167,139,250,0.15)]"
      }`}
    >
      <div className="text-center mb-5">
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{
            color: isLight ? "var(--color-violet-deep)" : "var(--color-gold-light)",
          }}
        >
          ✨ {data.title}
        </h2>
        {data.subtitle && (
          <p
            className={`text-sm mt-1 ${
              isLight ? "text-muted-foreground" : "opacity-80"
            }`}
          >
            {data.subtitle}
          </p>
        )}
      </div>
      <div
        className={`grid gap-3 ${
          data.items.length <= 2
            ? "grid-cols-2"
            : data.items.length === 3
            ? "grid-cols-3"
            : data.items.length === 4
            ? "grid-cols-2 md:grid-cols-4"
            : "grid-cols-2 md:grid-cols-5"
        }`}
      >
        {data.items.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl p-4 text-center ${
              isLight ? "bg-violet-50" : "bg-[rgba(0,0,0,0.2)]"
            }`}
          >
            <div className="text-2xl mb-1" aria-hidden>
              {item.icon}
            </div>
            <p
              className="font-display text-3xl font-bold"
              style={{
                color: isLight
                  ? "var(--color-violet-primary)"
                  : "var(--color-gold-light)",
              }}
            >
              {item.value}
            </p>
            <p
              className={`text-xs ${
                isLight ? "text-muted-foreground" : "opacity-70"
              }`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
