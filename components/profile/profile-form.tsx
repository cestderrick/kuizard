"use client";

import { useActionState, useState } from "react";

import {
  updateProfileAction,
  updatePasswordAction,
  type ProfileState,
} from "@/lib/actions/profile";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { SiretLookup } from "@/components/profile/siret-lookup";

const INITIAL: ProfileState = { ok: false };

type User = {
  name: string | null;
  email: string;
  accountType: "INDIVIDUAL" | "BUSINESS";
  siret?: string | null;
  companyName?: string | null;
  vatNumber?: string | null;
};

type ProfileFormTexts = {
  name_label: string;
  name_placeholder: string;
  email_label: string;
  account_type_label: string;
  type_individual: string;
  type_business: string;
  update_button: string;
  updating: string;
  company_section_title: string;
};

export function ProfileForm({
  user,
  texts,
}: {
  user: User;
  texts: ProfileFormTexts;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  useActionToast(state);
  const [accountType, setAccountType] = useState(user.accountType);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          {texts.name_label}
        </span>
        <input
          name="name"
          defaultValue={user.name ?? ""}
          minLength={2}
          maxLength={80}
          placeholder={texts.name_placeholder}
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        />
        {state.errors?.name && (
          <span className="text-xs text-red-600">{state.errors.name[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          {texts.email_label}
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
          {texts.account_type_label}
        </span>
        <select
          name="accountType"
          value={accountType}
          onChange={(e) =>
            setAccountType(e.target.value as "INDIVIDUAL" | "BUSINESS")
          }
          disabled={pending}
          className="rounded-lg px-3 py-2 border bg-white text-sm focus:outline-none focus:border-[var(--color-violet-primary)]"
        >
          <option value="INDIVIDUAL">{texts.type_individual}</option>
          <option value="BUSINESS">{texts.type_business}</option>
        </select>
      </label>

      {/* Champs entreprise — affichés uniquement si compte pro */}
      {accountType === "BUSINESS" && (
        <fieldset className="rounded-xl border-2 border-[var(--color-violet-primary)]/20 bg-violet-50/40 p-4 flex flex-col gap-3">
          <legend className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold px-2">
            {texts.company_section_title}
          </legend>
          <SiretLookup
            initialSiret={user.siret}
            initialCompanyName={user.companyName}
            initialVatNumber={user.vatNumber}
          />
        </fieldset>
      )}

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
          {pending ? texts.updating : texts.update_button}
        </button>
      </div>
    </form>
  );
}

type PasswordFormTexts = {
  current_password_label: string;
  new_password_label: string;
  confirm_password_label: string;
  change_password_button: string;
  password_updating: string;
};

export function PasswordForm({ texts }: { texts: PasswordFormTexts }) {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    INITIAL
  );
  useActionToast(state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
          {texts.current_password_label}
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
          {texts.new_password_label}
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
          {texts.confirm_password_label}
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
          {pending ? texts.password_updating : texts.change_password_button}
        </button>
      </div>
    </form>
  );
}
