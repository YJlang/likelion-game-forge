import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useGameStore } from "@/store/useGameStore";
import { TRUTH_LIES } from "@/data/truthlie";
import { type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/truthlie")({
  head: () => ({ meta: [{ title: "게임3. 운영진 진실/거짓 — LIKELION MT" }] }),
  component: TruthLie,
});

function TruthLie() {
  const used = useGameStore((s) => s.usedTruthIds);
  const markUsed = useGameStore((s) => s.markUsed);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const counts = useGameStore((s) => s.correctCounts.truthlie);
  const recordCorrect = useGameStore((s) => s.recordCorrect);
  const teams = useGameStore((s) => s.teams);

  const [revealed, setRevealed] = useState(false);
  const [qNum, setQNum] = useState(1);
  const [correct, setCorrect] = useState<Record<TeamId, boolean>>({
    team1: false,
    team2: false,
    team3: false,
    team4: false,
  });
  const remaining = useMemo(() => TRUTH_LIES.filter((q) => !used.includes(q.id)), [used]);
  const [current, setCurrent] = useState<(typeof TRUTH_LIES)[number] | null>(null);

  const draw = () => {
    const pool = TRUTH_LIES.filter((q) => !used.includes(q.id));
    if (!pool.length) return toast.error("남은 문제가 없습니다.");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(pick);
    setRevealed(false);
    void markUsed("truth", pick.id);
    setCorrect({ team1: false, team2: false, team3: false, team4: false });
  };

  const next = () => {
    (Object.keys(correct) as TeamId[]).forEach((tid) => {
      if (correct[tid]) void recordCorrect("truthlie", tid, "진실/거짓 정답 +1");
    });
    setQNum((n) => n + 1);
    draw();
  };

  return (
    <div className="space-y-8">
      <GameHeader
        title="게임3. 운영진 진실/거짓"
        subtitle="문장이 진실인지 거짓인지 맞춰보세요!"
        badge={
          <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            🤔 게임 3
          </span>
        }
        steps={["문제 뽑기", "팀별 정답 체크", "정답 공개", "다음 문제"]}
        currentStep={!current ? 0 : !revealed ? 1 : 2}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>운영진에 대한 문장이 나옵니다.</li>
            <li>각 팀은 진실/거짓을 선택, 진행자가 정답 공개.</li>
            <li>맞춘 누적 개수 → 순위.</li>
          </ul>
        }
      />

      <div className="rounded-3xl bg-card border border-border p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
            문제 {qNum} · 남은 {remaining.length}/{TRUTH_LIES.length}
          </div>
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              void resetUsed("truth");
              toast.success("문제 풀 초기화");
            }}
            className="text-xs text-muted-foreground underline"
          >
            문제 초기화
          </button>
        </div>

        <BigButton size="xl" className="w-full animate-pulse-glow" onClick={draw}>
          🎰 다음 문제 뽑기
        </BigButton>

        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ scale: 0.6, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="rounded-2xl border-2 border-primary glow-primary bg-background/50 p-8 text-center"
            >
              <div className="font-display text-4xl text-primary">{current.person}</div>
              <div
                className="font-display text-5xl md:text-7xl mt-4 leading-tight"
                style={{ textShadow: "0 0 30px rgba(249,115,22,0.4)" }}
              >
                "{current.statement}"
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <BigButton
                  size="lg"
                  variant={revealed ? "ghost" : "accent"}
                  onClick={() => setRevealed((r) => !r)}
                >
                  {revealed ? "🙈 정답 숨기기" : "👀 정답 공개"}
                </BigButton>
              </div>
              {revealed && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mt-6 inline-block px-8 py-4 rounded-2xl font-display text-6xl ${
                    current.answer === "진실"
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {current.answer === "진실" ? "✅ 진실" : "❌ 거짓"}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <div className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
            팀별 정답 체크
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teams.map((t) => (
              <button
                key={t.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setCorrect((c) => ({ ...c, [t.id]: !c[t.id] }))}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  correct[t.id] ? "border-success bg-success/10" : "border-border bg-card"
                }`}
              >
                <div className="text-sm" style={{ color: `var(--${t.colorVar})` }}>
                  {t.emoji} {t.name}
                </div>
                <div className="font-display text-2xl mt-1">
                  {correct[t.id] ? "✅ 맞음" : "⬜ 미선택"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <BigButton size="lg" className="w-full" onClick={next}>
          다음 문제로 →
        </BigButton>
      </div>

      <div className="rounded-3xl bg-card border border-border p-6">
        <h3 className="font-display text-2xl mb-4">📋 팀별 누적 정답</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teams.map((t) => (
            <div key={t.id} className="rounded-xl bg-background/50 p-4">
              <div className="text-sm" style={{ color: `var(--${t.colorVar})` }}>
                {t.emoji} {t.name}
              </div>
              <div className="font-display text-5xl tabular-nums mt-1">{counts[t.id]}</div>
            </div>
          ))}
        </div>
      </div>

      <ResultsPanel game="truthlie" />
    </div>
  );
}
