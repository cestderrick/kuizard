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

import {
  requestPasswordResetAction,
  type RequestState,
} from "@/lib/actions/password-reset";

const initialState: RequestState = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <Card className="border-0 shadow-2xl shadow-violet-900/40">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl tracking-wide">
          🔑 Mot de passe oublié ?
        </CardTitle>
        <CardDescription>
          Saisis ton email, on t&apos;envoie un lien pour le réinitialiser.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {state.ok && state.message ? (
          <Alert>
            <AlertDescription>✅ {state.message}</AlertDescription>
          </Alert>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            {state.message && !state.ok && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

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

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={isPending}
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              {isPending ? "Envoi…" : "Envoyer le lien ✉️"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--color-violet-primary)" }}
          >
            ← Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
