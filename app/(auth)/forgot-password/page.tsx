import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialise ton mot de passe Kuizard en quelques clics.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
