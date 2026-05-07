import { useGameStore } from "@/store/useGameStore";
import { TEAMS } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";

export function MiniScoreDock() {
  const scores = useGameStore((s) => s.scores);
  const sorted = [...TEAMS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  return (
    <div className="fixed bottom-4 right-4 z-30 hidden md:block">
      <div className="glass rounded-2xl p-4 shadow-elegant border-2 border-primary/40 min-w-[260px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs uppercase tracking-widest text-primary font-bold">
            🔴 LIVE 점수
          </div>
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 ${
                  i === 0 ? "bg-accent/15 border border-accent/40" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display text-lg w-5 text-center text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: `var(--${t.colorVar})` }}
                  />
                  <span className={`truncate font-bold text-sm ${i === 0 ? "text-accent" : ""}`}>
                    {i === 0 && "👑 "}
                    {t.name}
                  </span>
                </div>
                <motion.span
                  key={scores[t.id]}
                  initial={{ scale: 1.5, color: "var(--accent)" }}
                  animate={{ scale: 1, color: "var(--foreground)" }}
                  className="font-display text-2xl tabular-nums"
                >
                  {scores[t.id] ?? 0}
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
