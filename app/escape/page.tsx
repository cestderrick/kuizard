import type { Metadata } from "next";
import Link from "next/link";

import { PublicNavbar } from "@/components/nav/public-navbar";
import { SiteFooter } from "@/components/legal/site-footer";

export const metadata: Metadata = {
  title: "🗝️ Escape games digitaux multi-équipes — Kuizard",
  description:
    "Lance un escape game 100% digital sur smartphone : énigmes séquentielles, chrono live, indices déblocables, classement des équipes en temps réel. Parfait pour mariages, EVJF, team building, anniversaires.",
  openGraph: {
    title: "🗝️ Kuizard Escape — Escape games digitaux multi-équipes",
    description:
      "Énigmes en séquence, chrono, indices déblocables, classement live. Rejoins avec un simple code.",
    url: "/escape",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: "🧩",
    title: "Énigmes en séquence",
    desc: "Chaque équipe déroule les énigmes une par une. Réponds correctement pour passer à la suivante. Format QCM ou réponse libre.",
  },
  {
    icon: "👥",
    title: "Multi-équipes en simultané",
    desc: "Toutes les équipes rejoignent avec le même code, jouent en même temps. Classement live en fin de partie.",
  },
  {
    icon: "⏱️",
    title: "Chrono partagé",
    desc: "Chaque escape a son propre chrono global (ex: 60 min). Course contre la montre pour tout le monde.",
  },
  {
    icon: "💡",
    title: "Indices déblocables",
    desc: "Une équipe bloquée peut débloquer un indice — mais au prix de quelques points. Balance parfaite entre challenge et progression.",
  },
  {
    icon: "📱",
    title: "Zéro app à installer",
    desc: "Chaque joueur ouvre le lien dans son navigateur. QR code partageable, cookie session pour reprendre après une coupure.",
  },
  {
    icon: "🎨",
    title: "Bibliothèque de scénarios",
    desc: "Choisis un scénario prêt à l'emploi dans la bibliothèque (mariage, EVJF, halloween…) ou crée le tien avec l'éditeur intuitif.",
  },
];

const HOWTO = [
  {
    n: 1,
    title: "Crée ton escape ou pioche dans la bibliothèque",
    desc: "Éditeur simple : titre, chrono, énigmes séquentielles avec type texte/QCM. Ou duplique un scénario prêt.",
  },
  {
    n: 2,
    title: "Partage le code aux équipes",
    desc: "Chaque équipe rentre le code, choisit son nom + les prénoms. Elles jouent en simultané sans se voir.",
  },
  {
    n: 3,
    title: "Chrono tourne, énigmes défilent",
    desc: "Les équipes progressent à leur rythme, débloquent des indices si nécessaire. Toi tu vois le classement live.",
  },
  {
    n: 4,
    title: "Classement final",
    desc: "L'équipe la plus rapide + qui a le meilleur score gagne. Les prénoms des joueurs apparaissent au tableau.",
  },
];

const USE_CASES = [
  { emoji: "💍", label: "Mariage" },
  { emoji: "🎉", label: "EVJF / EVG" },
  { emoji: "🏢", label: "Team building" },
  { emoji: "🎂", label: "Anniversaire" },
  { emoji: "🎃", label: "Halloween" },
  { emoji: "🎄", label: "Noël" },
];

export default function EscapePage() {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen">
        {/* HERO */}
        <section
          className="py-16 md:py-24 text-center px-4"
          style={{
            background:
              "linear-gradient(180deg, var(--color-lavender) 0%, transparent 100%)",
          }}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <p
              className="text-xs uppercase tracking-[3px] font-bold"
              style={{ color: "var(--color-violet-primary)" }}
            >
              🗝️ Escape games digitaux
            </p>
            <h1
              className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              L&apos;escape game qui tient dans une poche
            </h1>
            <p className="text-lg md:text-xl opacity-80 leading-relaxed">
              Énigmes en séquence, chrono live, indices déblocables, classement
              multi-équipes en temps réel. Sur smartphone, zéro app. Pour
              mariage, EVJF, team building, anniversaire.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <Link
                href="/dashboard/escapes/library"
                className="rounded-lg px-6 py-3 text-base font-bold hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                📖 Voir les scénarios
              </Link>
              <Link
                href="/dashboard/escapes"
                className="rounded-lg px-6 py-3 text-base font-bold border-2 hover:bg-violet-50"
                style={{
                  borderColor: "var(--color-violet-primary)",
                  color: "var(--color-violet-primary)",
                }}
              >
                ✏️ Créer le mien
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap justify-center mt-4 opacity-80">
              {USE_CASES.map((u) => (
                <span
                  key={u.label}
                  className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium border"
                >
                  {u.emoji} {u.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-center mb-3"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Ce que Kuizard Escape fait pour toi
            </h2>
            <p className="text-center opacity-70 mb-10 max-w-2xl mx-auto">
              Toute la magie d&apos;un vrai escape game, sans matos ni maître du
              jeu. Digital, multi-équipes, chrono, indices — tout est là.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border bg-white p-5 flex flex-col gap-2 hover:shadow-md transition"
                >
                  <div className="text-3xl">{f.icon}</div>
                  <h3
                    className="font-display text-lg"
                    style={{ color: "var(--color-violet-deep)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOWTO */}
        <section
          className="py-16 px-4"
          style={{
            background: "linear-gradient(180deg, transparent, var(--color-lavender))",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-center mb-3"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Comment ça marche
            </h2>
            <p className="text-center opacity-70 mb-10">
              4 étapes, du dev créatif à la victoire de la meilleure équipe.
            </p>
            <ol className="flex flex-col gap-4">
              {HOWTO.map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border bg-white p-5 flex items-start gap-4"
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-xl font-bold"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "var(--color-violet-deep)",
                    }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">
            <h2
              className="font-display text-3xl md:text-4xl font-bold"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Prêt à lancer ton premier escape ?
            </h2>
            <p className="opacity-80">
              Créer un compte gratuit, pioche dans la bibliothèque ou crée ton
              propre scénario, invite tes équipes. C&apos;est parti.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <Link
                href="/signup"
                className="rounded-lg px-6 py-3 text-base font-bold hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                ✨ Créer un compte gratuit
              </Link>
              <Link
                href="/tarifs#abonnements"
                className="rounded-lg px-6 py-3 text-base font-bold border-2 hover:bg-violet-50"
                style={{
                  borderColor: "var(--color-violet-primary)",
                  color: "var(--color-violet-primary)",
                }}
              >
                💳 Voir les tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
