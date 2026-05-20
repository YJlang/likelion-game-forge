import { createFileRoute } from "@tanstack/react-router";
import { type TeamId } from "@/data/teams";
import { useGameStore, GAME_LABEL } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BigButton } from "@/components/BigButton";
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
  const teams = useGameStore((s) => s.teams);
  const log = useGameStore((s) => s.scoreLog);
  const lastSavedAt = useGameStore((s) => s.lastSavedAt);
  const manualAdjust = useGameStore((s) => s.manualAdjust);
  const undoLastScoreBatch = useGameStore((s) => s.undoLastScoreBatch);
  const resetAll = useGameStore((s) => s.resetAll);
  const [confirming, setConfirming] = useState<"undo" | "reset" | null>(null);
  const [busyAction, setBusyAction] = useState<"undo" | "reset" | null>(null);
  const [expanded, setExpanded] = useState<TeamId | null>(null);
  const [savedTime, setSavedTime] = useState("동기화 중");

  const sorted = [...teams].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const lastEntry = log.at(-1);

  useEffect(() => {
    setSavedTime(new Date(lastSavedAt).toLocaleTimeString("ko-KR"));
  }, [lastSavedAt]);

  useEffect(() => {
    if (!confirming) return;
    const timeout = window.setTimeout(() => setConfirming(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [confirming]);

  const handleUndo = async () => {
    if (confirming !== "undo") {
      setConfirming("undo");
      return;
    }
    setBusyAction("undo");
    try {
      const ok = await undoLastScoreBatch();
      toast[ok ? "success" : "error"](
        ok ? "최근 점수 반영을 취소했습니다." : "취소할 점수 내역이 없습니다.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "최근 반영 취소 실패");
    } finally {
      setBusyAction(null);
      setConfirming(null);
    }
  };

  const handleReset = async () => {
    if (confirming !== "reset") {
      setConfirming("reset");
      return;
    }
    setBusyAction("reset");
    try {
      await resetAll();
      toast.success("초기화 완료");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "전체 초기화 실패");
    } finally {
      setBusyAction(null);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-6xl md:text-8xl">📊 실시간 점수판</h1>
          <p className="text-muted-foreground mt-2">자동 저장됨 · {savedTime}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BigButton
            variant="ghost"
            disabled={!lastEntry || Boolean(busyAction)}
            onClick={() => void handleUndo()}
          >
            {busyAction === "undo"
              ? "취소 중..."
              : confirming === "undo"
                ? "다시 누르면 최근 반영 취소"
                : "↩ 최근 반영 취소"}
          </BigButton>
          <BigButton
            variant="danger"
            disabled={Boolean(busyAction)}
            onClick={() => void handleReset()}
          >
            {busyAction === "reset"
              ? "초기화 중..."
              : confirming === "reset"
                ? "다시 누르면 전체 초기화"
                : "⚠️ 전체 초기화"}
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
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void manualAdjust(t.id, +1, "수동 +1")}
                  className="px-3 py-1.5 rounded-lg bg-success/20 text-success text-sm font-bold border border-success/40"
                >
                  +1
                </button>
                <button
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void manualAdjust(t.id, -1, "수동 -1")}
                  className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-sm font-bold border border-destructive/40"
                >
                  -1
                </button>
                <button
                  onMouseDown={(event) => event.preventDefault()}
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

      {confirming && (
        <div className="rounded-2xl border border-accent/50 bg-accent/10 px-5 py-4 text-sm font-semibold text-accent">
          {confirming === "reset"
            ? "전체 초기화는 되돌릴 수 없습니다. 5초 안에 초기화 버튼을 한 번 더 누르면 실행됩니다."
            : "최근 반영과 연결된 MVP 기록을 되돌립니다. 5초 안에 취소 버튼을 한 번 더 누르면 실행됩니다."}
        </div>
      )}
    </div>
  );
}
