import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { EscapeStepForm } from "@/components/escape/escape-step-form";

export const metadata: Metadata = {
  title: "Editer une etape",
};

export default async function EscapeStepEditPage({
  params,
}: {
  params: Promise<{ id: string; sid: string }>;
}) {
  const { id, sid } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const escape = await prisma.escape.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      code: true,
      title: true,
      hintCostPoints: true,
      steps: {
        where: { id: sid },
        select: {
          id: true,
          order: true,
          type: true,
          title: true,
          body: true,
          expectedAnswer: true,
          options: true,
          hints: true,
          points: true,
          imageUrl: true,
          audioUrl: true,
        },
      },
    },
  });
  if (!escape || escape.steps.length === 0) notFound();
  const step = escape.steps[0];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard/escapes" className="hover:underline">
          🗝️ Mes escapes
        </Link>
        <span>›</span>
        <Link href={`/dashboard/escapes/${escape.id}/edit`} className="hover:underline truncate max-w-[200px]">
          {escape.title}
        </Link>
        <span>›</span>
        <span>Etape {step.order}</span>
      </div>

      <header>
        <h1 className="font-display text-2xl tracking-wide">
          Etape {step.order}
        </h1>
        <p className="text-sm text-muted-foreground">
          Cout d&apos;un indice sur cet escape :{" "}
          <strong>{escape.hintCostPoints} pts</strong>
        </p>
      </header>

      <section className="rounded-2xl border p-5 bg-white">
        <EscapeStepForm
          escapeId={escape.id}
          step={{
            id: step.id,
            type: step.type,
            title: step.title,
            body: step.body,
            expectedAnswer: step.expectedAnswer,
            options: step.options,
            hints: step.hints,
            points: step.points,
          }}
        />
      </section>
    </div>
  );
}
