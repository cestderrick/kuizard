import { ImageResponse } from "next/og";

// Route GET /og-image qui retourne un PNG 1200x630 généré dynamiquement.
// Next.js compile le JSX en PNG via ImageResponse (Vercel/satori sous le capot).
// L'avantage vs un SVG statique : tous les agrégateurs sociaux (WhatsApp, iMessage,
// Slack, LinkedIn) supportent parfaitement le PNG. Le SVG OG est souvent rejeté.

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

const SIZE = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3D1786 0%, #5523BB 100%)",
          color: "#F5F0FF",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Halo doré derrière le titre */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 65%)",
          }}
        />

        {/* Chapeau magicien stylisé (formes simples car satori n'aime pas les SVG complexes) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          {/* Cône du chapeau */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "60px solid transparent",
              borderRight: "60px solid transparent",
              borderBottom: "100px solid #1F1731",
              position: "relative",
            }}
          />
          {/* Étoile dorée sur le chapeau */}
          <div
            style={{
              fontSize: 48,
              color: "#F59E0B",
              marginTop: -85,
              fontWeight: 900,
            }}
          >
            ★
          </div>
          {/* Base / bord du chapeau */}
          <div
            style={{
              marginTop: -2,
              width: 200,
              height: 30,
              background: "#1F1731",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Titre KUIZARD */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: 12,
            color: "#F5F0FF",
            textShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          KUIZARD
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontStyle: "italic",
            color: "#F59E0B",
            marginTop: 20,
          }}
        >
          pour un moment magique ✨
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 22,
            color: "#A78BFA",
            marginTop: 30,
            letterSpacing: 4,
          }}
        >
          kuizard.com
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "Cache-Control":
          "public, immutable, no-transform, max-age=31536000, s-maxage=31536000",
      },
    }
  );
}
