import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à ton espace Kuizard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
