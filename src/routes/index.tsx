import { createFileRoute, Link } from "@tanstack/react-router";
import { SCHEDULE } from "@/data/schedule";
import { useGameStore } from "@/store/useGameStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIKELION MT GAME NIGHT — 홈" },
      {
        name: "description",
        content: "성결대 멋쟁이사자처럼 MT 레크레이션 대시보드. 진행 순서, 팀 정보, 점수 룰.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const scores = useGameStore((s) => s.scores);
  const teams = useGameStore((s) => s.teams);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const now = new Date();
    const idx = SCHEDULE.findIndex((s) => {
      const [sh, sm] = s.start.split(":").map(Number);
      const [eh, em] = s.end.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const t = now.getHours() * 60 + now.getMinutes();
      return t >= start && t < end;
    });
    setCurrentIndex(idx);
  }, []);

  const cur = currentIndex >= 0 ? SCHEDULE[currentIndex] : undefined;
  const next = currentIndex >= 0 ? SCHEDULE[currentIndex + 1] : SCHEDULE[0];

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-16 border border-border">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl animate-float">🦁</div>
          <div
            className="absolute bottom-10 right-16 text-8xl animate-float"
            style={{ animationDelay: "1s" }}
          >
            🎉
          </div>
          <div
            className="absolute top-1/2 left-1/2 text-7xl opacity-50 animate-float"
            style={{ animationDelay: "2s" }}
          >
            🎤
          </div>
        </div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary text-primary text-sm font-bold mb-4"
          >
            🦁 성결대 멋쟁이사자처럼 MT
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-display text-6xl md:text-8xl lg:text-9xl"
          >
            LIKELION
            <br />
            <span className="bg-clip-text text-transparent gradient-gold">MT GAME NIGHT</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-2xl md:text-3xl font-display text-accent"
          >
            4팀 중 최강의 팀은?
          </motion.p>
          <p className="mt-4 max-w-2xl text-lg text-foreground/80">
            PPT 없이 진행되는 실시간 MT 레크레이션 콘솔입니다. 랜덤 뽑기, 타이머, 점수판, 결과
            발표까지 한 화면에서 진행합니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/jukebox"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:brightness-110 transition shadow-glow"
            >
              🎵 게임 시작
            </Link>
            <Link
              to="/scoreboard"
              className="px-6 py-3 rounded-xl bg-card text-foreground font-bold text-lg border border-border hover:bg-muted transition"
            >
              📊 점수판 보기
            </Link>
          </div>
        </div>
      </section>

      {/* CURRENT / NEXT BADGE */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary bg-primary/10 p-6">
          <div className="text-xs uppercase tracking-widest text-primary font-bold">현재 진행</div>
          <div className="font-display text-3xl mt-1">{cur?.label ?? "대기 중"}</div>
          {cur && (
            <div className="text-muted-foreground mt-1">
              {cur.start} – {cur.end}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-widest text-accent font-bold">다음 게임</div>
          <div className="font-display text-3xl mt-1">{next?.label ?? "—"}</div>
          {next && (
            <div className="text-muted-foreground mt-1">
              {next.start} – {next.end}
            </div>
          )}
        </div>
      </section>

      {/* TIMELINE */}
      <section>
        <h2 className="font-display text-4xl mb-6">🗓 오늘의 진행 순서</h2>
        <div className="relative space-y-3">
          {SCHEDULE.map((s, i) => {
            const isCur = i === currentIndex;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 rounded-2xl p-4 border transition-all ${
                  isCur
                    ? "border-primary bg-primary/10 shadow-glow scale-[1.01]"
                    : s.kind === "break"
                      ? "border-dashed border-border bg-card/40"
                      : "border-border bg-card"
                }`}
              >
                <div className="font-display text-2xl text-accent w-32 shrink-0 tabular-nums">
                  {s.start}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{s.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.start} – {s.end}
                  </div>
                </div>
                {isCur && (
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold animate-pulse">
                    진행중
                  </span>
                )}
                {s.route && (
                  <Link
                    to={s.route}
                    className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-semibold hover:bg-muted"
                  >
                    이동 →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* TEAMS */}
      <section>
        <h2 className="font-display text-4xl mb-6">👥 참가 팀</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teams.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden"
            >
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
                style={{ background: `var(--${t.colorVar})` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="font-display text-3xl">
                    {t.emoji} {t.name}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">현재 점수</div>
                    <div className="font-display text-4xl text-accent tabular-nums">
                      {scores[t.id] ?? 0}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">팀장</div>
                <div className="font-bold text-lg" style={{ color: `var(--${t.colorVar})` }}>
                  {t.leader}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  팀원 ({t.members.length}명)
                </div>
                <div className="mt-1 text-sm leading-relaxed">{t.members.join(" · ")}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RULES */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-border p-6">
          <h3 className="font-display text-3xl">📏 일반 게임 점수 규칙</h3>
          <ul className="mt-4 space-y-2 text-lg">
            <li className="flex justify-between">
              <span>🥇 1등</span>
              <span className="font-display text-2xl text-accent">+4</span>
            </li>
            <li className="flex justify-between">
              <span>🥈 2등</span>
              <span className="font-display text-2xl">+3</span>
            </li>
            <li className="flex justify-between">
              <span>🥉 3등</span>
              <span className="font-display text-2xl">+2</span>
            </li>
            <li className="flex justify-between">
              <span>4️⃣ 4등</span>
              <span className="font-display text-2xl">+1</span>
            </li>
            <li className="flex justify-between border-t border-border pt-2 mt-2">
              <span>🌟 MVP 팀 보너스</span>
              <span className="font-display text-2xl text-primary">+1</span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            매 게임마다 “레전드 플레이어(MVP)” 1명을 선정해 그 팀에 +1 보너스를 줍니다.
          </p>
        </div>
        <div className="rounded-3xl border-2 border-primary p-6 relative overflow-hidden glow-primary bg-card">
          <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground animate-pulse-glow">
            🔥 중요 게임
          </div>
          <h3 className="font-display text-3xl">🎤 노래 대회 특별 점수</h3>
          <ul className="mt-4 space-y-2 text-lg">
            <li className="flex justify-between">
              <span>🥇 1등</span>
              <span className="font-display text-2xl text-accent">+6</span>
            </li>
            <li className="flex justify-between">
              <span>🥈 2등</span>
              <span className="font-display text-2xl">+4</span>
            </li>
            <li className="flex justify-between">
              <span>🥉 3등</span>
              <span className="font-display text-2xl">+2</span>
            </li>
            <li className="flex justify-between">
              <span>4️⃣ 4등</span>
              <span className="font-display text-2xl">+1</span>
            </li>
            <li className="flex justify-between text-destructive">
              <span>❌ 불참 팀</span>
              <span className="font-display text-2xl">-2</span>
            </li>
            <li className="flex justify-between text-success">
              <span>📣 관객 호응 1등</span>
              <span className="font-display text-2xl">+1</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
