"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Affiche un toast (vert ✓ ou rouge ✕) dès qu'un state d'useActionState
 * change. On utilise un useRef pour ne pas dupliquer le même toast.
 */
export function useActionToast<S extends { ok: boolean; message?: string }>(
  state: S
) {
  const lastShown = useRef<S | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state === lastShown.current) return;
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message, {
        icon: "✓",
        duration: 3500,
      });
    } else {
      toast.error(state.message, {
        icon: "✕",
        duration: 5000,
      });
    }
    lastShown.current = state;
  }, [state]);
}
