import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { TeamPicker } from "@/components/TeamPicker";
import { SlotReveal } from "@/components/SlotReveal";
import { useGameStore } from "@/store/useGameStore";
import { SONGS, type Song } from "@/data/songs";
import { type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/jukebox")({
  head: () => ({ meta: [{ title: "게임1. 노래 맞히기 주크박스 - LIKELION MT" }] }),
  component: Jukebox,
});

function Jukebox() {
  const used = useGameStore((s) => s.usedSongIds);
  const markUsed = useGameStore((s) => s.markUsed);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const counts = useGameStore((s) => s.correctCounts.jukebox);
  const recordCorrect = useGameStore((s) => s.recordCorrect);
  const teams = useGameStore((s) => s.teams);
  const [team, setTeam] = useState<TeamId | null>(null);
  const [round, setRound] = useState(1);
  const [current, setCurrent] = useState<Song | null>(null);
  const [revealed, setRevealed] = useState(false);

  const remaining = useMemo(() => SONGS.filter((s) => !used.includes(s.id)), [used]);

  const step = !team ? 0 : !current ? 1 : !revealed ? 2 : 3;

  const draw = () => {
    if (!team) return toast.error("먼저 참여 팀을 선택하세요.");
    if (!remaining.length) return toast.error("남은 노래가 없습니다. 사용 목록을 초기화해 주세요.");
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrent(pick);
    setRevealed(false);
    void markUsed("song", pick.id, team);
  };

  const correct = () => {
    if (!team || !current) return;
    void recordCorrect("jukebox", team, "주크박스 정답 +1");
    toast.success(`${teams.find((t) => t.id === team)!.name} 정답!`);
    setRound((r) => r + 1);
    setCurrent(null);
    setRevealed(false);
  };

  const fail = () => {
    if (!team || !current) return;
    toast(`${teams.find((t) => t.id === team)!.name} 실패`);
    setRound((r) => r + 1);
    setCurrent(null);
    setRevealed(false);
  };

  const openYoutube = () => {
    if (!current) return;
    window.open(current.youtubeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      <GameHeader
        title="게임1. 노래 맞히기 주크박스"
        subtitle="연도와 장르 힌트를 보고 노래 제목을 맞히세요."
        badge={
          <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            🎧 게임 1
          </span>
        }
        steps={["팀 선택", "노래 뽑기", "정답 공개", "결과 입력"]}
        currentStep={step}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>팀별로 순서대로 진행합니다.</li>
            <li>연도와 장르 힌트만 보고 노래 제목을 맞힙니다.</li>
            <li>유튜브 버튼은 현재 뽑힌 노래의 정확한 검색 결과를 새 탭으로 엽니다.</li>
            <li>맞힌 개수와 순위 점수를 함께 반영해 최종 점수를 계산합니다.</li>
          </ul>
        }
      />

      <TeamPicker value={team} onChange={setTeam} label="현재 참여 팀" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-card border-2 border-border p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
              라운드 {round} · 남은 곡 {remaining.length}/{SONGS.length}
            </div>
            <button
              onClick={() => {
                void resetUsed("song");
                toast.success("사용한 곡 목록을 초기화했습니다.");
              }}
              className="text-xs text-muted-foreground underline"
            >
              사용 목록 초기화
            </button>
          </div>

          <BigButton
            size="xl"
            className="w-full animate-pulse-glow"
            onClick={draw}
            disabled={!team || !!current}
          >
            🎰 랜덤 노래 뽑기
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
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                      연도
                    </div>
                    <SlotReveal
                      pool={SONGS.map((s) => String(s.year))}
                      value={String(current.year)}
                      className="font-display text-7xl text-accent mt-1"
                    />
                  </div>
                  <div className="rounded-xl bg-card p-5 text-center border border-border">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                      장르
                    </div>
                    <SlotReveal
                      pool={[...new Set(SONGS.map((s) => s.genre))]}
                      value={current.genre}
                      className="font-display text-4xl text-primary mt-3"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <BigButton variant="accent" onClick={openYoutube}>
                    유튜브에서 확인
                  </BigButton>
                  <BigButton
                    variant={revealed ? "ghost" : "outline"}
                    onClick={() => setRevealed((r) => !r)}
                  >
                    {revealed ? "정답 숨기기" : "정답 공개"}
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
                      <div className="text-xs uppercase tracking-widest text-accent font-bold">
                        정답
                      </div>
                      <div className="font-display text-5xl md:text-6xl mt-2">{current.title}</div>
                      <div className="text-2xl text-muted-foreground mt-2">{current.artist}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3">
                  <BigButton variant="success" size="lg" onClick={correct}>
                    맞힘 +1
                  </BigButton>
                  <BigButton variant="danger" size="lg" onClick={fail}>
                    실패
                  </BigButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-3xl bg-card border-2 border-border p-6">
          <h3 className="font-display text-2xl mb-4">팀별 정답 개수</h3>
          <div className="space-y-2">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border"
              >
                <span className="font-bold" style={{ color: `var(--${t.colorVar})` }}>
                  {t.emoji} {t.name} {t.leader}
                </span>
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
