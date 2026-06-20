import type { PlanConfigDTO, PlanLimits } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";

/**
 * Définit une feature affichée sur le tableau comparatif.
 *
 * - "number" : on lit `limits[field]` et on affiche le nombre (ou "∞" si undefined)
 * - "boolean" : on lit `limits[field]` et on affiche ✓ ou ✗
 *
 * Les features doivent être ordonnées du plus "basique" (inclus dans le plan
 * gratuit) au plus "avancé" (inclus seulement dans les plans hauts). Ainsi le
 * tableau a un effet d'escalier : la colonne gratuite a ses ✓ en haut, les
 * colonnes payantes ont leurs ✓ qui descendent.
 */
export type CompareFeature = {
  label: string;
  field: keyof PlanLimits;
  type: "number" | "boolean";
  /** Si la value du field est undefined, faut-il afficher "∞" ou "✗" ? */
  undefinedMeans: "infinite" | "missing";
};

const ONE_SHOT_FEATURES: CompareFeature[] = [
  { label: "Nombre de questions", field: "maxQuestions", type: "number", undefinedMeans: "infinite" },
  { label: "Nombre de joueurs", field: "maxParticipants", type: "number", undefinedMeans: "infinite" },
  { label: "Classement avec podium", field: "ranking", type: "boolean", undefinedMeans: "missing" },
  { label: "Couleur personnalisée", field: "customColors", type: "boolean", undefinedMeans: "missing" },
  { label: "Message de fin custom", field: "finalMessage", type: "boolean", undefinedMeans: "missing" },
  { label: "Photo de couverture", field: "coverImage", type: "boolean", undefinedMeans: "missing" },
  { label: "Photos par question", field: "questionImages", type: "boolean", undefinedMeans: "missing" },
  { label: "Mode créneau programmé", field: "scheduledMode", type: "boolean", undefinedMeans: "missing" },
  { label: "Lots personnalisés", field: "customPrizes", type: "boolean", undefinedMeans: "missing" },
  { label: "Mode live (pilotage)", field: "liveMode", type: "boolean", undefinedMeans: "missing" },
  { label: "Affichage TV", field: "tvDisplay", type: "boolean", undefinedMeans: "missing" },
];

const SUBSCRIPTION_FEATURES: CompareFeature[] = [
  { label: "Quizz actifs simultanément", field: "maxActiveQuizzes", type: "number", undefinedMeans: "infinite" },
  { label: "Joueurs par session", field: "maxParticipants", type: "number", undefinedMeans: "infinite" },
  { label: "Templates + Quizzthèque / mois", field: "maxTemplatesPerMonth", type: "number", undefinedMeans: "infinite" },
  { label: "Classement avec podium", field: "ranking", type: "boolean", undefinedMeans: "missing" },
  { label: "Photos illimitées", field: "questionImages", type: "boolean", undefinedMeans: "missing" },
  { label: "Mode live + affichage TV", field: "liveMode", type: "boolean", undefinedMeans: "missing" },
  { label: "Personnalisation totale", field: "customColors", type: "boolean", undefinedMeans: "missing" },
  { label: "Lots personnalisés", field: "customPrizes", type: "boolean", undefinedMeans: "missing" },
];

function renderCell(plan: PlanConfigDTO, feat: CompareFeature) {
  const value = plan.limits[feat.field];

  if (feat.type === "number") {
    if (value === undefined || value === null) {
      return feat.undefinedMeans === "infinite" ? (
        <span className="font-bold text-[var(--color-violet-primary)]">∞</span>
      ) : (
        <Cross />
      );
    }
    return (
      <span className="font-bold text-[var(--color-violet-deep)]">
        {String(value)}
      </span>
    );
  }
  // boolean
  if (value === true) return <Check />;
  return <Cross />;
}

function Check() {
  return (
    <span
      aria-label="Inclus"
      className="inline-flex items-center justify-center w-6 h-6 rounded-full"
      style={{
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        color: "rgb(21, 128, 61)",
      }}
    >
      ✓
    </span>
  );
}
function Cross() {
  return (
    <span
      aria-label="Non inclus"
      className="inline-flex items-center justify-center w-6 h-6 rounded-full"
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        color: "rgb(185, 28, 28)",
      }}
    >
      ✗
    </span>
  );
}

/**
 * Tableau comparatif des offres à l'unité.
 */
export function OneShotCompareTable({ plans }: { plans: PlanConfigDTO[] }) {
  return <CompareTable plans={plans} features={ONE_SHOT_FEATURES} />;
}

/**
 * Tableau comparatif des abonnements.
 */
export function SubscriptionCompareTable({ plans }: { plans: PlanConfigDTO[] }) {
  return <CompareTable plans={plans} features={SUBSCRIPTION_FEATURES} />;
}

function CompareTable({
  plans,
  features,
}: {
  plans: PlanConfigDTO[];
  features: CompareFeature[];
}) {
  if (plans.length === 0) {
    return (
      <p className="text-center text-muted-foreground italic">
        Aucune offre active pour le moment.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl bg-white border">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-violet-100">
            <th className="text-left p-4 font-semibold text-muted-foreground"></th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={`text-center p-4 align-bottom ${
                  plan.isHighlighted
                    ? "bg-gradient-to-b from-[var(--color-gold)]/10 to-transparent"
                    : ""
                }`}
              >
                {plan.isHighlighted && (
                  <p className="text-[10px] uppercase tracking-[3px] text-[var(--color-gold)] font-bold mb-1">
                    ⭐ Recommandé
                  </p>
                )}
                <p
                  className="font-display text-lg tracking-wide"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {plan.name}
                </p>
                <p
                  className="font-display text-2xl font-bold mt-1"
                  style={{ color: "var(--color-violet-primary)" }}
                >
                  {plan.priceCents === 0
                    ? "Gratuit"
                    : formatStripeAmount(plan.priceCents)}
                  {plan.type === "subscription" && plan.priceCents > 0 && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      / {plan.interval === "year" ? "an" : "mois"}
                    </span>
                  )}
                </p>
                {plan.tagline && (
                  <p className="text-xs text-muted-foreground italic mt-1 max-w-[140px] mx-auto leading-snug">
                    {plan.tagline}
                  </p>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feat, i) => (
            <tr
              key={feat.label}
              className={i % 2 === 0 ? "bg-violet-50/30" : "bg-white"}
            >
              <td className="p-3 px-4 font-medium text-foreground">
                {feat.label}
              </td>
              {plans.map((plan) => (
                <td
                  key={plan.id}
                  className={`p-3 text-center ${
                    plan.isHighlighted ? "bg-[var(--color-gold)]/5" : ""
                  }`}
                >
                  {renderCell(plan, feat)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
