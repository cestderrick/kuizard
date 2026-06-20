import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { SiteFooter } from "@/components/legal/site-footer";
import { PublicNavbar } from "@/components/nav/public-navbar";

export const metadata: Metadata = {
  title: "Escape — Escape games imprimables · Kuizard",
  description:
    "Bientôt sur Kuizard : des escape games complets à imprimer chez toi. Énigmes, personnages personnalisables avec les surnoms de tes amis, et actions au choix selon l'ambiance que tu veux.",
};

// V41 — Page teasing Escape. Pas encore d'implémentation réelle, juste un
// topo "la beta arrive" + teasing des futures personnalisations + capture
// d'intérêt (lien vers le formulaire suggestions/messages).

const FEATURES = [
  {
    icon: "🖨️",
    title: "À imprimer chez toi",
    desc: "PDF prêt à imprimer en couleur ou noir & blanc. Tu déplies, tu joues. Pas d'app, pas d'écran.",
  },
  {
    icon: "👥",
    title: "Personnalisé avec tes joueurs",
    desc: "Saisis les surnoms de tes amis avant de générer ton kit. Les énigmes les nomment, ils sont les héros de l'aventure.",
  },
  {
    icon: "🎭",
    title: "Actions au choix",
    desc: "À chaque étape, tu choisis l'ambiance (humour, frisson, romantique, déjanté). Le scénario s'adapte avant l'impression.",
  },
  {
    icon: "⏱️",
    title: "30 à 90 minutes",
    desc: "Kits de différentes durées selon ton créneau. Idéal apéro, soirée, anniversaire surprise, EVJF/EVG.",
  },
];

const SCENARIOS = [
  { emoji: "🕵️", title: "Le mystère du manoir", tagline: "Enquête classique" },
  { emoji: "🚀", title: "Évasion spatiale", tagline: "SF & énigmes logiques" },
  { emoji: "🏴‍☠️", title: "Trésor des Caraïbes", tagline: "Aventure pour enfants" },
  { emoji: "💀", title: "Maison hantée", tagline: "Halloween, frissons légers" },
  { emoji: "💑", title: "Le rendez-vous secret", tagline: "Saint-Valentin / couples" },
  { emoji: "🎩", title: "Soirée magique", tagline: "Anniversaire & enfants" },
];

