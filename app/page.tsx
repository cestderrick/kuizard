import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/home/video-embed";

// 👉 Pour activer une vidéo plus tard, remplace `null` par une URL (YouTube
// embed, Vimeo, ou .mp4 direct). Exemples :
//   - "https://www.youtube.com/embed/dQw4w9WgXcQ"
//   - "/videos/intro.mp4"
const VIDEO_INTRO: string | null = null;
const VIDEO_CREATION: string | null = null;
const VIDEO_JOUEUR: string | null = null;

const STEPS = [
  {
    icon: "🪄",
    title: "Crée ton quizz",
    desc: "Titre, questions, photos, lots, couleurs… Tout est personnalisable en quelques minutes.",
  },
  {
    icon: "📲",
    title: "Partage le lien et le QR code",
    desc: "Tes invités scannent le QR code et arrivent direct sur ton quizz. Pas d'app à installer.",
  },
  {
    icon: "🏆",
    title: "Découvrez le classement",
    desc: "À la fin, podium des 3 premiers et classement complet avec les lots que tu as configurés.",
  },
];

const USE_CASES = [
  {
    emoji: "💍",
    title: "Mariages",
    desc: "Quiz sur les mariés pendant le repas. Photos d'enfance, anecdotes, défi des témoins.",
  },
  {
    emoji: "🎉",
    title: "Anniversaires",
    desc: "Animation pour fêter une étape (30, 40, 50 ans…). Souvenirs partagés entre amis et famille.",
  },
  {
    emoji: "👰",
    title: "EVJF / EVG",
    desc: "« À quel point connais-tu la mariée ? » Photos, goûts, manies. Fous rires garantis.",
  },
  {
    emoji: "🍻",
    title: "Bars & restos",
    desc: "Soirées quizz hebdomadaires, blind-tests, animations d'équipe. Mode live pour piloter en direct.",
  },
  {
    emoji: "👶",
    title: "Baby-shower / naissance",
    desc: "Tout savoir sur les futurs parents. Devine le prénom, le poids, les premières aventures.",
  },
  {
    emoji: "🎓",
    title: "Séminaires & teams",
    desc: "Brise-glace, animations d'événements pros, formations ludiques. Idéal pour les groupes.",
  },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex-1 flex flex-col">
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(217, 70, 239, 0.15) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center flex flex-col items-center">
          <p className="text-sm tracking-[0.3em] uppercase text-[var(--color-violet-primary)] font-semibold mb-6">
            ✨ Bienvenue ✨
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-[var(--color-violet-deep)] mb-4 tracking-wide">
            Kuizard
          </h1>
          <p className="text-lg md:text-xl italic text-[var(--color-violet-primary)] mb-8">
            pour un moment magique
          </p>
          <p className="text-base md:text-lg text-[var(--color-foreground)] max-w-2xl mx-auto leading-relaxed mb-10">
            Crée des quizz personnalisés pour tes événements (mariage,
            anniversaire, EVJF…) ou ton bar. Partage en un QR code, ajoute des
            lots, vois le classement en direct.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            {isLoggedIn ? (
              <Button
                asChild
                size="lg"
                style={{
                  backgroundColor: "var(--color-violet-primary)",
                  color: "white",
                }}
              >
                <Link href="/dashboard">
                  Aller à mon tableau de bord ✨
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  style={{
                    backgroundColor: "var(--color-violet-primary)",
                    color: "white",
                  }}
                >
                  <Link href="/signup">Créer un compte gratuit ✨</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: "var(--color-violet-primary)",
                    color: "var(--color-violet-primary)",
                  }}
                >
                  <Link href="/login">Se connecter</Link>
                </Button>
              </>
            )}
          </div>

          <div className="w-full max-w-2xl">
            <VideoEmbed
              src={VIDEO_INTRO}
              title="Découvre Kuizard en 1 minute"
              caption="Une vidéo de présentation arrive bientôt"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMMENT ÇA MARCHE */}
      {/* ============================================ */}
      <section className="bg-[var(--color-lavender)] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              ✨ Comment ça marche
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Trois étapes pour un moment magique
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-white rounded-2xl p-6 text-center shadow-sm relative"
              >
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{
                    backgroundColor: "var(--color-violet-primary)",
                  }}
                >
                  {i + 1}
                </div>
                <div className="text-5xl mb-3 mt-2" aria-hidden>
                  {step.icon}
                </div>
                <h3
                  className="font-display text-lg tracking-wide mb-2"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <VideoEmbed
              src={VIDEO_CREATION}
              title="Création d'un quizz, pas-à-pas"
              caption="Démo de l'éditeur — disponible bientôt"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* POUR QUI */}
      {/* ============================================ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              ✨ Pour qui
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Tous les moments à partager
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Particuliers ou pros, chaque occasion devient une animation
              magique avec son quizz dédié.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((u) => (
              <div
                key={u.title}
                className="rounded-2xl p-5 border bg-white hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2" aria-hidden>
                  {u.emoji}
                </div>
                <h3
                  className="font-display text-lg tracking-wide mb-1"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {u.title}
                </h3>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VIDEO DEMO JOUEUR */}
      {/* ============================================ */}
      <section className="bg-[var(--color-night)] text-[var(--color-lavender)] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
              ✨ Vu côté joueur
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-[var(--color-lavender)]">
              L'expérience participants
            </h2>
            <p className="text-[var(--color-lavender-2)] opacity-80 mt-3 max-w-2xl mx-auto">
              Mobile-first, pas d'app à installer. Scan, pseudo, jeu, score —
              c'est tout.
            </p>
          </div>
          <VideoEmbed
            src={VIDEO_JOUEUR}
            title="L'expérience joueur"
            caption="Démo participant — disponible bientôt"
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* TARIFS TEASER */}
      {/* ============================================ */}
      <section className="py-20 bg-[var(--color-lavender)]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
            ✨ Tarifs
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3"
            style={{ color: "var(--color-violet-deep)" }}
          >
            Simple et transparent
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Gratuit pour essayer, à l'unité pour les événements, en abonnement
            pour les pros. Sans engagement.
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                name: "Découverte",
                price: "0 €",
                desc: "5 questions, 15 joueurs",
              },
              {
                name: "Essentiel",
                price: "5 €",
                desc: "20 questions, 30 joueurs",
              },
              {
                name: "Festif ⭐",
                price: "10 €",
                desc: "50 questions, 100 joueurs",
                featured: true,
              },
              {
                name: "Magique",
                price: "15 €",
                desc: "Illimité, vidéos",
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-5 ${
                  p.featured
                    ? "bg-white border-2 shadow-lg"
                    : "bg-white/80 border"
                }`}
                style={
                  p.featured
                    ? { borderColor: "var(--color-gold)" }
                    : undefined
                }
              >
                <h3
                  className="font-display text-base tracking-wide mb-2"
                  style={{ color: "var(--color-violet-deep)" }}
                >
                  {p.name}
                </h3>
                <p
                  className="font-display text-2xl font-bold mb-1"
                  style={{ color: "var(--color-violet-primary)" }}
                >
                  {p.price}
                </p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 italic">
            Abonnement bars : à partir de 25 €/mois, multi-lieux. Page tarifs
            détaillée à venir.
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="bg-gradient-to-br from-[var(--color-violet-deep)] via-[var(--color-night-2)] to-[var(--color-night)] text-[var(--color-lavender)] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3">
            Lance ton premier quizz maintenant
          </h2>
          <p className="text-[var(--color-lavender-2)] opacity-90 mb-8 max-w-xl mx-auto">
            Gratuit, sans CB, en 5 minutes chrono. Crée ton compte et offre à
            tes invités un moment dont ils se souviendront.
          </p>

          {isLoggedIn ? (
            <Button
              asChild
              size="lg"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-bold"
            >
              <Link href="/dashboard/quizzes/new">+ Créer mon quizz</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-violet-deep)",
              }}
              className="font-bold"
            >
              <Link href="/signup">Créer mon compte gratuit ✨</Link>
            </Button>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER MINI */}
      {/* ============================================ */}
      <footer className="bg-[var(--color-night)] text-[var(--color-lavender-2)] py-6 px-6 text-center text-xs">
        <p>
          <span className="font-display tracking-wide">Kuizard</span> · pour un
          moment magique · v0.1
        </p>
        <p className="opacity-60 mt-1">
          Mentions légales, CGU et CGV à venir.
        </p>
      </footer>
    </div>
  );
}
