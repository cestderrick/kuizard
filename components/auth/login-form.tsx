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

import { signinAction, type SigninState } from "@/lib/actions/auth";

const initialState: SigninState = { ok: false };

type Texts = {
  title: string;
  subtitle: string;
  email_label: string;
  password_label: string;
  submit: string;
  connecting: string;
  no_account: string;
  signup_link: string;
};

export function LoginForm({ texts }: { texts: Texts }) {
  const [state, formAction, isPending] = useActionState(
    signinAction,
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
            <Label htmlFor="email">{texts.email_label}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="marie@exemple.fr"
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
              autoComplete="current-password"
              required
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password.join(" ")}
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
            {isPending ? texts.connecting : texts.submit}
          </Button>

          {/* V47.31 : lien mot de passe oublie */}
          <p className="text-center text-sm -mt-1">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-[var(--color-violet-primary)] hover:underline underline-offset-4"
            >
              🔑 Mot de passe oublié ?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {texts.no_account}{" "}
          <Link
            href="/signup"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--color-violet-primary)" }}
          >
            {texts.signup_link}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
