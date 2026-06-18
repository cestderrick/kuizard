import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/quiz/copy-button";
import { buildQuizPlayUrl, generateQrSvg } from "@/lib/quiz/qrcode";

type Props = {
  quizId: string;
  code: string;
  status: string;
  hasQuestions: boolean;
  expiresAt: Date | null;
};

// V23 : on a viré la notion de Brouillon côté user. Un quizz est toujours
// considéré comme actif/partageable. On garde juste les badges d'état "live"
// et "terminé" qui restent utiles à voir.
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Actif",
  PUBLISHED: "Actif",
  RUNNING: "En direct",
  FINISHED: "Terminé",
  ARCHIVED: "Archivé",
};

export async function ShareSection({
  quizId,
  code,
  status,
  hasQuestions: _hasQuestions,
  expiresAt,
}: Props) {
  // Tous les quizz sont partageables (créés en PUBLISHED par défaut). Pas de
  // PublishButton — on enlève la friction inutile.
  const isPublished = true;
  void status;
  const url = buildQuizPlayUrl(code);
  const qrSvg = await generateQrSvg(url, {
    color: "#1F1B3A",
    backgroundColor: "#FFFFFF",
    margin: 2,
  });

  // Lien de téléchargement du SVG (data URI)
  const qrDownloadHref =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qrSvg);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display tracking-wide">
          Partage
        </CardTitle>
        <CardDescription>
          Voici le lien et le QR code à partager avec tes participants.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Bandeau "accessible jusqu'au..." si défini */}
        {expiresAt && (
          <div>
            <span className="text-xs text-muted-foreground">
              Accessible jusqu'au{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(expiresAt)}
            </span>
          </div>
        )}

        {/* Lien et QR — toujours visibles */}
        {isPublished && (
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start pt-2 border-t">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Lien public
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-sm px-3 py-2 bg-[var(--color-lavender)] rounded-md break-all flex-1 min-w-0">
                    {url}
                  </code>
                  <CopyButton value={url} label="Copier le lien" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Code court
                </p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-lg px-3 py-2 bg-[var(--color-lavender)] rounded-md font-bold">
                    {code}
                  </code>
                  <CopyButton value={code} label="Copier le code" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                QR code
              </p>
              <div
                className="w-40 h-40 rounded-lg bg-white p-2 shadow-sm border"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <a
                href={qrDownloadHref}
                download={`kuizard-${code}.svg`}
                className="text-sm underline text-[var(--color-violet-primary)] hover:opacity-80"
              >
                Télécharger en SVG
              </a>
            </div>
          </div>
        )}

        {/* Liens utilitaires : classement, affiche imprimable */}
        {isPublished && (
          <div className="pt-2 border-t flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={`/q/${code}/classement`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              🏆 Voir le classement public
            </a>
            <a
              href={`/api/quiz/${code}/export`}
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              📊 Exporter en CSV
            </a>
            <a
              href={`/dashboard/quizzes/${quizId}/poster`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              🖨️ Affiche A4 imprimable
            </a>
            <a
              href={`/dashboard/quizzes/${quizId}/live`}
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              🎩 Panel live (mode pilotage admin)
            </a>
            <a
              href={`/q/${code}/display`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--color-violet-primary)" }}
            >
              📺 Affichage TV (pour bars / écrans)
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
