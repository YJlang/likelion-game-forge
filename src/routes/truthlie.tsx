import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BigButton } from "@/components/BigButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useGameStore } from "@/store/useGameStore";
import { TRUTH_LIES, type TruthLiePair } from "@/data/truthlie";
import { type TeamId } from "@/data/teams";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/truthlie")({
  head: () => ({ meta: [{ title: "게임3. 운영진 진실/거짓 — LIKELION MT" }] }),
  component: TruthLie,
});

type TruthLieOption = {
  label: "A" | "B";
  statement: string;
  answer: "진실" | "거짓";
};

type TruthLieRound = TruthLiePair & {
  options: [TruthLieOption, TruthLieOption];
};

function createRound(question: TruthLiePair): TruthLieRound {
  const trueOption: TruthLieOption = {
    label: "A",
    statement: question.trueStatement,
    answer: "진실",
  };
  const falseOption: TruthLieOption = {
    label: "B",
    statement: question.falseStatement,
    answer: "거짓",
  };

  if (Math.random() < 0.5) {
    return { ...question, options: [trueOption, falseOption] };
  }

  return {
    ...question,
    options: [
      { ...falseOption, label: "A" },
      { ...trueOption, label: "B" },
    ],
  };
}

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
  const [current, setCurrent] = useState<TruthLieRound | null>(null);

  const draw = () => {
    const pool = TRUTH_LIES.filter((q) => !used.includes(q.id));
    if (!pool.length) return toast.error("남은 문제가 없습니다.");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(createRound(pick));
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
        subtitle="두 문장 중 무엇이 진실이고 거짓인지 맞춰보세요!"
        badge={
          <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            🤔 게임 3
          </span>
        }
        steps={["문제 뽑기", "팀별 정답 체크", "정답 공개", "다음 문제"]}
        currentStep={!current ? 0 : !revealed ? 1 : 2}
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>운영진 한 명에 대한 문장 2개가 동시에 나옵니다.</li>
            <li>각 팀은 A/B 중 어느 문장이 진실이고 거짓인지 맞힙니다.</li>
            <li>홍민경, 권오현, 김민규 문항은 제외했습니다.</li>
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
              <div className="grid md:grid-cols-2 gap-4 mt-5">
                {current.options.map((option) => (
                  <div
                    key={option.label}
                    className={`rounded-2xl border-2 p-5 text-left transition-all ${
                      revealed
                        ? option.answer === "진실"
                          ? "border-success bg-success/10"
                          : "border-destructive bg-destructive/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-5xl text-accent">{option.label}</div>
                      {revealed && (
                        <div
                          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                            option.answer === "진실"
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }`}
                        >
                          {option.answer}
                        </div>
                      )}
                    </div>
                    <div
                      className="font-display text-3xl md:text-5xl mt-4 leading-tight"
                      style={{ textShadow: "0 0 30px rgba(249,115,22,0.25)" }}
                    >
                      "{option.statement}"
                    </div>
                  </div>
                ))}
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
