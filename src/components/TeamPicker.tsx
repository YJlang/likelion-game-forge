import { TEAMS, type TeamId, teamById } from "@/data/teams";
import { cn } from "@/lib/utils";

interface Props {
  value: TeamId | null;
  onChange: (v: TeamId) => void;
  label?: string;
}

export function TeamPicker({ value, onChange, label = "참여 팀 선택" }: Props) {
  return (
    <div>
      <div className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
        {label}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEAMS.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                active
                  ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
                  : "border-border bg-card hover:border-muted-foreground",
              )}
              style={active ? { boxShadow: `0 0 30px -5px var(--${t.colorVar})` } : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: `var(--${t.colorVar})` }}
                />
                <div className="font-display text-xl">
                  {t.emoji} {t.name}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">팀장 {t.leader}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function teamColorStyle(id: TeamId): React.CSSProperties {
  return { background: `var(--${teamById(id).colorVar})` };
}
