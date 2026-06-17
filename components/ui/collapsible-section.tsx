import type { ReactNode } from "react";

/**
 * Section pliable basée sur l'élément natif <details>.
 * Pas besoin de "use client" — l'expand/collapse est géré par le navigateur.
 * Animation CSS smooth via la classe .kz-collapsible.
 *
 * Usage :
 *   <CollapsibleSection title="Mes infos" icon="ℹ️" defaultOpen>
 *     ...contenu...
 *   </CollapsibleSection>
 */
export function CollapsibleSection({
  title,
  description,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  description?: string;
  icon?: string;
  defaultOpen?: boolean;
  badge?: string | number;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="kz-collapsible group rounded-2xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
    >
      <summary className="cursor-pointer select-none px-5 py-4 flex items-center gap-3 list-none [&::-webkit-details-marker]:hidden">
        {icon && <span aria-hidden className="text-2xl shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-base flex items-center gap-2 flex-wrap"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {title}
            {badge !== undefined && badge !== null && (
              <span
                className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-full bg-violet-50"
                style={{ color: "var(--color-violet-primary)" }}
              >
                {badge}
              </span>
            )}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {/* Chevron qui pivote au open */}
        <svg
          className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div className="px-5 pb-5 pt-1 border-t border-violet-100">{children}</div>
    </details>
  );
}
