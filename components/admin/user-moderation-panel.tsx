"use client";

import { useActionState } from "react";

import {
  banUserAction,
  unbanUserAction,
  promoteUserAction,
  demoteUserAction,
  type ModerationState,
} from "@/lib/actions/admin/moderation";

const INITIAL: ModerationState = { ok: false };

/* =============================================================
 * BAN — formulaire avec double confirmation
 * ============================================================= */
export function BanUserForm({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [state, action, pending] = useActionState(banUserAction, INITIAL);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const txt = `BANNIR ${userEmail} ?\n\nCette action :\n- empêche le user de se reconnecter\n- reste tracée dans l'audit log\n- est réversible (tu peux le débannir)`;
        if (!confirm(txt)) e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="userId" value={userId} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-red-300 font-semibold">
          Raison du bannissement
        </span>
        <textarea
          name="reason"
          required
          minLength={3}
          maxLength={500}
          rows={3}
          placeholder="Ex : Spam répété, contenu illégal signalé, violation CGU §3..."
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,100,100,0.2)] text-sm text-[var(--color-lavender)] focus:outline-none focus:border-red-400"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-red-300 font-semibold">
          Tape l'email pour confirmer
        </span>
        <input
          type="text"
          name="emailConfirmation"
          required
          autoComplete="off"
          placeholder={userEmail}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,100,100,0.2)] text-sm text-[var(--color-lavender)] font-mono focus:outline-none focus:border-red-400"
        />
        <span className="text-[10px] opacity-60">
          Sécurité : tu dois taper exactement <code>{userEmail}</code>.
        </span>
      </label>

      {state.message && (
        <p
          className={`text-xs ${
            state.ok ? "text-green-400" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Bannissement…" : "🚫 Bannir définitivement"}
      </button>
    </form>
  );
}

export function UnbanUserForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(unbanUserAction, INITIAL);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-violet-primary)] text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Déblocage…" : "✓ Lever le bannissement"}
      </button>
    </form>
  );
}

/* =============================================================
 * PROMOTE / DEMOTE — gestion du rôle ADMIN
 * ============================================================= */
export function PromoteUserForm({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [state, action, pending] = useActionState(promoteUserAction, INITIAL);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `Promouvoir ${userEmail} au rôle ADMIN ?\n\nCe user aura accès à toute la zone /admin (gestion users, plans, paiements, etc.).`
          )
        )
          e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
          Tape l'email pour confirmer
        </span>
        <input
          type="text"
          name="emailConfirmation"
          required
          autoComplete="off"
          placeholder={userEmail}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(167,139,250,0.2)] text-sm text-[var(--color-lavender)] font-mono focus:outline-none focus:border-[var(--color-gold)]"
        />
      </label>
      {state.message && (
        <p
          className={`text-xs ${state.ok ? "text-green-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-gold)] text-[var(--color-violet-deep)] hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Promotion…" : "👑 Promouvoir en ADMIN"}
      </button>
    </form>
  );
}

export function DemoteUserForm({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [state, action, pending] = useActionState(demoteUserAction, INITIAL);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `Retirer le rôle ADMIN à ${userEmail} ?\n\nIl perdra l'accès à /admin mais gardera son compte user normal.`
          )
        )
          e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-amber-300 font-semibold">
          Tape l'email pour confirmer
        </span>
        <input
          type="text"
          name="emailConfirmation"
          required
          autoComplete="off"
          placeholder={userEmail}
          className="rounded-lg px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(245,158,11,0.25)] text-sm text-[var(--color-lavender)] font-mono focus:outline-none focus:border-amber-400"
        />
      </label>
      {state.message && (
        <p
          className={`text-xs ${state.ok ? "text-green-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end px-4 py-2 rounded-lg font-semibold text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Rétrogradation…" : "↓ Retirer le rôle ADMIN"}
      </button>
    </form>
  );
}
