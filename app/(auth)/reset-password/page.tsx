import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  description: "Choisis un nouveau mot de passe pour ton compte Kuizard.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim();
  if (!token || token.length < 10) {
    redirect("/forgot-password");
  }
  return <ResetPasswordForm token={token} />;
}
