"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  quizId: string;
  title: string;
};

export function PosterPrintBar({ quizId, title }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/quizzes/${quizId}/edit`}
            className="text-sm text-muted-foreground hover:text-[var(--color-violet-primary)]"
          >
            ← Retour à l'édition
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            ·
          </span>
          <span className="text-sm font-medium truncate hidden sm:inline">
            Affiche : {title}
          </span>
        </div>
        <Button
          type="button"
          onClick={handlePrint}
          style={{
            backgroundColor: "var(--color-violet-primary)",
            color: "white",
          }}
        >
          🖨️ Imprimer (A4)
        </Button>
      </div>
    </div>
  );
}
