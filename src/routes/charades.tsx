import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { TeamPicker } from "@/components/TeamPicker";
import { Timer } from "@/components/Timer";
import { useGameStore } from "@/store/useGameStore";
import { CHARADES, type Charade } from "@/data/charades";
import { TEAMS, type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/charades")({
  head: () => ({ meta: [{ title: "게임2. 몸으로 말해요 — LIKELION MT" }] }),
  component: Charades,
});

function Charades() {
  const used = useGameStore((s) => s.usedCharadeIds);
  const markUsed = useGameStore((s) => s.markUsed);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const [team, setTeam] = useState<TeamId | null>(null);
  const [current, setCurrent] = useState<Charade | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [counts, setCounts] = useState<Record<TeamId, number>>({ team1: 0, team2: 0, team3: 0, team4: 0 });

  const remaining = useMemo(() => CHARADES.filter((c) => !used.includes(c.id)), [used]);

  const draw = () => {
    if (!remaining.length) return toast.error("남은 키워드가 없습니다.");
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrent(pick); setRevealed(false); markUsed("charade", pick.id);
  };

  const score = () => {
    if (!team) return toast.error("팀을 먼저 선택하세요");
    setCounts((c) => ({ ...c, [team]: c[team] + 1 }));
    toast.success("정답 +1");
    draw();
  };
  const skip = () => { toast("스킵"); draw(); };

  return (
    <div className="space-y-8">
      <GameHeader
        title="게임2. 몸으로 말해요"
        subtitle="3분 안에 더 많이 맞히면 승리!"
        badge={<span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">🤸 게임 2</span>}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>팀당 제한시간 3분. 한 팀씩 진행.</li>
            <li>첫 번째 사람이 키워드를 보고 행동으로 다음 사람에게 전달.</li>
            <li>맞춘 개수 → 순위. 동점 시 빠른 팀 우선.</li>
          </ul>
        }
      />

      <TeamPicker value={team} onChange={setTeam} label="현재 차례 팀" />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-border p-8 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">⏱ 3분 카운트다운</div>
          <Timer durationSec={180} size="xl" onComplete={() => toast("⏰ 시간 종료!")} />
        </div>

        <div className="rounded-3xl bg-card border border-border p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
              남은 키워드 {remaining.length}/{CHARADES.length}
            </div>
            <button onClick={() => { resetUsed("charade"); toast.success("사용 키워드 초기화"); }} className="text-xs text-muted-foreground underline">
              사용 목록 초기화
            </button>
          </div>

          <BigButton size="xl" className="w-full" onClick={draw}>🎰 키워드 뽑기</BigButton>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl border-2 border-primary bg-background/50 p-6 text-center min-h-[180px] flex flex-col items-center justify-center">
                <div className="text-xs text-muted-foreground">{current.category} · 난이도 {current.difficulty}</div>
                {revealed ? (
                  <div className="font-display text-5xl md:text-7xl text-accent mt-2">{current.keyword}</div>
                ) : (
                  <div className="font-display text-5xl text-muted-foreground mt-2">●●●●●</div>
                )}
                <BigButton variant={revealed ? "ghost" : "accent"} className="mt-4" onClick={() => setRevealed((r) => !r)}>
                  {revealed ? "🙈 키워드 숨기기" : "👀 키워드 보기"}
                </BigButton>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            <BigButton variant="success" size="lg" onClick={score}>✅ +1 정답</BigButton>
            <BigButton variant="ghost" size="lg" onClick={skip}>⏭ 스킵</BigButton>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border p-6">
        <h3 className="font-display text-2xl mb-4">📋 팀별 맞춘 개수</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEAMS.map((t) => (
            <div key={t.id} className="rounded-xl bg-background/50 p-4">
              <div className="text-sm" style={{ color: `var(--${t.colorVar})` }}>{t.emoji} {t.name} {t.leader}</div>
              <div className="font-display text-5xl tabular-nums mt-1">{counts[t.id]}</div>
            </div>
          ))}
        </div>
      </div>

      <ResultsPanel game="charades" />
    </div>
  );
}
