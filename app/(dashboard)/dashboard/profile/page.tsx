import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ProfileForm,
  PasswordForm,
} from "@/components/profile/profile-form";
import { DeleteAccountForm } from "@/components/profile/delete-account-form";
import { getLocale, getMessages } from "@/lib/i18n/get-locale";
import { interp } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Mon profil",
};

const LOCALE_TAGS: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
  it: "it-IT",
  de: "de-DE",
  pt: "pt-PT",
  ru: "ru-RU",
  zh: "zh-CN",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, locale, m] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        accountType: true,
        siret: true,
        companyName: true,
        vatNumber: true,
        createdAt: true,
        passwordHash: true,
      },
    }),
    getLocale(),
    getMessages(),
  ]);
  if (!user) redirect("/login");

  const tag = LOCALE_TAGS[locale] ?? "fr-FR";
  const dateStr = new Intl.DateTimeFormat(tag, { dateStyle: "long" }).format(
    user.createdAt
  );
  const mp = m.profile!;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <header>
        <p className="text-sm uppercase tracking-[3px] text-[var(--color-violet-primary)] mb-2 font-semibold">
          {mp.page_eyebrow}
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          {mp.page_title}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          {interp(mp.member_since, { date: dateStr })}
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg tracking-wide mb-4">
          {mp.info_title}
        </h2>
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            accountType: user.accountType,
            siret: user.siret,
            companyName: user.companyName,
            vatNumber: user.vatNumber,
          }}
          texts={{
            name_label: mp.name_label,
            name_placeholder: mp.name_placeholder,
            email_label: mp.email_label,
            account_type_label: mp.account_type_label,
            type_individual: mp.type_individual,
            type_business: mp.type_business,
            update_button: mp.update_button,
            updating: mp.updating,
            company_section_title: mp.company_section_title,
          }}
        />
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg tracking-wide mb-4">
          {mp.password_title}
        </h2>
        {user.passwordHash ? (
          <PasswordForm
            texts={{
              current_password_label: mp.current_password_label,
              new_password_label: mp.new_password_label,
              confirm_password_label: mp.confirm_password_label,
              change_password_button: mp.change_password_button,
              password_updating: mp.password_updating,
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {mp.password_oauth_hint}
          </p>
        )}
      </section>

      <section className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-6">
        <h2 className="font-display text-lg tracking-wide mb-4 text-red-900">
          {mp.danger_zone}
        </h2>
        <DeleteAccountForm
          texts={{
            delete_warning_strong: mp.delete_warning_strong,
            delete_warning: mp.delete_warning,
            current_password_label: mp.current_password_label,
            delete_confirm_label: mp.delete_confirm_label,
            delete_confirm_value: mp.delete_confirm_value,
            delete_button: mp.delete_button,
            delete_deleting: mp.delete_deleting,
            delete_confirm_dialog: mp.delete_confirm_dialog,
          }}
        />
      </section>
    </div>
  );
}
