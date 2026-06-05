"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Affiche un toast vert "✅ ..." dès qu'un state d'useActionState
 * passe à { ok: true, message }. Utilise un compteur pour éviter de
 * re-afficher le même toast plusieurs fois (React peut renvoyer le même
 * objet state plusieurs fois).
 */
export function useActionToast<S extends { ok: boolean; message?: string }>(
  state: S,
  options?: { successPrefix?: string }
) {
  const lastShown = useRef<S | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state === lastShown.current) return;
    if (state.ok && state.message) {
      const prefix = options?.successPrefix ?? "✅ ";
      toast.success(prefix + state.message);
      lastShown.current = state;
    } else if (!state.ok && state.message && lastShown.current !== state) {
      // Pas de toast d'erreur ici — l'erreur est déjà affichée dans le form
      // via <Alert>. Évite la double notif.
    }
  }, [state, options?.successPrefix]);
}
