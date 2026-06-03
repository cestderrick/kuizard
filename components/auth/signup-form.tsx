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

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );

  return (
    <Card className="border-0 shadow-2xl shadow-violet-900/40">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl tracking-wide">
          Créer un compte
        </CardTitle>
        <CardDescription>
          Pour créer tes quizz personnalisés ✨
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state.message && !state.ok && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Ton nom (ou pseudo)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Marie Dupont"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">
                {state.errors.name.join(" ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password.join(" ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="accountType">Type de compte</Label>
            <select
              id="accountType"
              name="accountType"
              defaultValue="INDIVIDUAL"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="INDIVIDUAL">
                Particulier (mariage, anniv, EVJF…)
              </option>
              <option value="BUSINESS">Pro (bar, hôtel, restaurant)</option>
            </select>
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
            {isPending ? "Création…" : "Créer mon compte ✨"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Tu as déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--color-violet-primary)" }}
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
