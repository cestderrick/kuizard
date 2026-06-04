import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/quiz/copy-button";
import { PublishButton } from "@/components/quiz/publish-button";
import { buildQuizPlayUrl, generateQrSvg } from "@/lib/quiz/qrcode";

type Props = {
  quizId: string;
  code: string;
  status: string;
  hasQuestions: boolean;
  expiresAt: Date | null;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  RUNNING: "En direct",
  FINISHED: "Terminé",
  ARCHIVED: "Archivé",
};

export async function ShareSection({
  quizId,
  code,
  status,
  hasQuestions,
  expiresAt,
}: Props) {
  const isPublished =
    status === "PUBLISHED" || status === "RUNNING" || status === "FINISHED";
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
          Partage et publication
        </CardTitle>
        <CardDescription>
          {isPublished
            ? "Ton quizz est publié ! Voici le lien et le QR code à partager."
            : "Publie ton quizz pour activer le lien et le QR code."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Statut */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              isPublished
                ? "bg-green-100 text-green-700"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {STATUS_LABEL[status] ?? status}
          </span>
          {isPublished && expiresAt && (
            <span className="text-xs text-muted-foreground">
              Accessible jusqu'au{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(expiresAt)}
            </span>
          )}
        </div>

        {/* Publish / unpublish */}
        <PublishButton
          quizId={quizId}
          isPublished={isPublished}
          hasQuestions={hasQuestions}
        />

        {/* Lien et QR — visibles uniquement si publié */}
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
      </CardContent>
    </Card>
  );
}
