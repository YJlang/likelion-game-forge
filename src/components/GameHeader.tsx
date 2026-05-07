import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  rules?: ReactNode;
  badge?: ReactNode;
}

export function GameHeader({ title, subtitle, rules, badge }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-end gap-4 justify-between">
        <div>
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="font-display text-5xl md:text-7xl text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-lg mt-2">{subtitle}</p>}
        </div>
        {rules && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-semibold"
          >
            게임 룰 {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {open && rules && (
        <div className="mt-4 p-6 rounded-2xl border border-border bg-card/60 text-foreground/90">{rules}</div>
      )}
    </div>
  );
}
