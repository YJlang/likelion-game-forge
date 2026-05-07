import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { TeamPicker } from "@/components/TeamPicker";
import { SlotReveal } from "@/components/SlotReveal";
import { useGameStore } from "@/store/useGameStore";
import { SONGS, type Song } from "@/data/songs";
import { TEAMS, type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/jukebox")({
  head: () => ({ meta: [{ title: "게임1. 노래 맞추기 주크박스 — LIKELION MT" }] }),
  component: Jukebox,
});

function Jukebox() {
  const used = useGameStore((s) => s.usedSongIds);
  const markUsed = useGameStore((s) => s.markUsed);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const [team, setTeam] = useState<TeamId | null>(null);
  const [round, setRound] = useState(1);
  const [current, setCurrent] = useState<Song | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [counts, setCounts] = useState<Record<TeamId, number>>({ team1: 0, team2: 0, team3: 0, team4: 0 });

  const remaining = useMemo(() => SONGS.filter((s) => !used.includes(s.id)), [used]);

  const step = !team ? 0 : !current ? 1 : !revealed ? 2 : 3;

  const draw = () => {
    if (!team) return toast.error("먼저 차례 팀을 선택하세요");
    if (!remaining.length) return toast.error("남은 노래가 없습니다. 사용 목록을 초기화하세요.");
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrent(pick);
    setRevealed(false);
    markUsed("song", pick.id);
  };

  const correct = () => {
    if (!team || !current) return;
    setCounts((c) => ({ ...c, [team]: c[team] + 1 }));
    toast.success(`${TEAMS.find((t) => t.id === team)!.name} 정답!`);
    setRound((r) => r + 1);
    setCurrent(null); setRevealed(false);
  };
  const fail = () => {
    if (!team || !current) return;
    toast(`${TEAMS.find((t) => t.id === team)!.name} 실패`);
    setRound((r) => r + 1);
    setCurrent(null); setRevealed(false);
  };

  return (
    <div className="space-y-8">
      <GameHeader
        title="게임1. 노래 맞추기 주크박스"
        subtitle="년도와 장르 힌트만 보고 노래를 맞추세요!"
        badge={<span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">🎵 게임 1</span>}
        steps={["팀 선택", "노래 뽑기", "정답 공개", "결과 입력"]}
        currentStep={step}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>팀별로 한 명씩 나와서 진행. 총 4팀.</li>
            <li>년도/장르 힌트로 노래를 맞춥니다.</li>
            <li>맞춘 개수 → 순위, 동점 시 빠른 팀 우선.</li>
          </ul>
        }
      />

      <TeamPicker value={team} onChange={setTeam} label="① 현재 차례 팀" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-card border-2 border-border p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
              라운드 {round} · 남은 곡 {remaining.length}/{SONGS.length}
            </div>
            <button onClick={() => { resetUsed("song"); toast.success("사용된 곡 목록 초기화"); }} className="text-xs text-muted-foreground underline">
              사용 목록 초기화
            </button>
          </div>

          <BigButton size="xl" className="w-full animate-pulse-glow" onClick={draw} disabled={!team || !!current}>
            ② 🎰 랜덤 뽑기
          </BigButton>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ scale: 0.6, opacity: 0, rotate: -3 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="rounded-2xl bg-background/50 p-6 space-y-4 border-2 border-primary/40 glow-primary"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-card p-5 text-center border border-border">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">년도</div>
                    <SlotReveal
                      pool={SONGS.map((s) => String(s.year))}
                      value={String(current.year)}
                      className="font-display text-7xl text-accent mt-1"
                    />
                  </div>
                  <div className="rounded-xl bg-card p-5 text-center border border-border">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">장르</div>
                    <SlotReveal
                      pool={[...new Set(SONGS.map((s) => s.genre))]}
                      value={current.genre}
                      className="font-display text-4xl text-primary mt-3"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <BigButton variant="accent" onClick={() => window.open(current.youtubeUrl, "_blank")}>▶ 유튜브 열기</BigButton>
                  <BigButton variant={revealed ? "ghost" : "outline"} onClick={() => setRevealed((r) => !r)}>
                    {revealed ? "🙈 정답 숨기기" : "③ 👀 정답 공개"}
                  </BigButton>
                </div>

                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border-2 border-accent bg-accent/10 p-6 text-center glow-yellow"
                    >
                      <div className="text-xs uppercase tracking-widest text-accent font-bold">정답</div>
                      <div className="font-display text-5xl md:text-6xl mt-2">{current.title}</div>
                      <div className="text-2xl text-muted-foreground mt-2">{current.artist}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3">
                  <BigButton variant="success" size="lg" onClick={correct}>✅ 맞춤 +1</BigButton>
                  <BigButton variant="danger" size="lg" onClick={fail}>❌ 실패</BigButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-3xl bg-card border-2 border-border p-6">
          <h3 className="font-display text-2xl mb-4">📋 팀별 정답 개수</h3>
          <div className="space-y-2">
            {TEAMS.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                <span className="font-bold" style={{ color: `var(--${t.colorVar})` }}>{t.emoji} {t.name} {t.leader}</span>
                <span className="font-display text-3xl tabular-nums">{counts[t.id]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ResultsPanel game="jukebox" />
    </div>
  );
}
