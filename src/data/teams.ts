export type TeamId = "team1" | "team2" | "team3" | "team4";

export interface TeamMeta {
  id: TeamId;
  dbId?: string;
  name: string;
  leader: string;
  members: string[];
  colorVar: string; // tailwind color class suffix
  emoji: string;
}

export const DEFAULT_TEAMS: TeamMeta[] = [
  {
    id: "team1",
    name: "1팀",
    leader: "김소은",
    members: ["천병권", "고은우", "이혜원", "연혜빈", "최윤슬", "박정윤"],
    colorVar: "team-1",
    emoji: "🔥",
  },
  {
    id: "team2",
    name: "2팀",
    leader: "조준형",
    members: ["장하빈", "홍명철", "유승환", "김민서", "김유민", "권시우"],
    colorVar: "team-2",
    emoji: "💧",
  },
  {
    id: "team3",
    name: "3팀",
    leader: "조승민",
    members: ["김은송", "박준서", "최복순", "김나연", "김윤희", "박시언"],
    colorVar: "team-3",
    emoji: "🌿",
  },
  {
    id: "team4",
    name: "4팀",
    leader: "김민규",
    members: ["이현우", "유선영", "홍가은", "유수민", "이준범"],
    colorVar: "team-4",
    emoji: "⚡",
  },
];

export const TEAMS = DEFAULT_TEAMS;
export const teamById = (id: TeamId) => TEAMS.find((t) => t.id === id)!;
