import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoins Kuizard pour créer tes quizz personnalisés.",
};

export default function SignupPage() {
  return <SignupForm />;
}
