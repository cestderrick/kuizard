"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Encart proéminent en haut de la home : "J'ai un code pour participer"
 * Sticky-ish (en bandeau sous le hero) avec input 6 chiffres + bouton GO.
 * Au submit : redirect vers /q/{code} (la page joueur publique).
 */
export function PlayerCodeCTA() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Le code Kuizard fait exactement 6 caractères alphanumériques uppercase.
    // L'alphabet exclut les caractères ambigus (0, O, 1, I, L).
    const cleaned = code.trim().toUpperCase().replace(/\s/g, "");
    if (cleaned.length !== 6) {
      setError("Le code doit faire 6 caractères. Vérifie ton affiche/QR.");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      setError("Le code doit contenir uniquement des lettres et chiffres.");
      return;
    }
    setError(null);
    router.push(`/q/${cleaned}`);
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-3xl p-6 md:p-8 shadow-2xl border-2 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--color-violet-deep) 0%, var(--color-violet-primary) 100%)",
            borderColor: "var(--color-gold)",
          }}
        >
          {/* Halo doré */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(230, 180, 34, 0.35) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row gap-5 md:items-center">
            <div className="flex-1 min-w-0">
              <p
                className="text-xs uppercase tracking-[3px] font-bold mb-2"
                style={{ color: "#f5cc3a" }}
              >
                🎩 Tu es invité à un quizz ?
              </p>
              {/* Note : on évite class font-display car mon CSS magic-show
                  applique un gradient violet→or sur les h2.font-display qui
                  rend le texte invisible sur fond violet. Ici on utilise
                  font-sans + couleur claire forcée. */}
              <p
                className="text-xl md:text-2xl font-bold tracking-tight"
                style={{ color: "#ffffff" }}
              >
                Saisis ton code et c'est parti
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "#e9d5ff" }}
              >
                Le code à 6 caractères est sur ton affiche, ton QR code ou ton
                invitation.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 shrink-0"
            >
              <input
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="K3PNRT"
                value={code}
                onChange={(e) => {
                  // Filtre : on ne garde que les caractères alphanumériques
                  // et on uppercase à la volée pour matcher le format du code.
                  const raw = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                  setCode(raw.slice(0, 6));
                  setError(null);
                }}
                maxLength={6}
                pattern="[A-Z0-9]{6}"
                className="rounded-xl px-4 py-3 text-lg font-bold font-mono tracking-[6px] text-center bg-white text-[var(--color-violet-deep)] border-2 border-transparent focus:outline-none focus:border-[var(--color-gold)] w-full sm:w-[180px]"
                aria-label="Code du quizz (6 caractères)"
              />
              <button
                type="submit"
                className="rounded-xl px-6 py-3 font-bold text-sm whitespace-nowrap transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-violet-deep)",
                }}
              >
                🚀 Rejoindre
              </button>
            </form>
          </div>

          {error && (
            <p
              className="relative z-10 mt-3 text-sm text-amber-300 font-semibold"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
