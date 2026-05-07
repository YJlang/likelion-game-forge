import { Link } from "@tanstack/react-router";

const items = [
  { to: "/", label: "홈", emoji: "🏠" },
  { to: "/jukebox", label: "주크박스", emoji: "🎵" },
  { to: "/charades", label: "몸으로 말해요", emoji: "🤸" },
  { to: "/truthlie", label: "진실/거짓", emoji: "🤔" },
  { to: "/reaction", label: "반응 행동", emoji: "🎭" },
  { to: "/singing", label: "노래대회", emoji: "🎤" },
  { to: "/scoreboard", label: "점수판", emoji: "📊" },
  { to: "/final", label: "결과발표", emoji: "🏆" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-[1600px] px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl">
          <span className="text-primary">🦁</span>
          <span className="text-foreground">LIKELION</span>
          <span className="text-primary">MT</span>
        </Link>
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              activeOptions={{ exact: it.to === "/" }}
              activeProps={{
                className:
                  "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_var(--primary)]",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground hover:bg-card",
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <span>{it.emoji}</span>
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
