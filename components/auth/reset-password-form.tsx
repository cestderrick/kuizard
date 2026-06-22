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
  resetPasswordAction,
  type ResetState,
} from "@/lib/actions/password-reset";

const initialState: ResetState = { ok: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  return (
    <Card className="border-0 shadow-2xl shadow-violet-900/40">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl tracking-wide">
          🔑 Nouveau mot de passe
        </CardTitle>
        <CardDescription>
          Choisis un nouveau mot de passe (8 caractères min).
        </CardDescription>
      </CardHeader>

      <CardContent>
        {state.ok ? (
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertDescription>✅ {state.message}</AlertDescription>
            </Alert>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full rounded-md px-4 py-2 font-bold text-sm transition hover:opacity-90"
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              Se connecter ✨
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="token" value={token} />

            {state.message && !state.ok && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
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

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={isPending}
              style={{
                backgroundColor: "var(--color-violet-primary)",
                color: "white",
              }}
            >
              {isPending ? "Mise à jour…" : "Valider le nouveau mot de passe ✨"}
            </Button>
          </form>
        )}

        {!state.ok && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              ← Demander un nouveau lien
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
