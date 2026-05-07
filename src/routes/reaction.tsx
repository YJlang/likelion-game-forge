import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { TeamPicker } from "@/components/TeamPicker";
import { Timer } from "@/components/Timer";
import { useGameStore } from "@/store/useGameStore";
import { REACTIONS, type ReactionAction } from "@/data/reactions";
import { TEAMS, type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reaction")({
  head: () => ({ meta: [{ title: "게임4. 반응으로 행동 맞추기 — LIKELION MT" }] }),
  component: Reaction,
});

function Reaction() {
  const used = useGameStore((s) => s.usedReactionIds);
  const markUsed = useGameStore((s) => s.markUsed);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const [team, setTeam] = useState<TeamId | null>(null);
  const [guesser, setGuesser] = useState("");
  const [current, setCurrent] = useState<ReactionAction | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<TeamId, { ok: boolean; sec: number | null }>>({
    team1: { ok: false, sec: null },
    team2: { ok: false, sec: null },
    team3: { ok: false, sec: null },
    team4: { ok: false, sec: null },
  });
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const remaining = useMemo(() => REACTIONS.filter((r) => !used.includes(r.id)), [used]);

  const draw = () => {
    if (!remaining.length) return toast.error("남은 주제가 없습니다.");
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrent(pick); setRevealed(false); markUsed("reaction", pick.id);
    setStartedAt(Date.now());
  };

  const succeed = () => {
    if (!team) return toast.error("팀을 먼저 선택하세요");
    const sec = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    setResults((r) => ({ ...r, [team]: { ok: true, sec: Math.round(sec * 10) / 10 } }));
    toast.success(`성공! ${sec.toFixed(1)}초`);
  };
  const failTeam = () => {
    if (!team) return toast.error("팀을 먼저 선택하세요");
    setResults((r) => ({ ...r, [team]: { ok: false, sec: null } }));
    toast.error("실패");
  };

  return (
    <div className="space-y-8">
      <GameHeader
        title="게임4. 반응으로 행동 맞추기"
        subtitle="환호와 야유만으로 행동을 추측합니다!"
        badge={<span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">🎭 게임 4</span>}
        steps={["팀/추측자 선정", "주제 뽑기", "성공/실패 입력"]}
        currentStep={!team ? 0 : !current ? 1 : 2}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>한 명을 추측자로 선정, 나머지는 주제 확인.</li>
            <li>맞으면 환호 / 틀리면 야유. 말은 절대 금지!</li>
            <li>제한 3분, 빠르게 맞춘 팀이 높은 순위.</li>
          </ul>
        }
      />

      <div className="rounded-2xl border-2 border-accent bg-accent/10 p-5 text-center">
        <div className="font-display text-3xl text-accent">📣 룰: 말 절대 금지! 환호 ✨ 야유 🙅 만 가능</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TeamPicker value={team} onChange={setTeam} label="현재 차례 팀" />
        <div>
          <div className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">추측자 이름</div>
          <input value={guesser} onChange={(e) => setGuesser(e.target.value)}
            placeholder="예) 천병권"
            className="w-full h-14 rounded-xl bg-input border border-border px-4 text-lg" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-border p-8 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">⏱ 3분 타이머</div>
          <Timer durationSec={180} size="xl" />
        </div>

        <div className="rounded-3xl bg-card border border-border p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">남은 {remaining.length}/{REACTIONS.length}</div>
            <button onClick={() => { resetUsed("reaction"); toast.success("주제 풀 초기화"); }} className="text-xs text-muted-foreground underline">초기화</button>
          </div>

          <BigButton size="xl" className="w-full" onClick={draw}>🎰 행동 주제 뽑기</BigButton>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ scale: 0.5, opacity: 0, rotate: -4 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                className="rounded-2xl border-2 border-primary glow-primary bg-background/50 p-6 text-center"
              >
                <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">난이도 {current.difficulty}</div>
                {revealed ? (
                  <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-4xl md:text-6xl text-accent mt-3" style={{ textShadow: "0 0 30px var(--accent)" }}>
                    {current.action}
                  </motion.div>
                ) : (
                  <div className="font-display text-6xl text-muted-foreground/40 mt-3 tracking-widest">● ● ● ● ●</div>
                )}
                <BigButton size="lg" className="mt-5" variant={revealed ? "ghost" : "accent"} onClick={() => setRevealed((r) => !r)}>
                  {revealed ? "🙈 주제 숨기기" : "👀 주제 공개 (운영진만)"}
                </BigButton>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            <BigButton variant="success" size="lg" onClick={succeed}>✅ 성공 (시간 기록)</BigButton>
            <BigButton variant="danger" size="lg" onClick={failTeam}>❌ 실패</BigButton>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border p-6">
        <h3 className="font-display text-2xl mb-4">📋 팀별 결과</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEAMS.map((t) => {
            const r = results[t.id];
            return (
              <div key={t.id} className="rounded-xl bg-background/50 p-4">
                <div className="text-sm" style={{ color: `var(--${t.colorVar})` }}>{t.emoji} {t.name}</div>
                <div className={`font-display text-3xl mt-1 ${r.ok ? "text-success" : r.sec === null ? "text-muted-foreground" : "text-destructive"}`}>
                  {r.ok ? `${r.sec}s` : r.sec === null && r === results[t.id] && results[t.id].sec === null && !results[t.id].ok ? "—" : "실패"}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">추측자: {guesser || "—"}</p>
      </div>

      <ResultsPanel game="reaction" />
    </div>
  );
}
