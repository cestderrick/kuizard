"use client";

import { useActionState, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  upsertCompanyPromoAction,
  type AdminPromoState,
} from "@/lib/actions/admin/company-promos";

type BusinessUser = {
  id: string;
  email: string;
  name: string | null;
  companyName: string | null;
};

export function CompanyPromoAdminForm({
  businessUsers,
}: {
  businessUsers: BusinessUser[];
}) {
  const [state, formAction, isPending] = useActionState(
    upsertCompanyPromoAction,
    { ok: false } as AdminPromoState
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-bold text-[var(--color-gold)] hover:opacity-80 flex items-center gap-2"
      >
        {open ? "▾" : "▸"} ➕ Ajouter un code promo
      </button>

      {open && (
        <form
          action={formAction}
          className="mt-4 grid gap-3 sm:grid-cols-2 max-w-3xl"
        >
          {state.message && (
            <div className="sm:col-span-2">
              <Alert variant={state.ok ? "default" : "destructive"}>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="userId" className="text-xs text-[var(--color-lavender-2)]">
              Société pro *
            </Label>
            <select
              id="userId"
              name="userId"
              required
              className="rounded-lg px-3 py-2 text-sm bg-[var(--color-night)] border border-[rgba(167,139,250,0.25)] text-[var(--color-lavender)]"
            >
              <option value="">— Sélectionner —</option>
              {businessUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.companyName ?? u.name ?? "(sans nom)"} · {u.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--color-lavender-2)] opacity-60">
              Seuls les comptes BUSINESS apparaissent. Si la société n&apos;est pas listée, vérifie son accountType.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="code" className="text-xs text-[var(--color-lavender-2)]">
              Code (uppercase, lettres+chiffres) *
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              pattern="[A-Z0-9_-]+"
              maxLength={40}
              placeholder="ex: EVENT50"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="discountPercent" className="text-xs text-[var(--color-lavender-2)]">
              % de réduction (optionnel)
            </Label>
            <Input
              id="discountPercent"
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              placeholder="ex: 50"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="description" className="text-xs text-[var(--color-lavender-2)]">
              Description *
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              required
              maxLength={200}
              placeholder="ex: 50% sur l'abonnement Premium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="validUntil" className="text-xs text-[var(--color-lavender-2)]">
              Valide jusqu&apos;au (optionnel)
            </Label>
            <Input id="validUntil" name="validUntil" type="datetime-local" />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="maxUses" className="text-xs text-[var(--color-lavender-2)]">
              Nb max d&apos;utilisations (optionnel)
            </Label>
            <Input
              id="maxUses"
              name="maxUses"
              type="number"
              min={0}
              placeholder="vide = illimité"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked
              className="w-4 h-4"
            />
            <Label htmlFor="active" className="text-xs text-[var(--color-lavender-2)]">
              Code actif (décocher pour mettre en pause)
            </Label>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              {isPending ? "Enregistrement…" : "💾 Créer le code"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
