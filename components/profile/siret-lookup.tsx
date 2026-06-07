"use client";

import { useActionState, useEffect, useState } from "react";

import {
  initialLookupState,
  lookupSiretAction,
} from "@/lib/actions/siret";
import { useActionToast } from "@/lib/hooks/use-action-toast";

/**
 * Bloc "Entreprise" — SIRET (avec lookup INSEE auto), nom société, TVA.
 * S'utilise dans le profile pro et plus tard le signup pro.
 *
 * Quand on clique "🔍 Vérifier", on appelle l'API recherche-entreprises
 * et on pré-remplit `companyName` automatiquement.
 */
export function SiretLookup({
  initialSiret,
  initialCompanyName,
  initialVatNumber,
  required,
}: {
  initialSiret?: string | null;
  initialCompanyName?: string | null;
  initialVatNumber?: string | null;
  required?: boolean;
}) {
  const [siret, setSiret] = useState(initialSiret ?? "");
  const [companyName, setCompanyName] = useState(initialCompanyName ?? "");
  const [vatNumber, setVatNumber] = useState(initialVatNumber ?? "");

  const [state, lookup, pending] = useActionState(
    lookupSiretAction,
    initialLookupState
  );
  useActionToast(state);

  // Quand le lookup réussit, on remplit le nom de société automatiquement
  useEffect(() => {
    if (state.ok && state.company?.companyName) {
      setCompanyName(state.company.companyName);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          SIRET {required && <span className="text-red-600">*</span>}
        </span>
        <div className="flex gap-2">
          <input
            name="siret"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            required={required}
            maxLength={20}
            placeholder="123 456 789 00012"
            disabled={pending}
            className="flex-1 rounded-lg px-3 py-2 border bg-white text-sm font-mono focus:outline-none focus:border-[var(--color-violet-primary)] disabled:opacity-60"
          />
          {/* Form imbriqué pour le lookup — ne soumet QUE le SIRET */}
          <form
            action={lookup}
            className="inline-flex"
            onSubmit={(e) => {
              const fd = new FormData(e.currentTarget);
              fd.set("siret", siret);
            }}
          >
            <input type="hidden" name="siret" value={siret} />
            <button
              type="submit"
              disabled={pending || !siret}
              className="px-3 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-violet-deep)] text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              {pending ? "Recherche…" : "🔍 Vérifier"}
            </button>
          </form>
        </div>
        {state.ok && state.company && (
          <span className="text-xs text-green-700 flex flex-col gap-0.5 mt-1">
            <span>
              ✓ <strong>{state.company.companyName}</strong>
            </span>
            {state.company.activity && (
              <span className="opacity-70">{state.company.activity}</span>
            )}
            {state.company.address && (
              <span className="opacity-70">
                {state.company.address}
                {state.company.postalCode &&
                  ` · ${state.company.postalCode} ${state.company.city ?? ""}`}
              </span>
            )}
          </span>
        )}
        {!state.ok && state.message && (
          <span className="text-xs text-amber-700 mt-1">{state.message}</span>
        )}
        <span className="text-xs text-muted-foreground">
          Format : 14 chiffres (avec ou sans espaces). On vérifie auprès de
          l'annuaire officiel des entreprises.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Raison sociale {required && <span className="text-red-600">*</span>}
        </span>
        <input
          name="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required={required}
          maxLength={140}
          placeholder="Auto-rempli après vérif SIRET"
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          N° TVA intracom (optionnel)
        </span>
        <input
          name="vatNumber"
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
          maxLength={40}
          placeholder="FR12345678901"
          className="rounded-lg px-3 py-2 border bg-white text-sm font-mono focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        <span className="text-xs text-muted-foreground">
          Utile pour la facturation avec TVA intracommunautaire (B2B UE).
        </span>
      </label>
    </div>
  );
}
