import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/home/video-embed";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { PublicStats } from "@/components/stats/public-stats";
import { getMessages } from "@/lib/i18n/get-locale";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";

// 👉 Pour activer une vidéo plus tard, remplace `null` par une URL (YouTube
// embed, Vimeo, ou .mp4 direct). Exemples :
//   - "https://www.youtube.com/embed/dQw4w9WgXcQ"
//   - "/videos/intro.mp4"
const VIDEO_INTRO: string | null = null;
const VIDEO_CREATION: string | null = null;
const VIDEO_JOUEUR: string | null = null;

// STEPS et USE_CASES sont maintenant construits dynamiquement depuis les
// traductions (voir le composant Home()). Les emojis restent en dur.

const STEP_ICONS = ["🪄", "📲", "🏆"];
const USECASE_EMOJIS = ["💍", "🎉", "👰", "🍻", "👶", "🎓"];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const messages = await getMessages();
  const t = messages.home;
  const navT = messages.nav;
  const footerT = messages.footer;
  const year = new Date().getFullYear();

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
      {/* STATS PUBLIQUES (si activé par admin) */}
      {/* ============================================ */}
      <section className="py-12 bg-[var(--color-lavender)]">
        <div className="max-w-5xl mx-auto px-6">
          <PublicStats variant="light" />
        </div>
      </section>

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
      {/* VIDEO DEMO JOUEUR */}
      {/* ============================================ */}
      <section className="bg-[var(--color-night)] text-[var(--color-lavender)] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
              {t.player_eyebrow ?? "✨ Vu côté joueur"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-[var(--color-lavender)]">
              {t.player_title ?? "L'expérience participants"}
            </h2>
            <p className="text-[var(--color-lavender-2)] opacity-80 mt-3 max-w-2xl mx-auto">
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

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                name: t.plan_discovery_name ?? "Découverte",
                price: "0 €",
                desc: t.plan_discovery_desc ?? "5 questions, 15 joueurs",
              },
              {
                name: t.plan_essential_name ?? "Essentiel",
                price: "5 €",
                desc: t.plan_essential_desc ?? "20 questions, 30 joueurs",
              },
              {
                name: t.plan_festive_name ?? "Festif ⭐",
                price: "10 €",
                desc: t.plan_festive_desc ?? "50 questions, 100 joueurs",
                featured: true,
              },
              {
                name: t.plan_magic_name ?? "Magique",
                price: "15 €",
                desc: t.plan_magic_desc ?? "Illimité, vidéos",
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
            "linear-gradient(160deg, #1F1B3A 0%, #4C1D95 60%, #6B46C1 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-[var(--color-lavender)]">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[3px] text-[var(--color-gold)] font-semibold mb-2">
              {t.pro_eyebrow ?? "✨ Abonnements pros"}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide mb-3">
              {t.pro_title ?? "Quizz illimités pour ton lieu"}
            </h2>
            <p className="text-[var(--color-lavender-2)] opacity-90 max-w-2xl mx-auto">
              {t.pro_subtitle ??
                "Idéal pour bars, hôtels, restaurants, escape rooms ou tout organisateur d'événements récurrents. Sans engagement, résiliable à tout moment."}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Bar Essentiel */}
            <div className="rounded-2xl bg-white/5 border border-white/15 p-6 flex flex-col gap-4 backdrop-blur-sm">
              <div>
                <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
                  {t.pro_bar_essentiel_name ?? "Bar Essentiel"}
                </p>
                <p className="font-display text-3xl font-bold mt-1">
                  {t.pro_bar_essentiel_price ?? "25 €"}
                  <span className="text-base font-normal opacity-70">
                    {" "}
                    {t.pro_bar_essentiel_period ?? "/ mois"}
                  </span>
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {t.pro_bar_essentiel_yearly ?? "ou 250 €/an (10 mois facturés)"}
                </p>
              </div>
              <ul className="text-sm space-y-1.5">
                <li>✓ {t.pro_bar_essentiel_f1 ?? "1 lieu"}</li>
                <li>✓ {t.pro_bar_essentiel_f2 ?? "Quizz illimités"}</li>
                <li>✓ {t.pro_bar_essentiel_f3 ?? "100 joueurs par session"}</li>
                <li>✓ {t.pro_bar_essentiel_f4 ?? "Mode pilotage live + afficheur"}</li>
                <li>✓ {t.pro_bar_essentiel_f5 ?? "Logo personnalisé"}</li>
                <li>✓ {t.pro_bar_essentiel_f6 ?? "Classement avec lots"}</li>
                <li>✓ {t.pro_bar_essentiel_f7 ?? "Conservation 6 mois"}</li>
              </ul>
            </div>

            {/* Bar Pro */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-4 relative"
              style={{
                background: "linear-gradient(160deg, #F59E0B22, #D946EF22)",
                border: "2px solid var(--color-gold)",
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-violet-deep)",
                }}
              >
                {t.pro_bar_pro_badge ?? "MULTI-LIEUX"}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[2px] text-[var(--color-gold)] font-semibold">
                  {t.pro_bar_pro_name ?? "Bar Pro"}
                </p>
                <p className="font-display text-3xl font-bold mt-1">
                  {t.pro_bar_pro_price ?? "50 €"}
                  <span className="text-base font-normal opacity-70">
                    {" "}
                    {t.pro_bar_pro_period ?? "/ mois"}
                  </span>
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {t.pro_bar_pro_yearly ?? "ou 500 €/an (10 mois facturés)"}
                </p>
              </div>
              <ul className="text-sm space-y-1.5">
                <li>✓ {t.pro_bar_pro_f1 ?? "Lieux illimités"}</li>
                <li>✓ {t.pro_bar_pro_f2 ?? "Quizz illimités"}</li>
                <li>✓ {t.pro_bar_pro_f3 ?? "500 joueurs par session"}</li>
                <li>✓ {t.pro_bar_pro_f4 ?? "Mode pilotage live + afficheur"}</li>
                <li>✓ {t.pro_bar_pro_f5 ?? "Logo + sous-domaine + thème custom"}</li>
                <li>✓ {t.pro_bar_pro_f6 ?? "Templates premium"}</li>
                <li>
                  ✓ <strong>{t.pro_bar_pro_f7_strong ?? "Stats avancées + export CSV"}</strong>
                </li>
                <li>✓ {t.pro_bar_pro_f8 ?? "Support prioritaire (< 24h)"}</li>
              </ul>
            </div>
          </div>

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
