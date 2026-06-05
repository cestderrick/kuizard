// =============================================
// Logo Kuizard (vrai SVG du designer)
// =============================================
// Fichier source : /public/logo.svg (silhouette en path unique, fill #5523BB)

type Props = {
  size?: number;
  className?: string;
};

export function KuizardLogo({ size = 40, className }: Props) {
  return (
    <img
      src="/logo.svg"
      alt="Kuizard"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
    />
  );
}

/**
 * Logo + texte « Kuizard » côte à côte (utile dans les headers/footers).
 */
export function KuizardLogomark({
  size = 32,
  showText = true,
  textColorClass = "text-[var(--color-violet-deep)]",
}: {
  size?: number;
  showText?: boolean;
  textColorClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <KuizardLogo size={size} />
      {showText && (
        <span
          className={`font-display text-xl font-bold tracking-[2px] ${textColorClass}`}
        >
          Kuizard
        </span>
      )}
    </span>
  );
}
