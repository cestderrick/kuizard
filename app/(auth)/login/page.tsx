import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getMessages } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à ton espace Kuizard.",
};

const FALLBACK = {
  login_title: "Connexion",
  login_subtitle: "Retrouve ton espace pour gérer tes quizz 🎩",
  email_label: "Email",
  password_label: "Mot de passe",
  submit_login: "Se connecter ✨",
  no_account: "Pas encore de compte ?",
  signup_link: "Créer un compte",
  connecting: "Connexion…",
};

export default async function LoginPage() {
  const messages = await getMessages();
  const t = messages.auth;
  const navT = messages.nav;

  return (
    <LoginForm
      texts={{
        title: t?.login_title ?? FALLBACK.login_title,
        subtitle: t?.login_subtitle ?? FALLBACK.login_subtitle,
        email_label: t?.email_label ?? FALLBACK.email_label,
        password_label: t?.password_label ?? FALLBACK.password_label,
        submit: t?.submit_login ?? FALLBACK.submit_login,
        connecting: FALLBACK.connecting,
        no_account: t?.no_account ?? FALLBACK.no_account,
        signup_link: navT.signup,
      }}
    />
  );
}
