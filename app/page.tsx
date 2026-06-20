import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/home/video-embed";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { PublicStats } from "@/components/stats/public-stats";
import { getMessages } from "@/lib/i18n/get-locale";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { getActivePlans } from "@/lib/plans/config";
import { formatStripeAmount } from "@/lib/stripe/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "@/components/nav/user-menu";
import { DashboardNavLink } from "@/components/nav/dashboard-nav-link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getActiveWeeklyFeatured } from "@/lib/weekly/featured";
import { WeeklyFeaturedCard } from "@/components/home/weekly-featured-card";
import { PlayerCodeCTA } from "@/components/home/player-code-cta";
import { getSettings, SETTING_KEYS } from "@/lib/site-settings";
import { PublicNavbar } from "@/components/nav/public-navbar";

// V42 : les URLs vidéos sont maintenant éditables depuis /admin/site-settings.
// Default seedé : la vidéo de présentation Shorts. Si admin supprime, la
// page affiche le placeholder "à venir".
const DEFAULT_VIDEO_INTRO = "https://youtube.com/shorts/lsISJqYt8EQ";

// STEPS et USE_CASES sont maintenant construits dynamiquement depuis les
// traductions (voir le composant Home()). Les emojis restent en dur.

const STEP_ICONS = ["🪄", "📲", "🏆"];
const USECASE_EMOJIS = ["💍", "🎉", "👰", "🍻", "👶", "🎓"];