export default async function EscapePage() {
  const session = await auth();
  const isAuth = !!session?.user?.id;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-night)] text-[var(--color-lavender)]">
      {/* V41.3 : Si connecté, on affiche le menu global (sticky en haut). */}
      {/* Si non connecté, fallback minimal pour avoir un lien retour. */}
      <PublicNavbar />
      {!isAuth && (
        <header className="border-b border-[rgba(167,139,250,0.15)] bg-[var(--color-night-2)]">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3 gap-4">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-[2px]"
              style={{ color: "var(--color-lavender)" }}
            >
              ✨ Kuizard
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/"
                className="text-[var(--color-lavender-2)] hover:text-[var(--color-gold)] text-xs uppercase tracking-[2px]"
              >
                ← Retour
              </Link>
              <Link
                href="/login?from=/escape"
                className="text-xs uppercase tracking-[2px] px-3 py-1.5 rounded-lg font-semibold"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-violet-deep)",
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Halos magiques */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p
            className="text-xs uppercase tracking-[3px] font-semibold mb-3"
            style={{ color: "var(--color-gold)" }}
          >
            ✨ Bientôt en bêta sur Kuizard ✨
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide mb-4"
            style={{
              color: "var(--color-lavender)",
              WebkitTextFillColor: "var(--color-lavender)",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            🗝️ Escape
          </h1>
          <p
            className="text-xl sm:text-2xl tracking-wide mb-6"
            style={{ color: "var(--color-gold-light)" }}
          >
            Des escape games à imprimer chez toi.
          </p>
          <p className="text-base sm:text-lg text-[var(--color-lavender-2)] opacity-90 max-w-2xl mx-auto leading-relaxed">
            Choisis un scénario, saisis les <strong>surnoms de tes joueurs</strong>,
            sélectionne <strong>les actions qui collent à ton ambiance</strong>,
            paie une fois, télécharge ton PDF. Tu imprimes, tu déplies, tu joues.
            Aucune app, aucun écran.
          </p>

          {/* Statut beta */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[2px] font-semibold mt-8"
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid var(--color-gold)",
              color: "var(--color-gold-light)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse" />
            Bêta privée ouverte cet été
          </div>
        </div>
      </section>

      {/* TOPO BETA */}
      <section className="py-16 bg-[var(--color-night-2)] border-y border-[rgba(167,139,250,0.15)]">
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="rounded-2xl p-6 sm:p-8 border-2"
            style={{
              borderColor: "var(--color-gold)",
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(85,35,187,0.05))",
            }}
          >
            <p
              className="text-xs uppercase tracking-[3px] font-bold mb-3"
              style={{ color: "var(--color-gold)" }}
            >
              📣 Le topo de la bêta
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4 tracking-wide"
              style={{
                color: "var(--color-lavender)",
                WebkitTextFillColor: "var(--color-lavender)",
                fontFamily: "var(--font-display, inherit)",
              }}
            >
              Une nouvelle catégorie débarque
            </h2>
            <div className="space-y-3 text-[var(--color-lavender-2)] opacity-90 leading-relaxed">
              <p>
                On est en train de concevoir une <strong>collection d'escape
                games imprimables</strong> qui exploiteront la même magie que les
                quizz Kuizard : <strong>personnalisation par joueur</strong>,
                <strong> ambiance modulable</strong>, design soigné, et accessible
                en un clic depuis ton compte.
              </p>
              <p>
                Les premiers kits seront <strong>achetables à l'unité</strong>
                {" "}(comme nos quizz one-shot, prix indicatif <strong>6 à 12 €</strong>),
                ou inclus dans un futur <strong>abonnement Kuizard+</strong> qui
                débloquera la collection complète.
              </p>
              <p>
                Tu veux faire partie des <strong>premiers testeurs</strong> et
                avoir un kit offert ? Envoie-nous un message via la messagerie
                de ton compte, on garde une short-list 💌
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {isAuth ? (
                <Link
                  href="/dashboard/messages"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  💌 Me prévenir au lancement
                </Link>
              ) : (
                <Link
                  href="/signup?from=/escape"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  💌 Créer un compte pour être prévenu
                </Link>
              )}
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border-2"
                style={{
                  borderColor: "rgba(245,158,11,0.4)",
                  color: "var(--color-lavender)",
                }}
              >
                Voir les tarifs Quizz →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CE QUE TU VAS POUVOIR FAIRE */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-[3px] font-semibold mb-2"
              style={{ color: "var(--color-gold)" }}
            >
              ✨ Ce qui rend Kuizard Escape différent
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-wide"
              style={{
                color: "var(--color-lavender)",
                WebkitTextFillColor: "var(--color-lavender)",
                fontFamily: "var(--font-display, inherit)",
              }}
            >
              Imprimable, personnalisable, prêt en 2 minutes
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5 border border-[rgba(167,139,250,0.2)] bg-[var(--color-night-2)]"
              >
                <div className="text-4xl mb-3" aria-hidden>
                  {f.icon}
                </div>
                <h3
                  className="text-lg font-bold tracking-wide mb-2"
                  style={{
                    color: "var(--color-lavender)",
                    WebkitTextFillColor: "var(--color-lavender)",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--color-lavender-2)] opacity-80 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCÉNARIOS EN PRÉPARATION */}
      <section className="py-20 bg-[var(--color-night-2)] border-t border-[rgba(167,139,250,0.15)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-[3px] font-semibold mb-2"
              style={{ color: "var(--color-violet-primary)" }}
            >
              🎲 En préparation
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-wide"
              style={{
                color: "var(--color-lavender)",
                WebkitTextFillColor: "var(--color-lavender)",
                fontFamily: "var(--font-display, inherit)",
              }}
            >
              Les premiers scénarios
            </h2>
            <p className="text-sm text-[var(--color-lavender-2)] opacity-70 mt-3">
              Liste susceptible d'évoluer selon vos retours de la bêta
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <div
                key={s.title}
                className="rounded-xl p-4 border border-[rgba(167,139,250,0.15)] bg-[var(--color-night)] hover:border-[var(--color-gold)]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl shrink-0" aria-hidden>
                    {s.emoji}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ color: "var(--color-lavender)" }}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs text-[var(--color-lavender-2)] opacity-70">
                      {s.tagline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Idée scénario du user */}
          <div className="mt-10 text-center">
            <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mb-3">
              Une idée de scénario qu'on devrait absolument créer ?
            </p>
            <Link
              href={isAuth ? "/dashboard/suggestions" : "/signup?from=/escape"}
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              style={{ color: "var(--color-gold-light)" }}
            >
              💡 Suggère-nous ton thème →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ rapide */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-2xl md:text-3xl font-bold tracking-wide text-center mb-10"
            style={{
              color: "var(--color-lavender)",
              WebkitTextFillColor: "var(--color-lavender)",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            ❓ Questions fréquentes
          </h2>

          <div className="space-y-4">
            <Faq
              q="Quand sort la version finale ?"
              a="Bêta privée prévue pour cet été, ouverture publique dans la foulée selon les retours. Les comptes Kuizard existants seront prévenus en priorité."
            />
            <Faq
              q="Est-ce qu'il faut un compte payant pour acheter un kit ?"
              a="Non. Comme nos quizz one-shot actuels, l'achat sera ponctuel (~6-12 € le kit) et tu télécharges ton PDF immédiatement. Un futur abonnement Kuizard+ donnera accès à toute la collection."
            />
            <Faq
              q="Combien de joueurs minimum / maximum ?"
              a="La plupart des kits seront dimensionnés pour 2 à 8 joueurs, parfait pour une soirée entre amis ou en famille."
            />
            <Faq
              q="Je peux modifier le scénario après achat ?"
              a="Non. Une fois ton PDF généré avec tes surnoms et tes choix d'ambiance, c'est figé. Pense à bien valider ta personnalisation avant de télécharger. Pour une nouvelle variante, il faudra racheter le kit."
            />
            <Faq
              q="C'est en français ou anglais ?"
              a="Français au lancement, anglais prévu dans les mois qui suivent. Si tu en veux dans une autre langue, écris-nous !"
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-[var(--color-night-2)] border-t border-[rgba(167,139,250,0.15)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p
            className="text-xs uppercase tracking-[3px] font-semibold mb-2"
            style={{ color: "var(--color-gold)" }}
          >
            🎁 Bonus pré-lancement
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-wide mb-3"
            style={{
              color: "var(--color-lavender)",
              WebkitTextFillColor: "var(--color-lavender)",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            Le premier kit offert aux testeurs bêta
          </h2>
          <p className="text-[var(--color-lavender-2)] opacity-90 mb-6">
            Les 50 premiers comptes qui demandent leur invitation reçoivent
            le kit n°1 gratuitement et peuvent voter pour le n°2.
          </p>
          {isAuth ? (
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              💌 Je veux mon invitation bêta
            </Link>
          ) : (
            <Link
              href="/signup?from=/escape"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
            >
              ✨ Créer un compte gratuit
            </Link>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-[rgba(167,139,250,0.2)] bg-[var(--color-night-2)] p-4">
      <summary
        className="font-semibold cursor-pointer marker:hidden flex items-center justify-between gap-3"
        style={{ color: "var(--color-lavender)" }}
      >
        <span>{q}</span>
        <span
          className="text-xs text-[var(--color-gold-light)] group-open:rotate-180 transition-transform"
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <p className="text-sm text-[var(--color-lavender-2)] opacity-90 mt-3 leading-relaxed">
        {a}
      </p>
    </details>
  );
}
