"use client";

import { useState, useTransition, useActionState } from "react";
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
  signupAction,
  verifyPromoCodeAction,
  type SignupState,
  type VerifyPromoState,
} from "@/lib/actions/auth";

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
  // V57 — Champ code promo optionnel, replie par defaut pour ne pas surcharger.
  const [showPromo, setShowPromo] = useState(false);
  // V57.1 — Verification du code AVANT signup : le user tape, clique
  // "Verifier", on lui montre l'offre debloquee ou l'erreur.
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<VerifyPromoState | null>(null);
  const [isVerifying, startVerify] = useTransition();

  async function handleVerify() {
    const code = promoInput.trim().toUpperCase();
    if (code.length < 3) {
      setPromoResult({ ok: false, message: "Saisis un code." });
      return;
    }
    startVerify(async () => {
      const fd = new FormData();
      fd.set("code", code);
      const res = await verifyPromoCodeAction(
        { ok: false, message: "" },
        fd
      );
      setPromoResult(res);
    });
  }

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

          {/* V57 — Code promo optionnel (repliable) + verification en direct */}
          <div className="flex flex-col gap-2">
            {!showPromo ? (
              <button
                type="button"
                onClick={() => setShowPromo(true)}
                className="text-xs font-semibold underline underline-offset-2 self-start opacity-80 hover:opacity-100"
                style={{ color: "var(--color-violet-primary)" }}
              >
                🎁 J&apos;ai un code promo
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border p-3"
                style={{
                  borderColor: "rgba(245,158,11,0.3)",
                  backgroundColor: "rgba(245,158,11,0.05)",
                }}
              >
                <Label htmlFor="promoCode" className="text-xs">
                  🎁 Code promo (optionnel)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    maxLength={40}
                    placeholder="Ex: LANCEMENT2026"
                    autoCapitalize="characters"
                    className="uppercase flex-1"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      // Reset le resultat des que l'user modifie le code
                      if (promoResult) setPromoResult(null);
                    }}
                    onKeyDown={(e) => {
                      // Enter dans le champ = verifier (pas submit du form)
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerify();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || promoInput.trim().length < 3}
                    className="rounded-md px-3 py-1.5 text-xs font-bold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "var(--color-violet-deep)",
                    }}
                  >
                    {isVerifying ? "Verification…" : "Verifier"}
                  </button>
                </div>

                {/* Feedback verification */}
                {promoResult?.ok === true && (
                  <div
                    className="rounded-md p-2.5 text-xs leading-relaxed"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.4)",
                      color: "#166534",
                    }}
                  >
                    <p className="font-bold mb-0.5">
                      ✅ Code valide — <span className="font-mono">{promoResult.code}</span>
                    </p>
                    <p>
                      🎁 Tu benefiques du plan{" "}
                      <strong className="uppercase">{promoResult.planSlug}</strong>{" "}
                      pendant <strong>{promoResult.durationDays} jours</strong>{" "}
                      des la creation de ton compte.
                    </p>
                    {promoResult.description && (
                      <p className="italic opacity-80 mt-1">
                        « {promoResult.description} »
                      </p>
                    )}
                  </div>
                )}
                {promoResult?.ok === false && (
                  <div
                    className="rounded-md p-2.5 text-xs"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.35)",
                      color: "#991b1b",
                    }}
                  >
                    ❌ {promoResult.message}
                  </div>
                )}
                {!promoResult && (
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Clique sur <strong>Verifier</strong> pour voir l&apos;offre debloquee
                    avant de creer ton compte.
                  </p>
                )}
              </div>
            )}
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