export default async function Home() {
  const [session, messages, oneShotPlans, subscriptionPlans, weeklyFeatured, settings] =
    await Promise.all([
      auth(),
      getMessages(),
      getActivePlans("one_shot"),
      getActivePlans("subscription"),
      getActiveWeeklyFeatured(),
      getSettings([
        SETTING_KEYS.videoIntro,
        SETTING_KEYS.videoCreation,
        SETTING_KEYS.videoJoueur,
      ]),
    ]);
  // V42 : URLs vidéos pilotées par l'admin. Fallback sur la valeur seedée
  // pour l'intro (pour ne jamais avoir une page vide au 1er déploiement).
  const VIDEO_INTRO: string | null =
    settings[SETTING_KEYS.videoIntro] ?? DEFAULT_VIDEO_INTRO;
  const VIDEO_CREATION: string | null = settings[SETTING_KEYS.videoCreation] ?? null;
  const VIDEO_JOUEUR: string | null = settings[SETTING_KEYS.videoJoueur] ?? null;
  const isLoggedIn = !!session?.user;
  const t = messages.home;
  const navT = messages.nav;
  const footerT = messages.footer;
  const year = new Date().getFullYear();

  // Si connecté, on lit le rôle admin pour proposer l'accès admin dans le menu
  const me = isLoggedIn
    ? await prisma.user.findUnique({
        where: { id: session!.user!.id },
        select: { role: true },
      })
    : null;
  const isAdmin = me?.role === "ADMIN";

  // Sections dynamiques construites depuis les traductions
  const STEPS = [
    {
      icon: STEP_ICONS[0],
      title: t.step1_title ?? "Crée ton quizz",
      desc: t.step1_desc ?? "",
    },
    {
      icon: STEP_ICONS[1],
      title: t.step2_title ?? "Partage le QR code",
      desc: t.step2_desc ?? "",
    },
    {
      icon: STEP_ICONS[2],
      title: t.step3_title ?? "Découvrez le classement",
      desc: t.step3_desc ?? "",
    },
  ];

  const USE_CASES = [
    {
      emoji: USECASE_EMOJIS[0],
      title: t.usecase_wedding_title ?? "Mariages",
      desc: t.usecase_wedding_desc ?? "",
    },
    {
      emoji: USECASE_EMOJIS[1],
      title: t.usecase_birthday_title ?? "Anniversaires",
      desc: t.usecase_birthday_desc ?? "",
    },
    {
      emoji: USECASE_EMOJIS[2],
      title: t.usecase_bachelor_title ?? "EVJF / EVG",
      desc: t.usecase_bachelor_desc ?? "",
    },
    {
      emoji: USECASE_EMOJIS[3],
      title: t.usecase_bar_title ?? "Bars & restos",
      desc: t.usecase_bar_desc ?? "",
    },
    {
      emoji: USECASE_EMOJIS[4],
      title: t.usecase_baby_title ?? "Baby-shower",
      desc: t.usecase_baby_desc ?? "",
    },
    {
      emoji: USECASE_EMOJIS[5],
      title: t.usecase_corp_title ?? "Séminaires & teams",
      desc: t.usecase_corp_desc ?? "",
    },
  ];

  return (
    <div className="flex-1 flex flex-col relative">
      <TopLocaleBar variant="light" />

      {/* ============================================ */}
      {/* V42.1 — Navbar unique via PublicNavbar (source de vérité) */}
      {/* Retourne null si non connecté → la home affiche son top-bar locale */}
      {/* ============================================ */}
      <PublicNavbar />

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative overflow-hidden">
        {/* Halos décoratifs retirés — créaient un dégradé violet/or visible
            au moment où le hero finissait (un côté de l'écran tirait sur le
            violet, l'autre sur le crème). Le fond est maintenant uni. */}
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <KuizardLogo size={84} />
          </div>
          <p className="text-sm tracking-[0.3em] uppercase text-[var(--color-violet-primary)] font-semibold mb-6">
            {t.eyebrow}
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-[var(--color-violet-deep)] mb-4 tracking-wide">
            Kuizard
          </h1>
          <p className="text-lg md:text-xl italic text-[var(--color-violet-primary)] mb-8">
            {t.hero_title_2}
          </p>
          <p className="text-base md:text-lg text-[var(--color-foreground)] max-w-2xl mx-auto leading-relaxed mb-10">
            {t.hero_subtitle}
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
                  {navT.dashboard} ✨
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
                  <Link href="/signup">{navT.signup} ✨</Link>
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
                  <Link href="/login">{navT.login}</Link>
                </Button>
              </>
            )}
          </div>

          {/* PLAYER CTA — juste avant la vidéo pour un accès direct */}
          <div className="w-full max-w-2xl mb-8">
            <PlayerCodeCTA />
          </div>

          <div className="w-full max-w-2xl">
            <VideoEmbed
              src={VIDEO_INTRO}
              title="Découvre Kuizard en 1 minute"
              aspectRatio="9:16"
              caption="✨ Kuizard, l'essentiel en moins d'une minute"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS PUBLIQUES (si activé par admin) */}
      {/* ============================================ */}
      <section className="py-12 bg-[var(--color-lavender)]">
        <div className="max-w-5xl mx-auto px-6">
          <PublicStats variant="light" />
        </div>
      </section>

      {/* ============================================ */}
      {/* QUIZZ DE LA SEMAINE — affiché si activé côté admin */}
      {/* ============================================ */}
      {weeklyFeatured && <WeeklyFeaturedCard data={weeklyFeatured} />}

      {/* ============================================ */}
      {/* COMMENT ÇA MARCHE */}
      {/* ============================================ */}
      <section className="bg-[var(--color-lavender)] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              {t.how_eyebrow ?? "✨ Comment ça marche"}
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {t.how_title ?? "Trois étapes pour un moment magique"}
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
              {t.forwho_eyebrow ?? "✨ Pour qui"}
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {t.forwho_title ?? "Tous les moments à partager"}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {t.forwho_subtitle ?? ""}
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
      {/* V46 — TÉMOIGNAGES (faux mais réalistes pour amorcer la com) */}
      {/* ============================================ */}
      <section className="py-20 bg-[var(--color-lavender)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              ⭐ Ils ont fait vibrer leur soirée
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              Témoignages
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Quelques moments magiques organisés avec Kuizard.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                avatar: "⛺",
                name: "Soirée au camping",
                where: "Camping Les Mimosas, Hyères",
                stars: 5,
                quote:
                  "On a fait un blind test avec les vacanciers du camping. Tout le monde a joué depuis son téléphone, même les enfants ! Énorme succès, on remet ça l'an prochain.",
              },
              {
                avatar: "🎂",
                name: "60 ans de Marie",
                where: "Salle des fêtes, Toulouse",
                stars: 5,
                quote:
                  "J'ai créé un quizz sur la vie de ma maman avec des photos de famille. Les 40 invités étaient morts de rire et émus en même temps. Bien plus original qu'un diaporama.",
              },
              {
                avatar: "🎉",
                name: "Anniversaire Frédo",
                where: "Bar Le Comptoir, Lyon",
                stars: 5,
                quote:
                  "30 ans à organiser, 25 potes, un seul lien à partager. Le mode TV branché à la télé du bar a fait toute l'ambiance. Tarif imbattable comparé aux soirées blind test classiques.",
              },
              {
                avatar: "👶",
                name: "Baptême de Carla et Flavio",
                where: "Maison de famille, Bordeaux",
                stars: 5,
                quote:
                  "Quizz personnalisé sur les jumeaux pour leur baptême, avec des questions pour petits et grands. Les parrains/marraines étaient ravis. Super émouvant !",
              },
              {
                avatar: "💍",
                name: "Mariage de Bertrand et Annette",
                where: "Domaine de la Bergerie, Provence",
                stars: 5,
                quote:
                  "On voulait casser le truc classique du dîner. Quizz spécial mariés entre les plats, mode créneau pour ceux qui voulaient rejouer. Tous les invités en parlent encore.",
              },
              {
                avatar: "🍻",
                name: "Soirée d'entreprise",
                where: "Startup tech, Paris",
                stars: 5,
                quote:
                  "Quizz d'onboarding des nouveaux arrivants, 70 personnes en équipes. Hyper ludique, on a découvert plein d'anecdotes sur les anciens. Nouvelle tradition du vendredi.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-violet-primary), var(--color-violet-deep))",
                    }}
                    aria-hidden
                  >
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-display font-bold text-base tracking-wide truncate"
                      style={{ color: "var(--color-violet-deep)" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.where}
                    </p>
                  </div>
                </div>
                <p className="text-[var(--color-gold)] tracking-widest text-sm">
                  {"★".repeat(t.stars)}
                </p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">
                  « {t.quote} »
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TEASER ESCAPE GAMES (V41) */}
      {/* ============================================ */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(160deg, var(--color-violet-deep) 0%, #1a0e3a 50%, var(--color-night) 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl p-8 sm:p-10 border-2 relative overflow-hidden"
            style={{
              borderColor: "var(--color-gold)",
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(124,58,237,0.18))",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 65%)",
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="text-7xl shrink-0" aria-hidden>
                🗝️
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs uppercase tracking-[3px] font-bold mb-2"
                  style={{ color: "var(--color-gold-light)" }}
                >
                  ✨ Nouveauté en préparation
                </p>
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-wide mb-2"
                  style={{
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                    fontFamily: "var(--font-display, inherit)",
                  }}
                >
                  Kuizard Escape — Escape games à imprimer
                </h2>
                <p className="text-[#e9d5ff] opacity-90 mb-4 leading-relaxed">
                  Bientôt en bêta : des kits escape game personnalisables
                  (surnoms de tes joueurs + ambiance au choix), à imprimer
                  chez toi en quelques clics. Achat à l'unité ou abo Kuizard+.
                </p>
                <a
                  href="/escape"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                >
                  🔮 Découvrir Escape
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VIDEO DEMO JOUEUR */}
      {/* ============================================ */}
      <section
        className="py-20"
        style={{
          background:
            "linear-gradient(160deg, rgba(167, 139, 250, 0.18) 0%, rgba(245, 240, 255, 0.5) 50%, rgba(196, 181, 253, 0.18) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              {t.player_eyebrow ?? "✨ Vu côté joueur"}
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {t.player_title ?? "L'expérience participants"}
            </h2>
            <p className="text-foreground/80 mt-3 max-w-2xl mx-auto">
              {t.player_subtitle ?? ""}
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
            {t.pricing_eyebrow ?? "✨ Tarifs"}
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3"
            style={{ color: "var(--color-violet-deep)" }}
          >
            {t.pricing_title ?? "Simple et transparent"}
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t.pricing_subtitle ??
              "Gratuit pour essayer, à l'unité pour les événements, en abonnement pour les pros. Sans engagement."}
          </p>

          <div
            className={`grid gap-4 ${
              oneShotPlans.length >= 4
                ? "md:grid-cols-4"
                : oneShotPlans.length === 3
                ? "md:grid-cols-3"
                : "md:grid-cols-2"
            }`}
          >
            {oneShotPlans.map((plan) => ({
              name: plan.name + (plan.isHighlighted ? " ⭐" : ""),
              price:
                plan.priceCents === 0
                  ? "Gratuit"
                  : formatStripeAmount(plan.priceCents),
              desc: plan.description ?? plan.tagline ?? "",
              featured: plan.isHighlighted,
            })).map((p) => (
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
            {t.pricing_footer_pros ??
              "Pour les pros (bars, hôtels, restos, séminaires) : abonnement mensuel ci-dessous."}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* ABONNEMENTS PRO */}
      {/* ============================================ */}
      <section
        className="py-20"
        style={{
          background:
            "linear-gradient(160deg, rgba(196, 181, 253, 0.15) 0%, rgba(245, 240, 220, 0.4) 50%, rgba(212, 160, 23, 0.08) 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-violet-primary)] font-semibold mb-2">
              {t.pro_eyebrow ?? "✨ Abonnements pros"}
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3"
              style={{ color: "var(--color-violet-deep)" }}
            >
              {t.pro_title ?? "Quizz illimités pour ton lieu"}
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              {t.pro_subtitle ??
                "Idéal pour bars, hôtels, restaurants, escape rooms ou tout organisateur d'événements récurrents. Sans engagement, résiliable à tout moment."}
            </p>
          </div>

          {subscriptionPlans.length === 0 ? (
            <p className="text-center opacity-70 italic">
              Aucun abonnement actif pour le moment.
            </p>
          ) : (
            <div
              className={`grid gap-5 max-w-3xl mx-auto ${
                subscriptionPlans.length >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"
              }`}
            >
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={
                    plan.isHighlighted
                      ? "rounded-2xl bg-white p-6 flex flex-col gap-4 relative shadow-xl"
                      : "rounded-2xl bg-white p-6 flex flex-col gap-4 shadow-md"
                  }
                  style={
                    plan.isHighlighted
                      ? { border: "2px solid var(--color-gold)" }
                      : { border: "1px solid rgba(167, 139, 250, 0.3)" }
                  }
                >
                  {plan.isHighlighted && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-violet-deep)",
                      }}
                    >
                      ⭐ POPULAIRE
                    </span>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[2px] text-[var(--color-violet-primary)] font-semibold">
                      {plan.name}
                    </p>
                    <p
                      className="font-display text-3xl font-bold mt-1"
                      style={{ color: "var(--color-violet-deep)" }}
                    >
                      {formatStripeAmount(plan.priceCents)}
                      <span className="text-base font-normal opacity-70">
                        {" "}
                        / {plan.interval === "year" ? "an" : "mois"}
                      </span>
                    </p>
                    {plan.tagline && (
                      <p className="text-xs opacity-80 italic mt-1">
                        {plan.tagline}
                      </p>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm opacity-90 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center text-sm">
            <p className="opacity-80">
              {t.pro_footer_note ??
                "✓ Sans engagement  ·  ✓ Résiliation libre  ·  ✓ Pas de reconduction tacite"}
            </p>
            {!isLoggedIn && (
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-violet-deep)",
                  }}
                  className="font-bold"
                >
                  <Link href="/signup">{t.pro_cta_create ?? "Créer un compte pro"}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="bg-gradient-to-br from-[var(--color-violet-deep)] via-[var(--color-night-2)] to-[var(--color-night)] text-[var(--color-lavender)] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3">
            {t.cta_final_title ?? "Lance ton premier quizz maintenant"}
          </h2>
          <p className="text-[var(--color-lavender-2)] opacity-90 mb-8 max-w-xl mx-auto">
            {t.cta_final_subtitle ??
              "Gratuit, sans CB, en 5 minutes chrono. Crée ton compte et offre à tes invités un moment dont ils se souviendront."}
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
              <Link href="/dashboard/quizzes/new">
                {t.cta_final_button_logged_in ?? "+ Créer mon quizz"}
              </Link>
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
              <Link href="/signup">
                {t.cta_final_button_signup ?? "Créer mon compte gratuit ✨"}
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER MINI */}
      {/* ============================================ */}
      <footer className="bg-[var(--color-night)] text-[var(--color-lavender-2)] py-8 px-6 text-center text-xs">
        <p className="mb-3">
          {t.footer_tagline ??
            "Kuizard · pour un moment magique · édité par Projiat"}
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 justify-center mb-3">
          <Link href="/mentions-legales" className="hover:underline">
            {footerT.legal}
          </Link>
          <span>·</span>
          <Link href="/cgu" className="hover:underline">
            {footerT.cgu}
          </Link>
          <span>·</span>
          <Link href="/cgv" className="hover:underline">
            {footerT.cgv}
          </Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:underline">
            {footerT.privacy}
          </Link>
          <span>·</span>
          <Link href="/cookies" className="hover:underline">
            {footerT.cookies}
          </Link>
          <span>·</span>
          <Link href="/aide" className="hover:underline">
            {t.footer_help ?? "💬 Aide"}
          </Link>
          <span>·</span>
          <Link href="/suggestion" className="hover:underline">
            {t.footer_suggestion ?? "✨ Suggestion"}
          </Link>
        </nav>
        <p className="opacity-60">
          {(t.footer_copyright ?? "© {year} Projiat — Tous droits réservés.").replace(
            "{year}",
            String(year)
          )}
        </p>
      </footer>
    </div>
  );
}
