import { useMemo, useState } from "react";
import { TEAMS, type TeamId, teamById } from "@/data/teams";
import { BigButton } from "./BigButton";
import { ConfirmModal } from "./ConfirmModal";
import { useGameStore, REGULAR_POINTS, SINGING_POINTS, GAME_LABEL, type GameKey } from "@/store/useGameStore";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  game: GameKey;
  /** When true, use singing point table */
  singing?: boolean;
}

/**
 * Generic results panel: ranking selectors + MVP + (singing-only) absent + crowd-fav.
 * Builds preview + applies via store.
 */
export function ResultsPanel({ game, singing = false }: Props) {
  const points = singing ? SINGING_POINTS : REGULAR_POINTS;
  const apply = useGameStore((s) => s.applyScores);
  const addMvp = useGameStore((s) => s.addMvp);

  const [ranks, setRanks] = useState<(TeamId | "")[]>(["", "", "", ""]);
  const [mvp, setMvp] = useState<TeamId | "">("");
  const [mvpPlayer, setMvpPlayer] = useState("");
  const [absent, setAbsent] = useState<Record<TeamId, boolean>>({
    team1: false, team2: false, team3: false, team4: false,
  });
  const [crowd, setCrowd] = useState<TeamId | "">("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const preview = useMemo(() => {
    const map: Record<TeamId, { delta: number; reasons: string[] }> = {
      team1: { delta: 0, reasons: [] },
      team2: { delta: 0, reasons: [] },
      team3: { delta: 0, reasons: [] },
      team4: { delta: 0, reasons: [] },
    };
    ranks.forEach((tid, i) => {
      if (!tid) return;
      if (singing && absent[tid]) return; // skip ranking for absent teams
      map[tid].delta += points[i];
      map[tid].reasons.push(`${i + 1}등 +${points[i]}`);
    });
    if (singing) {
      (Object.keys(absent) as TeamId[]).forEach((tid) => {
        if (absent[tid]) {
          map[tid].delta += -2;
          map[tid].reasons.push("불참 -2");
        }
      });
      if (crowd) {
        map[crowd].delta += 1;
        map[crowd].reasons.push("관객 호응 1등 +1");
      }
    }
    if (mvp) {
      map[mvp].delta += 1;
      map[mvp].reasons.push("MVP +1");
    }
    return map;
  }, [ranks, mvp, absent, crowd, singing, points]);

  const valid = ranks.every((r) => r) && new Set(ranks).size === 4;

  const handleApply = () => {
    const entries: { team: TeamId; delta: number; reason: string }[] = [];
    (Object.keys(preview) as TeamId[]).forEach((tid) => {
      if (preview[tid].delta !== 0) {
        entries.push({ team: tid, delta: preview[tid].delta, reason: preview[tid].reasons.join(" · ") });
      }
    });
    apply(game, entries);
    if (mvp) addMvp(game, mvp, mvpPlayer || undefined);
    toast.success(`${GAME_LABEL[game]} 점수가 반영됐습니다!`);
    if (singing) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ["#F97316", "#FACC15", "#22C55E"] });
    }
    setConfirmOpen(false);
    setRanks(["", "", "", ""]);
    setMvp("");
    setMvpPlayer("");
    setCrowd("");
    setAbsent({ team1: false, team2: false, team3: false, team4: false });
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">📥 점수 반영</h2>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {singing ? "노래 대회 점수 (6/4/2/1, 불참 -2, 호응 +1)" : "일반 게임 점수 (4/3/2/1, MVP +1)"}
        </span>
      </div>

      {/* Ranks */}
      <div className="grid md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              {i + 1}등 (+{points[i]})
            </label>
            <select
              className="mt-1 w-full h-12 rounded-lg bg-input border border-border px-3 text-foreground"
              value={ranks[i]}
              onChange={(e) => {
                const v = e.target.value as TeamId | "";
                setRanks((r) => r.map((x, idx) => (idx === i ? v : x)));
              }}
            >
              <option value="">선택</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name} {t.leader}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Singing extras */}
      {singing && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">불참 팀 (각 -2점)</div>
            <div className="flex flex-wrap gap-2">
              {TEAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAbsent((a) => ({ ...a, [t.id]: !a[t.id] }))}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    absent[t.id] ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card"
                  }`}
                >
                  {absent[t.id] ? "❌ " : "✅ "}{t.name} {t.leader}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">관객 호응 1등 (+1)</div>
            <select
              className="w-full h-12 rounded-lg bg-input border border-border px-3 text-foreground"
              value={crowd}
              onChange={(e) => setCrowd(e.target.value as TeamId | "")}
            >
              <option value="">선택 안 함</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* MVP */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">🌟 MVP 팀 (+1)</div>
          <select
            className="w-full h-12 rounded-lg bg-input border border-border px-3 text-foreground"
            value={mvp}
            onChange={(e) => setMvp(e.target.value as TeamId | "")}
          >
            <option value="">선택 안 함</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">MVP 플레이어 이름 (선택)</div>
          <input
            value={mvpPlayer}
            onChange={(e) => setMvpPlayer(e.target.value)}
            placeholder="예) 김소은"
            className="w-full h-12 rounded-lg bg-input border border-border px-3 text-foreground"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl bg-background/50 border-2 border-accent/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm uppercase tracking-widest text-accent font-bold">📊 점수 미리보기</div>
          <div className="text-xs text-muted-foreground">{valid ? "✅ 입력 완료" : "⚠️ 1~4등 모두 다른 팀으로 선택하세요"}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(preview) as TeamId[]).map((tid) => {
            const t = teamById(tid);
            const p = preview[tid];
            return (
              <div key={tid} className="rounded-xl bg-card p-4 border border-border">
                <div className="text-sm font-bold" style={{ color: `var(--${t.colorVar})` }}>{t.emoji} {t.name}</div>
                <div className={`font-display text-5xl tabular-nums mt-1 ${p.delta > 0 ? "text-success" : p.delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {p.delta > 0 ? "+" : ""}{p.delta}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-tight">
                  {p.reasons.join(", ") || "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BigButton size="xl" disabled={!valid} onClick={() => setConfirmOpen(true)} className="w-full">
        ✅ 점수 반영하기
      </BigButton>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="점수를 반영할까요?"
        description={
          <div className="space-y-3">
            <div className="text-muted-foreground">반영 후 점수판에 즉시 반영되며, 새로고침해도 유지됩니다.</div>
            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1">
              {(Object.keys(preview) as TeamId[]).filter((tid) => preview[tid].delta !== 0).map((tid) => {
                const t = teamById(tid);
                const p = preview[tid];
                return (
                  <div key={tid} className="flex items-center justify-between text-base">
                    <span className="font-bold">{t.emoji} {t.name}</span>
                    <span className={`font-display text-2xl tabular-nums ${p.delta > 0 ? "text-success" : "text-destructive"}`}>
                      {p.delta > 0 ? "+" : ""}{p.delta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        }
        confirmLabel="네, 반영"
        onConfirm={handleApply}
      />
    </div>
  );
}
