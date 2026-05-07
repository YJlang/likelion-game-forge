import { createFileRoute } from "@tanstack/react-router";
import { TEAMS, teamById, type TeamId } from "@/data/teams";
import { useGameStore, GAME_LABEL } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BigButton } from "@/components/BigButton";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";

export const Route = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [
      { title: "실시간 점수판 — LIKELION MT" },
      { name: "description", content: "팀별 실시간 점수와 게임 내역" },
    ],
  }),
  component: Scoreboard,
});

function Scoreboard() {
  const scores = useGameStore((s) => s.scores);
  const log = useGameStore((s) => s.scoreLog);
  const lastSavedAt = useGameStore((s) => s.lastSavedAt);
  const manualAdjust = useGameStore((s) => s.manualAdjust);
  const undoLastScoreBatch = useGameStore((s) => s.undoLastScoreBatch);
  const resetAll = useGameStore((s) => s.resetAll);
  const [undoOpen, setUndoOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [expanded, setExpanded] = useState<TeamId | null>(null);

  const sorted = [...TEAMS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const savedTime = new Date(lastSavedAt).toLocaleTimeString("ko-KR");
  const lastEntry = log.at(-1);
  const lastBatchEntries = lastEntry
    ? lastEntry.batchId
      ? log.filter((entry) => entry.batchId === lastEntry.batchId)
      : log.filter((entry) => entry.at === lastEntry.at)
    : [];
  const lastBatchLabel = lastEntry
    ? lastEntry.game === "manual"
      ? "수동 조정"
      : GAME_LABEL[lastEntry.game]
    : "";

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-6xl md:text-8xl">📊 실시간 점수판</h1>
          <p className="text-muted-foreground mt-2">자동 저장됨 · {savedTime}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BigButton variant="ghost" disabled={!lastEntry} onClick={() => setUndoOpen(true)}>
            ↩ 최근 반영 취소
          </BigButton>
          <BigButton variant="danger" onClick={() => setResetOpen(true)}>
            ⚠️ 전체 초기화
          </BigButton>
        </div>
      </div>

      {/* Big ranking cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        {sorted.map((t, i) => {
          const isFirst = i === 0;
          return (
            <motion.div
              key={t.id}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative overflow-hidden rounded-3xl p-8 border-2 ${
                isFirst ? "border-accent glow-yellow bg-card" : "border-border bg-card"
              }`}
            >
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-2xl"
                style={{ background: `var(--${t.colorVar})` }}
              />
              <div className="relative flex items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-display text-5xl ${isFirst ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {isFirst ? "👑" : `${i + 1}위`}
                    </span>
                    <span className="font-display text-4xl">
                      {t.emoji} {t.name}
                    </span>
                  </div>
                  <div className="text-xl mt-1" style={{ color: `var(--${t.colorVar})` }}>
                    {t.leader}
                  </div>
                </div>
                <motion.div
                  key={scores[t.id]}
                  initial={{ scale: 1.4, color: "var(--accent)" }}
                  animate={{ scale: 1, color: "var(--foreground)" }}
                  className="font-display text-7xl md:text-9xl tabular-nums"
                  style={{
                    textShadow: isFirst ? "0 0 40px var(--accent)" : undefined,
                    color: isFirst ? "var(--accent)" : undefined,
                  }}
                >
                  {scores[t.id] ?? 0}
                </motion.div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => manualAdjust(t.id, +1, "수동 +1")}
                  className="px-3 py-1.5 rounded-lg bg-success/20 text-success text-sm font-bold border border-success/40"
                >
                  +1
                </button>
                <button
                  onClick={() => manualAdjust(t.id, -1, "수동 -1")}
                  className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-sm font-bold border border-destructive/40"
                >
                  -1
                </button>
                <button
                  onClick={() => setExpanded((p) => (p === t.id ? null : t.id))}
                  className="ml-auto px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-semibold"
                >
                  {expanded === t.id ? "내역 닫기" : "점수 내역 보기"}
                </button>
              </div>

              <AnimatePresence>
                {expanded === t.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="border-t border-border pt-3 space-y-1.5 text-sm max-h-64 overflow-y-auto">
                      {log
                        .filter((e) => e.team === t.id)
                        .slice()
                        .reverse()
                        .map((e) => (
                          <div key={e.id} className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                              {e.game === "manual" ? "수동" : GAME_LABEL[e.game]} · {e.reason}
                            </span>
                            <span
                              className={`font-display tabular-nums ${e.delta > 0 ? "text-success" : "text-destructive"}`}
                            >
                              {e.delta > 0 ? "+" : ""}
                              {e.delta}
                            </span>
                          </div>
                        ))}
                      {log.filter((e) => e.team === t.id).length === 0 && (
                        <div className="text-muted-foreground">아직 점수 내역이 없습니다.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <ConfirmModal
        open={undoOpen}
        onOpenChange={setUndoOpen}
        title="최근 점수 반영을 취소할까요?"
        description={
          <div className="space-y-3">
            <div className="text-muted-foreground">
              {lastBatchLabel || "최근 반영"} 항목을 되돌립니다. 연결된 MVP 기록도 함께 제거됩니다.
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1">
              {lastBatchEntries.map((entry) => {
                const t = teamById(entry.team);
                return (
                  <div key={entry.id} className="flex items-center justify-between text-base">
                    <span className="font-bold">
                      {t.emoji} {t.name}
                    </span>
                    <span
                      className={`font-display text-2xl tabular-nums ${
                        entry.delta > 0 ? "text-destructive" : "text-success"
                      }`}
                    >
                      {entry.delta > 0 ? "-" : "+"}
                      {Math.abs(entry.delta)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        }
        confirmLabel="네, 취소"
        onConfirm={() => {
          const ok = undoLastScoreBatch();
          toast[ok ? "success" : "error"](
            ok ? "최근 점수 반영을 취소했습니다." : "취소할 점수 내역이 없습니다.",
          );
          setUndoOpen(false);
        }}
      />

      <ConfirmModal
        open={resetOpen}
        onOpenChange={setResetOpen}
        variant="danger"
        title="모든 점수를 초기화할까요?"
        description="모든 팀 점수, 게임 기록, 사용된 항목, MVP 기록이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="네, 전부 초기화"
        onConfirm={() => {
          resetAll();
          toast.success("초기화 완료");
          setResetOpen(false);
        }}
      />
    </div>
  );
}
