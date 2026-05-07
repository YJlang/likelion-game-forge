import { createFileRoute } from "@tanstack/react-router";
import { TEAMS } from "@/data/teams";
import { useGameStore, GAME_LABEL } from "@/store/useGameStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BigButton } from "@/components/BigButton";

export const Route = createFileRoute("/final")({
  head: () => ({
    meta: [
      { title: "🏆 최종 결과 발표 — LIKELION MT" },
      { name: "description", content: "MT 레크레이션 최종 우승팀 발표" },
    ],
  }),
  component: Final,
});

function fireBigConfetti() {
  const end = Date.now() + 4 * 1000;
  const colors = ["#F97316", "#FACC15", "#22C55E", "#EF4444", "#FFFFFF"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 80, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 80, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function Final() {
  const scores = useGameStore((s) => s.scores);
  const mvpLog = useGameStore((s) => s.mvpLog);
  const sorted = [...TEAMS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const winner = sorted[0];

  type Phase = "idle" | "countdown" | "reveal";
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);

  const start = () => {
    setPhase("countdown");
    setCount(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      setCount(n);
      if (n <= 0) {
        clearInterval(iv);
        setPhase("reveal");
        fireBigConfetti();
      }
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-display text-6xl md:text-9xl">
          <span className="bg-clip-text text-transparent gradient-gold">🏆 최종 우승팀 발표</span>
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-10">
            <div className="text-display text-6xl md:text-8xl text-primary animate-shake">두구두구두구...</div>
            <div className="text-muted-foreground text-lg">준비되면 결과를 공개하세요</div>
            <BigButton size="xl" onClick={start} className="animate-pulse-glow">
              🎉 결과 공개!
            </BigButton>
          </motion.div>
        )}

        {phase === "countdown" && (
          <motion.div key="cd" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-center py-20">
            <div className="text-display text-[280px] text-accent leading-none" style={{ textShadow: "0 0 60px var(--accent)" }}>
              {count > 0 ? count : "GO!"}
            </div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="rv" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* WINNER */}
            <motion.div
              initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative overflow-hidden rounded-3xl border-4 border-accent p-10 md:p-16 text-center bg-card glow-yellow"
            >
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle, var(--${winner.colorVar}), transparent 70%)` }} />
              <div className="relative">
                <div className="font-display text-3xl text-accent">🏆 우승팀</div>
                <div className="text-display text-7xl md:text-[160px] mt-2 leading-none">
                  {winner.emoji} {winner.name}
                </div>
                <div className="font-display text-3xl mt-4" style={{ color: `var(--${winner.colorVar})` }}>
                  팀장 {winner.leader}
                </div>
                <div className="mt-2 text-lg text-foreground/80">{winner.members.join(" · ")}</div>
                <div className="mt-6 font-display text-7xl text-accent tabular-nums">{scores[winner.id]} 점</div>
              </div>
            </motion.div>

            {/* Other ranks */}
            <div className="grid sm:grid-cols-3 gap-4">
              {sorted.slice(1).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="rounded-2xl bg-card border border-border p-6"
                >
                  <div className="font-display text-2xl text-muted-foreground">{i + 2}위</div>
                  <div className="font-display text-3xl mt-1">{t.emoji} {t.name}</div>
                  <div style={{ color: `var(--${t.colorVar})` }}>{t.leader}</div>
                  <div className="mt-2 font-display text-4xl tabular-nums">{scores[t.id]}</div>
                </motion.div>
              ))}
            </div>

            {/* MVP list */}
            <div className="rounded-3xl bg-card border border-border p-6">
              <h3 className="font-display text-3xl mb-4">🌟 오늘의 MVP</h3>
              {mvpLog.length === 0 ? (
                <div className="text-muted-foreground">아직 MVP 기록이 없어요.</div>
              ) : (
                <ul className="space-y-2">
                  {mvpLog.map((m) => {
                    const t = TEAMS.find((x) => x.id === m.team)!;
                    return (
                      <li key={m.id} className="flex items-center justify-between gap-3 border-b border-border pb-2">
                        <span className="text-muted-foreground text-sm">{GAME_LABEL[m.game]}</span>
                        <span className="font-bold">{t.emoji} {t.name} {m.player ? `· ${m.player}` : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="text-center pt-6">
              <p className="font-display text-4xl md:text-6xl text-primary">모두 수고하셨습니다! 🦁</p>
              <BigButton variant="ghost" className="mt-6" onClick={() => { setPhase("idle"); }}>
                다시 발표
              </BigButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
