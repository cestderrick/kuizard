/**
 * Logo Projiat — SVG inline en monogramme "ITA" (Italie / Identity ?).
 * Recréé à partir du visuel envoyé : un grand "I" serif avec un "T"
 * en haut à droite et un "A" en bas à droite. Utilisé dans le footer.
 */
export function ProjiatLogo({
  size = 18,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  // Ratio largeur / hauteur = ~1.45
  const width = Math.round(size * 1.45);
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 145 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Projiat"
      role="img"
    >
      {/* I serif central */}
      <text
        x="0"
        y="88"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="100"
        fontWeight="bold"
        fill={color}
      >
        I
      </text>
      {/* T en haut à droite */}
      <text
        x="75"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="38"
        fontWeight="bold"
        fill={color}
      >
        T
      </text>
      {/* A en bas à droite */}
      <text
        x="75"
        y="85"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="38"
        fontWeight="bold"
        fill={color}
      >
        A
      </text>
    </svg>
  );
}
