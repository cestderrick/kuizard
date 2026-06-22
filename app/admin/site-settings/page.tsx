import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSettings, SETTING_KEYS } from "@/lib/site-settings";
import { HomeVideosForm } from "@/components/admin/home-videos-form";
import { DemoQuizForm } from "@/components/admin/demo-quiz-form";
import { prisma } from "@/lib/db";

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

  // V47.29 : liste des participants au quiz démo public
  const demoCode = settings[SETTING_KEYS.demoQuizCode];
  const demoQuiz = demoCode
    ? await prisma.quiz.findUnique({
        where: { code: demoCode },
        select: {
          id: true,
          title: true,
          _count: { select: { participations: true } },
        },
      })
    : null;
  const demoParticipations = demoQuiz
    ? await prisma.participation.findMany({
        where: { quizId: demoQuiz.id, completedAt: { not: null } },
        select: {
          id: true,
          nickname: true,
          score: true,
          startedAt: true,
          completedAt: true,
        },
        orderBy: [{ score: "desc" }, { completedAt: "asc" }],
        take: 100,
      })
    : [];

  function fmtDate(d: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  }
  function fmtDuration(ms: number) {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    if (m > 99) return "–";
    return `${m}m${String(sec).padStart(2, "0")}s`;
  }

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

        {/* V47.29 : participants au quiz démo */}
        {demoQuiz && (
          <div className="mt-5 border-t border-[rgba(167,139,250,0.2)] pt-5">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-[var(--color-gold-light)]">
                👥 Participants au quiz démo
              </h3>
              <span className="text-xs text-[var(--color-lavender-2)] opacity-70">
                {demoParticipations.length} terminé{demoParticipations.length > 1 ? "s" : ""} sur {demoQuiz._count.participations} ouvertures
              </span>
            </div>
            {demoParticipations.length === 0 ? (
              <p className="text-xs text-[var(--color-lavender-2)] opacity-60 italic py-3">
                Aucun participant encore. Partage l&apos;URL{" "}
                <code className="px-1.5 py-0.5 rounded bg-[var(--color-night)] text-[var(--color-gold-light)]">
                  /demo
                </code>{" "}
                pour commencer à collecter des participations.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[rgba(167,139,250,0.15)]">
                <table className="w-full text-xs">
                  <thead className="bg-[rgba(167,139,250,0.08)] text-[var(--color-lavender-2)]">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <th className="px-3 py-2 text-left font-semibold">Pseudo</th>
                      <th className="px-3 py-2 text-right font-semibold">Score</th>
                      <th className="px-3 py-2 text-right font-semibold">Chrono</th>
                      <th className="px-3 py-2 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(167,139,250,0.08)]">
                    {demoParticipations.map((p, i) => (
                      <tr key={p.id} className="hover:bg-[rgba(167,139,250,0.04)]">
                        <td className="px-3 py-2 text-[var(--color-lavender-2)] opacity-70">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-[var(--color-lavender)]">{p.nickname}</td>
                        <td className="px-3 py-2 text-right font-bold text-[var(--color-gold-light)]">{p.score}</td>
                        <td className="px-3 py-2 text-right text-[var(--color-lavender-2)] opacity-80">
                          {p.completedAt
                            ? fmtDuration(p.completedAt.getTime() - p.startedAt.getTime())
                            : "–"}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--color-lavender-2)] opacity-70">
                          {p.completedAt ? fmtDate(p.completedAt) : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
