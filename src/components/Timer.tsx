import { useEffect, useRef, useState, useCallback } from "react";
import { BigButton } from "./BigButton";

interface Props {
  durationSec?: number; // for countdown; if undefined -> stopwatch
  autoStart?: boolean;
  onComplete?: () => void;
  size?: "lg" | "xl" | "huge";
}

export function Timer({ durationSec, onComplete, size = "xl" }: Props) {
  const isCountdown = typeof durationSec === "number";
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsed(baseRef.current + (Date.now() - startRef.current));
    ref.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now();
      ref.current = requestAnimationFrame(tick);
    }
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [running, tick]);

  const remaining = isCountdown ? Math.max(0, durationSec! * 1000 - elapsed) : elapsed;
  const display = remaining;
  const m = Math.floor(display / 60000);
  const s = Math.floor((display % 60000) / 1000);
  const ms = Math.floor((display % 1000) / 100);

  useEffect(() => {
    if (isCountdown && remaining === 0 && running) {
      setRunning(false);
      baseRef.current = durationSec! * 1000;
      onComplete?.();
    }
  }, [remaining, isCountdown, running, onComplete, durationSec]);

  const toggle = () => {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      setRunning(true);
    }
  };
  const reset = () => {
    setRunning(false);
    baseRef.current = 0;
    setElapsed(0);
  };

  const danger = isCountdown && remaining < 30000;
  const sizeCls = size === "huge" ? "text-[180px]" : size === "xl" ? "text-[140px]" : "text-[96px]";

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`font-display tabular-nums ${sizeCls} leading-none ${
          danger ? "text-destructive animate-pulse" : "text-accent"
        }`}
        style={{ textShadow: "0 0 40px currentColor" }}
      >
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        <span className="text-muted-foreground text-[0.4em]">.{ms}</span>
      </div>
      <div className="flex gap-3">
        <BigButton size="lg" onClick={toggle} variant={running ? "accent" : "primary"}>
          {running ? "⏸ 일시정지" : "▶ 시작"}
        </BigButton>
        <BigButton size="lg" variant="ghost" onClick={reset}>↺ 리셋</BigButton>
      </div>
    </div>
  );
}

export function formatMs(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}
