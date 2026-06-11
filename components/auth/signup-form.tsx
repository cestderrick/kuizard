"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { signupAction, type SignupState } from "@/lib/actions/auth";

const initialState: SignupState = { ok: false };

type Texts = {
  title: string;
  subtitle: string;
  name_label: string;
  email_label: string;
  password_label: string;
  account_type_label: string;
  account_type_individual: string;
  account_type_business: string;
  submit: string;
  creating: string;
  have_account: string;
  login_link: string;
  // Acceptation des CGU/CGV — la chaîne contient {cgu} et {cgv} comme
  // placeholders qu'on remplace par des liens hypertextes.
  terms_accept: string;
  terms_cgu: string;
  terms_cgv: string;
};

export function SignupForm({ texts }: { texts: Texts }) {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );

  return (
    <Card className="border-0 shadow-2xl shadow-violet-900/40">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl tracking-wide">
          {texts.title}
        </CardTitle>
        <CardDescription>{texts.subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state.message && !state.ok && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{texts.name_label}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Marie, Léa, Le mage…"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">
                {state.errors.name.join(" ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{texts.email_label}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="ton@email.com"
            />
            {state.errors?.email && (
              <p className="text-sm text-destructive">
                {state.errors.email.join(" ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{texts.password_label}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="8+"
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password.join(" ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="accountType">{texts.account_type_label}</Label>
            <select
              id="accountType"
              name="accountType"
              defaultValue="INDIVIDUAL"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="INDIVIDUAL">{texts.account_type_individual}</option>
              <option value="BUSINESS">{texts.account_type_business}</option>
            </select>
          </div>

          {/* Acceptation explicite CGU + CGV — obligatoire */}
          <div className="flex flex-col gap-2 mt-2">
            <label
              htmlFor="termsAccepted"
              className="flex items-start gap-2 text-sm cursor-pointer select-none"
            >
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                required
                className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--color-violet-primary)]"
              />
              <span className="text-muted-foreground leading-snug">
                {(() => {
                  // Découpe la chaîne "J'accepte les {cgu} et les {cgv}." en
                  // morceaux pour intercaler de vrais liens <Link>.
                  const parts = texts.terms_accept.split(/(\{cgu\}|\{cgv\})/g);
                  return parts.map((part, i) => {
                    if (part === "{cgu}") {
                      return (
                        <Link
                          key={i}
                          href="/cgu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2 hover:opacity-80"
                          style={{ color: "var(--color-violet-primary)" }}
                        >
                          {texts.terms_cgu}
                        </Link>
                      );
                    }
                    if (part === "{cgv}") {
                      return (
                        <Link
                          key={i}
                          href="/cgv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2 hover:opacity-80"
                          style={{ color: "var(--color-violet-primary)" }}
                        >
                          {texts.terms_cgv}
                        </Link>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  });
                })()}
              </span>
            </label>
            {state.errors?.termsAccepted && (
              <p className="text-sm text-destructive">
                {state.errors.termsAccepted.join(" ")}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={isPending}
            style={{
              backgroundColor: "var(--color-violet-primary)",
              color: "white",
            }}
          >
            {isPending ? texts.creating : texts.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {texts.have_account}{" "}
          <Link
            href="/login"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--color-violet-primary)" }}
          >
            {texts.login_link}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
