"use client";

// =============================================
// V58 — Formulaire admin : creer un compte user manuellement
// =============================================

import { useActionState, useState } from "react";

import {
  adminCreateUserAction,
  type AdminCreateUserState,
} from "@/lib/actions/admin/create-user";

const INITIAL: AdminCreateUserState = { ok: false };

export function AdminCreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    adminCreateUserAction,
    INITIAL
  );
  // V58.1 — par defaut PAS d'invite (mieux si tu ne veux pas signaler ta creation).
  // L'user pourra faire "mot de passe oublie" quand il essaiera de se connecter.
  const [sendInvite, setSendInvite] = useState(false);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.15)] p-5 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg tracking-wide text-[var(--color-lavender)]">
          + Créer un compte
        </h2>
        <p className="text-[11px] text-[var(--color-lavender-2)] opacity-70 max-w-xs text-right">
          Le user peut faire &quot;mot de passe oublié&quot; s&apos;il ne reçoit pas l&apos;email.
        </p>
      </div>

      {state.message && (
        <div
          className={`text-sm rounded p-2.5 leading-relaxed ${
            state.ok
              ? "bg-green-500/15 border border-green-500/40 text-green-200"
              : "bg-red-500/15 border border-red-500/40 text-red-200"
          }`}
        >
          {state.message}
          {state.ok && state.inviteLink && (
            <div className="mt-2 text-[11px] font-mono break-all opacity-80">
              🔗 {state.inviteLink}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] opacity-70">
            Email *
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
          {state.errors?.email && (
            <p className="text-xs text-red-300">
              {state.errors.email.join(" ")}
            </p>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] opacity-70">
            Nom / prénom *
          </span>
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            placeholder="Marie Dupont"
            className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
          {state.errors?.name && (
            <p className="text-xs text-red-300">
              {state.errors.name.join(" ")}
            </p>
          )}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] opacity-70">
            Type de compte
          </span>
          <select
            name="accountType"
            defaultValue="INDIVIDUAL"
            className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-[var(--color-gold)]"
          >
            <option value="INDIVIDUAL">👤 Particulier</option>
            <option value="BUSINESS">🏢 Professionnel</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[2px] opacity-70">
            Rôle
          </span>
          <select
            name="role"
            defaultValue="USER"
            className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(167,139,250,0.2)] text-[var(--color-lavender)] px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-[var(--color-gold)]"
          >
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">🎩 Administrateur</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="sendInvite"
          checked={sendInvite}
          onChange={(e) => setSendInvite(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-gold)]"
        />
        <span className="text-[var(--color-lavender)]">
          📧 Envoyer un email d&apos;invitation avec lien de définition du mot de passe
          <span className="opacity-60 text-xs ml-1">(valable 24h)</span>
        </span>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[var(--color-violet-deep)] text-sm font-bold disabled:opacity-50 hover:opacity-90"
        >
          {isPending ? "Creation…" : "✨ Créer le compte"}
        </button>
      </div>
    </form>
  );
}
