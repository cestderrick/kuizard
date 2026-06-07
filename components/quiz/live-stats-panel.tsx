"use client";

import { useEffect, useState } from "react";

type Stats = {
  status: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  currentDistribution: {
    questionId: string | null;
    type: string | null;
    counts: { label: string; count: number; isCorrect: boolean }[];
    answeredCount: number;
  };
};

export function LiveStatsPanel({ code }: { code: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch(`/api/quiz/${code}/live-stats`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as Stats;
          if (!cancelled) setStats(data);
        }
      } catch {
        // ignore
      }
    }
    tick();
    const id = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code]);

  if (!stats) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        Connexion aux stats en cours…
      </div>
    );
  }

  const dist = stats.currentDistribution;
  const total = dist.counts.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Connectés"
          value={stats.activeParticipants}
          icon="🟢"
          highlight
        />
        <Stat
          label="Terminés"
          value={stats.completedParticipants}
          icon="✓"
        />
        <Stat
          label="Total"
          value={stats.totalParticipants}
          icon="👥"
        />
      </div>

      {/* Distribution réponses question courante */}
      {dist.questionId && dist.type !== "TEXT" && (
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mb-2">
            Réponses en temps réel
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {dist.answeredCount} / {stats.totalParticipants} joueur
            {stats.totalParticipants > 1 ? "s" : ""} a/ont répondu
          </p>
          <ul className="flex flex-col gap-2">
            {dist.counts.map((c, i) => {
              const pct = Math.round((c.count / total) * 100);
              return (
                <li key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={c.isCorrect ? "font-semibold" : ""}>
                      {c.isCorrect && "✓ "}
                      {c.label || `Option ${String.fromCharCode(65 + i)}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {c.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: c.isCorrect
                          ? "linear-gradient(90deg, #10B981, #34D399)"
                          : "linear-gradient(90deg, var(--color-violet-primary), #A78BFA)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {dist.questionId && dist.type === "TEXT" && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground font-semibold mb-1">
            Question texte libre
          </p>
          <p className="text-muted-foreground">
            {dist.answeredCount} joueur{dist.answeredCount > 1 ? "s" : ""} a/ont
            répondu (texte non affiché ici pour respecter la surprise).
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 border text-center ${
        highlight
          ? "border-green-200 bg-green-50"
          : "border-violet-100 bg-white"
      }`}
    >
      <div className="text-lg" aria-hidden>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold text-[var(--color-violet-primary)]">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}
