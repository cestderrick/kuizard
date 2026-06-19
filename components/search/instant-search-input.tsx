"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  /** Nom du param URL — typiquement "q" */
  paramName?: string;
  /** Texte d'aide dans l'input */
  placeholder?: string;
  /** Tailwind/CSS classes appliquées à l'input (couleurs, bordures…) */
  className?: string;
  /** Style inline (par ex. couleurs spécifiques au thème sombre admin) */
  inputStyle?: React.CSSProperties;
  /** Debounce en ms — défaut 300 */
  debounceMs?: number;
  /** Si true, ajoute un bouton "Effacer" à côté de l'input quand non vide */
  showClearButton?: boolean;
};

/**
 * V39 — Input de recherche "live" : tape → URL mise à jour (sans reload)
 * après `debounceMs` ms d'inactivité. Le rendering serveur Next.js relit
 * automatiquement les searchParams et refresh la liste.
 */
export function InstantSearchInput({
  paramName = "q",
  placeholder = "Rechercher…",
  className = "",
  inputStyle,
  debounceMs = 300,
  showClearButton = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // État local pour ne pas attendre le re-render serveur à chaque frappe
  const [value, setValue] = useState(searchParams?.get(paramName) ?? "");
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resync si l'URL change pour une autre raison (navigation back/forward)
  useEffect(() => {
    setValue(searchParams?.get(paramName) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get(paramName)]);

  function pushNewSearch(next: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) {
      params.set(paramName, next);
    } else {
      params.delete(paramName);
    }
    // On reset toujours la pagination si elle existe : nouvelle recherche = page 1
    params.delete("page");
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushNewSearch(next.trim()), debounceMs);
  }

  function onSubmit(e: React.FormEvent) {
    // Empêche le submit "natif" qui ferait un full reload — on a déjà push
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    pushNewSearch(value.trim());
  }

  function clear() {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    pushNewSearch("");
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 flex-1 min-w-0">
      <div className="relative flex-1 min-w-0">
        <input
          type="search"
          name={paramName}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          style={inputStyle}
          autoComplete="off"
        />
        {isPending && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60"
            aria-label="Recherche en cours"
          >
            ⏳
          </span>
        )}
      </div>
      {showClearButton && value && (
        <button
          type="button"
          onClick={clear}
          className="text-xs underline-offset-2 hover:underline text-muted-foreground px-2 py-1 whitespace-nowrap"
        >
          Effacer
        </button>
      )}
    </form>
  );
}
