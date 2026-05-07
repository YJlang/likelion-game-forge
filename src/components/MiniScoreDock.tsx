import { useGameStore } from "@/store/useGameStore";
import { TEAMS } from "@/data/teams";

export function MiniScoreDock() {
  const scores = useGameStore((s) => s.scores);
  const sorted = [...TEAMS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  return (
    <div className="fixed bottom-4 right-4 z-30 glass rounded-2xl p-3 shadow-elegant hidden lg:block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 px-1">
        실시간 점수
      </div>
      <div className="space-y-1.5 min-w-[200px]">
        {sorted.map((t, i) => (
          <div key={t.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-[var(--${t.colorVar})]`} />
              <span className={i === 0 ? "font-bold text-accent" : "font-semibold"}>
                {i === 0 && "👑 "}{t.name} {t.leader}
              </span>
            </div>
            <span className="font-display text-lg tabular-nums">{scores[t.id] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
