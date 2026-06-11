import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { getMessages } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoins Kuizard pour créer tes quizz personnalisés.",
};

const FB = {
  signup_title: "Bienvenue chez Kuizard ✨",
  signup_subtitle: "Crée ton compte gratuit en 30 secondes.",
  name_label: "Ton prénom",
  email_label: "Email",
  password_label: "Mot de passe",
  account_type_label: "Type de compte",
  account_type_individual: "👤 Particulier",
  account_type_business: "🏢 Professionnel",
  submit_signup: "Créer mon compte ✨",
  creating: "Création…",
  have_account: "Tu as déjà un compte ?",
  terms_accept: "J'accepte les {cgu} et les {cgv} de Kuizard.",
  terms_cgu: "Conditions générales d'utilisation",
  terms_cgv: "Conditions générales de vente",
};

export default async function SignupPage() {
  const messages = await getMessages();
  const t = messages.auth;
  const navT = messages.nav;

  return (
    <SignupForm
      texts={{
        title: t?.signup_title ?? FB.signup_title,
        subtitle: t?.signup_subtitle ?? FB.signup_subtitle,
        name_label: t?.name_label ?? FB.name_label,
        email_label: t?.email_label ?? FB.email_label,
        password_label: t?.password_label ?? FB.password_label,
        account_type_label: t?.account_type_label ?? FB.account_type_label,
        account_type_individual:
          t?.account_type_individual ?? FB.account_type_individual,
        account_type_business:
          t?.account_type_business ?? FB.account_type_business,
        submit: t?.submit_signup ?? FB.submit_signup,
        creating: t?.creating ?? FB.creating,
        have_account: t?.have_account ?? FB.have_account,
        login_link: navT.login,
        terms_accept: t?.terms_accept ?? FB.terms_accept,
        terms_cgu: t?.terms_cgu ?? FB.terms_cgu,
        terms_cgv: t?.terms_cgv ?? FB.terms_cgv,
      }}
    />
  );
}
