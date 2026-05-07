import { createFileRoute } from "@tanstack/react-router";
import { GameHeader } from "@/components/GameHeader";
import { ResultsPanel } from "@/components/ResultsPanel";

export const Route = createFileRoute("/singing")({
  head: () => ({ meta: [{ title: "게임5. 노래 대회 — LIKELION MT" }] }),
  component: Singing,
});

function Singing() {
  return (
    <div className="space-y-8">
      <GameHeader
        title="게임5. 노래 대회"
        subtitle="🔥 가장 점수가 큰 중요 게임! 1등 +6, 불참 -2, 호응 1등 +1"
        badge={
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold animate-pulse-glow">
            🔥 중요 게임
          </span>
        }
        rules={
          <ul className="list-disc pl-5 space-y-1">
            <li>팀별로 노래를 부릅니다.</li>
            <li>아무도 안 나온 팀은 -2점 패널티.</li>
            <li>관객 호응 1등 팀은 +1점 보너스.</li>
            <li>1등 +6 / 2등 +4 / 3등 +2 / 4등 +1.</li>
          </ul>
        }
      />

      <div className="rounded-3xl border-2 border-primary bg-card p-6 glow-primary">
        <h3 className="font-display text-3xl">🎤 점수 규칙</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
          {[
            ["🥇 1등", "+6", "text-accent"],
            ["🥈 2등", "+4", ""],
            ["🥉 3등", "+2", ""],
            ["4️⃣ 4등", "+1", ""],
            ["❌ 불참", "-2", "text-destructive"],
            ["📣 호응", "+1", "text-success"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-xl bg-background/50 p-3 text-center">
              <div className="text-sm">{l}</div>
              <div className={`font-display text-3xl tabular-nums ${c}`}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <ResultsPanel game="singing" singing />
    </div>
  );
}
