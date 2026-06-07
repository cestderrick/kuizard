"use server";

// =============================================
// Server Action — Validation + lookup SIRET pour le client
// =============================================
// Côté client on n'appelle pas l'API INSEE directement (gardons les fetch
// côté serveur pour la cohérence et le caching). Cette action fait :
// 1. Validation Luhn locale
// 2. Lookup recherche-entreprises
// 3. Retour structuré pour pré-remplir le formulaire

import { checkSiret } from "@/lib/siret/validate";
import { lookupSiret, type CompanyInfo } from "@/lib/siret/insee";

export type LookupState = {
  ok: boolean;
  message?: string;
  company?: CompanyInfo;
};

const INITIAL: LookupState = { ok: false };
export const initialLookupState = INITIAL;

export async function lookupSiretAction(
  _prev: LookupState,
  formData: FormData
): Promise<LookupState> {
  const raw = (formData.get("siret") as string) ?? "";

  // 1. Format + Luhn
  const check = checkSiret(raw);
  if (!check.ok) {
    return { ok: false, message: check.message };
  }

  // 2. API INSEE
  const result = await lookupSiret(raw);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  // 3. Avertit si l'entreprise est cessée
  if (result.company.state === "ceased") {
    return {
      ok: false,
      message: `⚠️ ${result.company.companyName} apparaît comme cessée. Vérifie le SIRET.`,
      company: result.company,
    };
  }

  return {
    ok: true,
    message: `✓ ${result.company.companyName}`,
    company: result.company,
  };
}
