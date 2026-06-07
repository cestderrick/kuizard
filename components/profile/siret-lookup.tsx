"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

type LookupState = {
  ok: boolean;
  message?: string;
  company?: {
    siret: string;
    siren: string;
    companyName: string;
    activity: string | null;
    state: "active" | "ceased" | "unknown";
    address: string | null;
    postalCode: string | null;
    city: string | null;
  };
  computedVat?: string | null;
};

/**
 * Bloc "Entreprise" — SIRET (avec lookup INSEE auto), nom société, TVA.
 *
 * Le bouton "🔍 Vérifier" est un button normal (type="button") qui appelle
 * directement la server action via useTransition. PAS de form imbriqué :
 * c'est interdit en HTML et ça casserait la soumission du form parent.
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
  const [result, setResult] = useState<LookupState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleVerify() {
    if (!siret.trim()) {
      toast.error("Saisis d'abord un SIRET.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/siret/lookup?siret=${encodeURIComponent(siret)}`,
          { cache: "no-store" }
        );
        const r: LookupState = await res.json();
        setResult(r);
        if (r.ok && r.company?.companyName) {
          setCompanyName(r.company.companyName);
          // Auto-fill du N° de TVA intracom (formule déterministe depuis SIREN)
          // SAUF si l'utilisateur a déjà saisi un autre numéro à la main
          if (r.computedVat && !vatNumber.trim()) {
            setVatNumber(r.computedVat);
          }
          toast.success(`✓ ${r.company.companyName}`);
        } else if (!r.ok && r.message) {
          toast.error(r.message);
        }
      } catch (err) {
        console.error("[siret-lookup] err:", err);
        toast.error("Erreur réseau. Vérifie ta connexion.");
      }
    });
  }

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
            onKeyDown={(e) => {
              // Entrée dans le champ SIRET = déclenche la vérif (pas la
              // soumission du form parent)
              if (e.key === "Enter") {
                e.preventDefault();
                handleVerify();
              }
            }}
            required={required}
            maxLength={20}
            placeholder="123 456 789 00012"
            disabled={isPending}
            className="flex-1 rounded-lg px-3 py-2 border bg-white text-sm font-mono focus:outline-none focus:border-[var(--color-violet-primary)] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={isPending || !siret}
            className="px-3 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-violet-deep)] text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? "Recherche…" : "🔍 Vérifier"}
          </button>
        </div>
        {result?.ok && result.company && (
          <span className="text-xs text-green-700 flex flex-col gap-0.5 mt-1">
            <span>
              ✓ <strong>{result.company.companyName}</strong>
            </span>
            {result.company.activity && (
              <span className="opacity-70">{result.company.activity}</span>
            )}
            {result.company.address && (
              <span className="opacity-70">
                {result.company.address}
                {result.company.postalCode &&
                  ` · ${result.company.postalCode} ${result.company.city ?? ""}`}
              </span>
            )}
          </span>
        )}
        {result && !result.ok && result.message && (
          <span className="text-xs text-amber-700 mt-1">{result.message}</span>
        )}
        <span className="text-xs text-muted-foreground">
          Format : 14 chiffres (avec ou sans espaces). On vérifie auprès de
          l'annuaire officiel des entreprises (data.gouv.fr).
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
          Calculé automatiquement à partir du SIREN après la vérif SIRET.
          Utile pour la facturation B2B intra-UE. Si tu es en franchise de TVA
          (micro-entreprise non assujettie), tu peux le laisser vide.
        </span>
      </label>
    </div>
  );
}
