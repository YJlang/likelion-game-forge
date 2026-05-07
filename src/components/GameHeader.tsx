import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  rules?: ReactNode;
  badge?: ReactNode;
  steps?: string[];
  currentStep?: number;
}

export function GameHeader({ title, subtitle, rules, badge, steps, currentStep = 0 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-end gap-4 justify-between">
        <div>
          {badge && <div className="mb-3">{badge}</div>}
          <h1 className="text-display text-6xl md:text-8xl text-foreground drop-shadow-[0_4px_20px_rgba(249,115,22,0.35)]">
            {title}
          </h1>
          {subtitle && <p className="text-muted-foreground text-xl md:text-2xl mt-3 font-semibold">{subtitle}</p>}
        </div>
        {rules && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border bg-card hover:bg-muted text-base font-bold"
          >
            📖 게임 룰 {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {steps && steps.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {steps.map((s, i) => {
            const active = i === currentStep;
            const done = i < currentStep;
            return (
              <div
                key={s}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                  active
                    ? "border-primary bg-primary/15 text-primary scale-105"
                    : done
                    ? "border-success/60 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="font-display text-base w-5 text-center">
                  {done ? "✓" : i + 1}
                </span>
                <span>{s}</span>
              </div>
            );
          })}
        </div>
      )}

      {open && rules && (
        <div className="mt-4 p-6 rounded-2xl border-2 border-primary/40 bg-card text-foreground/90 text-lg leading-relaxed">
          {rules}
        </div>
      )}
    </div>
  );
}
