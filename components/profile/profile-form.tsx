"use client";

import { useActionState } from "react";

import {
  updateProfileAction,
  updatePasswordAction,
  type ProfileState,
} from "@/lib/actions/profile";
import { useActionToast } from "@/lib/hooks/use-action-toast";

const INITIAL: ProfileState = { ok: false };

type User = {
  name: string | null;
  email: string;
  accountType: "INDIVIDUAL" | "BUSINESS";
};

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  useActionToast(state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Nom affiché
        </span>
        <input
          name="name"
          defaultValue={user.name ?? ""}
          minLength={2}
          maxLength={80}
          placeholder="Comment veux-tu apparaître ?"
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.name && (
          <span className="text-xs text-red-600">{state.errors.name[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          defaultValue={user.email}
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.email && (
          <span className="text-xs text-red-600">{state.errors.email[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Type de compte
        </span>
        <select
          name="accountType"
          defaultValue={user.accountType}
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        >
          <option value="INDIVIDUAL">👤 Particulier</option>
          <option value="BUSINESS">🏢 Professionnel</option>
        </select>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Mot de passe actuel
        </span>
        <input
          name="currentPassword"
          type="password"
          required
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.currentPassword && (
          <span className="text-xs text-red-600">
            {state.errors.currentPassword[0]}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Nouveau mot de passe
        </span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.newPassword && (
          <span className="text-xs text-red-600">
            {state.errors.newPassword[0]}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          Confirmer le nouveau
        </span>
        <input
          name="confirmPassword"
          type="password"
          required
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.confirmPassword && (
          <span className="text-xs text-red-600">
            {state.errors.confirmPassword[0]}
          </span>
        )}
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 border-[var(--color-violet-primary)] text-[var(--color-violet-primary)] hover:bg-[var(--color-violet-primary)] hover:text-white disabled:opacity-50"
        >
          {pending ? "Mise à jour…" : "🔐 Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}
