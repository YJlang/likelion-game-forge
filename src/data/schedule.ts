export interface ScheduleItem {
  id: string;
  start: string; // "19:10"
  end: string;   // "19:30"
  label: string;
  kind: "intro" | "game" | "break" | "final";
  route?: string;
}

export const SCHEDULE: ScheduleItem[] = [
  { id: "intro",  start: "19:10", end: "19:30", label: "팀 인사 + 레크 소개", kind: "intro" },
  { id: "g1",     start: "19:30", end: "19:45", label: "게임1. 노래 맞추기 주크박스", kind: "game", route: "/jukebox" },
  { id: "g2",     start: "19:45", end: "20:00", label: "게임2. 몸으로 말해요", kind: "game", route: "/charades" },
  { id: "break1", start: "20:00", end: "20:10", label: "쉬는 시간", kind: "break" },
  { id: "g3",     start: "20:10", end: "20:15", label: "게임3. 운영진 진실/거짓", kind: "game", route: "/truthlie" },
  { id: "g4",     start: "20:15", end: "20:30", label: "게임4. 반응으로 행동 맞추기", kind: "game", route: "/reaction" },
  { id: "g5",     start: "20:30", end: "20:50", label: "게임5. 노래 대회", kind: "game", route: "/singing" },
  { id: "break2", start: "20:50", end: "21:00", label: "쉬는 시간", kind: "break" },
  { id: "final",  start: "21:00", end: "23:59", label: "최종 1등 발표 + 자유시간", kind: "final", route: "/final" },
];
