// =============================================
// Lookup d'une entreprise via l'API recherche-entreprises
// =============================================
//
// On utilise https://recherche-entreprises.api.gouv.fr/ — API officielle
// du service public, gratuite, **sans authentification** ni clé.
// Source : data.gouv.fr + INSEE Sirene. Mise à jour ~hebdomadaire.
//
// Documentation : https://api.gouv.fr/documentation/api-recherche-entreprises
//
// Note : on ne stocke pas les résultats — juste pour pré-remplir le formulaire.

import { normalizeSiret } from "@/lib/siret/validate";

export type CompanyInfo = {
  siret: string;
  siren: string;
  companyName: string;
  // Activité principale (libellé NAF)
  activity: string | null;
  // Statut (Actif / Cessée)
  state: "active" | "ceased" | "unknown";
  // Adresse complète du siège
  address: string | null;
  postalCode: string | null;
  city: string | null;
};

export type LookupResult =
  | { ok: true; company: CompanyInfo }
  | { ok: false; message: string };

const API_BASE = "https://recherche-entreprises.api.gouv.fr/search";

/**
 * Cherche une entreprise par son SIRET.
 */
export async function lookupSiret(siret: string): Promise<LookupResult> {
  const s = normalizeSiret(siret);
  if (!/^\d{14}$/.test(s)) {
    return { ok: false, message: "SIRET au mauvais format." };
  }

  try {
    const url = `${API_BASE}?q=${s}&page=1&per_page=1`;
    // Timeout 8s pour ne pas bloquer si l'API est lente
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
      // Pas de revalidation Next ici — c'est un appel dynamique dans une
      // server action, on veut juste un fetch standard
      cache: "no-store",
    }).finally(() => clearTimeout(tid));

    if (!res.ok) {
      return {
        ok: false,
        message: `API recherche-entreprises a répondu ${res.status}.`,
      };
    }

    const data = (await res.json()) as {
      results?: Array<{
        siren: string;
        nom_complet?: string;
        nom_raison_sociale?: string;
        activite_principale?: string;
        libelle_activite_principale?: string;
        etat_administratif?: string;
        siege?: {
          siret?: string;
          activite_principale?: string;
          libelle_activite_principale?: string;
          adresse?: string;
          code_postal?: string;
          libelle_commune?: string;
          etat_administratif?: string;
        };
        matching_etablissements?: Array<{
          siret: string;
          adresse?: string;
          code_postal?: string;
          libelle_commune?: string;
          etat_administratif?: string;
          activite_principale?: string;
          libelle_activite_principale?: string;
        }>;
      }>;
    };

    const result = data.results?.[0];
    if (!result) {
      return { ok: false, message: "Aucune entreprise trouvée pour ce SIRET." };
    }

    // Si on a un matching_etablissements, on préfère ses données (plus précises
    // pour le SIRET exact recherché). Sinon on retombe sur siège.
    const match = result.matching_etablissements?.[0];
    const fallback = result.siege ?? {};

    const matchedSiret = match?.siret ?? fallback.siret ?? s;
    const state =
      (match?.etat_administratif ?? fallback.etat_administratif) === "A"
        ? "active"
        : (match?.etat_administratif ?? fallback.etat_administratif) === "F"
        ? "ceased"
        : "unknown";

    return {
      ok: true,
      company: {
        siret: matchedSiret,
        siren: result.siren,
        companyName:
          result.nom_complet ??
          result.nom_raison_sociale ??
          "(nom indisponible)",
        activity:
          match?.libelle_activite_principale ??
          fallback.libelle_activite_principale ??
          result.libelle_activite_principale ??
          null,
        state,
        address: match?.adresse ?? fallback.adresse ?? null,
        postalCode: match?.code_postal ?? fallback.code_postal ?? null,
        city: match?.libelle_commune ?? fallback.libelle_commune ?? null,
      },
    };
  } catch (err) {
    console.error("[insee] lookup failed:", err);
    return {
      ok: false,
      message: "Impossible de contacter l'annuaire des entreprises.",
    };
  }
}
