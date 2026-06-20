import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSettings, SETTING_KEYS } from "@/lib/site-settings";
import { HomeVideosForm } from "@/components/admin/home-videos-form";
import { DemoQuizForm } from "@/components/admin/demo-quiz-form";

export const metadata: Metadata = {
  title: "Admin · Réglages du site",
};

export default async function AdminSiteSettingsPage() {
  await requireAdmin();

  const settings = await getSettings([
    SETTING_KEYS.videoIntro,
    SETTING_KEYS.videoCreation,
    SETTING_KEYS.videoJoueur,
    SETTING_KEYS.demoQuizCode,
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-lavender)]">
          🎬 Réglages du site
        </h1>
        <p className="text-sm text-[var(--color-lavender-2)] opacity-80 mt-1">
          Modifie les vidéos de présentation sur la page d&apos;accueil sans avoir
          à redéployer le site. Une URL vide masque la vidéo (affiche le
          placeholder &quot;à venir&quot;).
        </p>
      </header>

      <section className="rounded-2xl bg-[var(--color-night-2)] border-2 p-5" style={{ borderColor: "var(--color-gold)" }}>
        <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-3">
          🎮 Quiz démo public
        </h2>
        <p className="text-xs text-[var(--color-lavender-2)] opacity-80 mb-4 leading-relaxed">
          Indique le code d&apos;un quiz <strong>PUBLISHED</strong> qui devient
          accessible sans compte via l&apos;URL <code className="px-1.5 py-0.5 rounded bg-[var(--color-night)] text-[var(--color-gold-light)]">{`${"" + "https://kuizard.com/demo"}`}</code> — parfait pour lier depuis tes posts Insta/TikTok.
          Le classement est cumulé globalement (avec chrono du meilleur).
        </p>
        <DemoQuizForm initialCode={settings[SETTING_KEYS.demoQuizCode] ?? ""} />
      </section>

      <section className="rounded-2xl bg-[var(--color-night-2)] border border-[rgba(167,139,250,0.2)] p-5">
        <h2 className="font-display text-xl tracking-wide text-[var(--color-lavender)] mb-4">
          Vidéos de la page d&apos;accueil
        </h2>
        <p className="text-xs text-[var(--color-lavender-2)] opacity-70 mb-5 leading-relaxed">
          ➡️ Formats acceptés : YouTube classique
          (https://youtube.com/watch?v=XXXX), YouTube Shorts
          (https://youtube.com/shorts/XXXX), URL embed
          (https://youtube.com/embed/XXXX), Vimeo
          (https://vimeo.com/video/XXXX) ou fichier .mp4 direct.
          <br />
          💡 Astuce : les YouTube Shorts sont verticaux (9:16) et certains
          navigateurs ne les lisent pas embed. Préfère une vidéo
          classique 16:9 quand c&apos;est possible.
        </p>
        <HomeVideosForm
          initialIntro={settings[SETTING_KEYS.videoIntro] ?? ""}
          initialCreation={settings[SETTING_KEYS.videoCreation] ?? ""}
          initialJoueur={settings[SETTING_KEYS.videoJoueur] ?? ""}
        />
      </section>
    </div>
  );
}
