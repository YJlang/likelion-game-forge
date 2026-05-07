import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TEAMS, type TeamId } from "@/data/teams";

export type GameKey = "jukebox" | "charades" | "truthlie" | "reaction" | "singing";

export const GAME_LABEL: Record<GameKey, string> = {
  jukebox: "게임1. 주크박스",
  charades: "게임2. 몸으로 말해요",
  truthlie: "게임3. 진실/거짓",
  reaction: "게임4. 반응 행동",
  singing: "게임5. 노래 대회",
};

export interface ScoreLogEntry {
  id: string;
  batchId?: string;
  game: GameKey | "manual";
  team: TeamId;
  delta: number;
  reason: string;
  at: number;
}

export interface MvpLogEntry {
  id: string;
  scoreBatchId?: string;
  game: GameKey;
  team: TeamId;
  player?: string;
  at: number;
}

interface State {
  scores: Record<TeamId, number>;
  scoreLog: ScoreLogEntry[];
  mvpLog: MvpLogEntry[];
  usedSongIds: number[];
  usedCharadeIds: number[];
  usedReactionIds: number[];
  usedTruthIds: number[];
  lastSavedAt: number;
}

interface Actions {
  applyScores: (
    game: GameKey | "manual",
    entries: { team: TeamId; delta: number; reason: string }[],
  ) => string;
  addMvp: (game: GameKey, team: TeamId, player?: string, scoreBatchId?: string) => void;
  markUsed: (kind: "song" | "charade" | "reaction" | "truth", id: number) => void;
  resetUsed: (kind: "song" | "charade" | "reaction" | "truth") => void;
  resetAll: () => void;
  manualAdjust: (team: TeamId, delta: number, reason: string) => void;
  undoLastScoreBatch: () => boolean;
}

const initialScores = TEAMS.reduce(
  (acc, t) => {
    acc[t.id] = 0;
    return acc;
  },
  {} as Record<TeamId, number>,
);

const initial: State = {
  scores: { ...initialScores },
  scoreLog: [],
  mvpLog: [],
  usedSongIds: [],
  usedCharadeIds: [],
  usedReactionIds: [],
  usedTruthIds: [],
  lastSavedAt: Date.now(),
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useGameStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,
      applyScores: (game, entries) => {
        const batchId = uid();
        set((s) => {
          const scores = { ...s.scores };
          const log = [...s.scoreLog];
          const at = Date.now();
          for (const e of entries) {
            scores[e.team] = (scores[e.team] ?? 0) + e.delta;
            log.push({
              id: uid(),
              batchId,
              game,
              team: e.team,
              delta: e.delta,
              reason: e.reason,
              at,
            });
          }
          return { scores, scoreLog: log, lastSavedAt: at };
        });
        return batchId;
      },
      addMvp: (game, team, player, scoreBatchId) =>
        set((s) => ({
          mvpLog: [...s.mvpLog, { id: uid(), scoreBatchId, game, team, player, at: Date.now() }],
          lastSavedAt: Date.now(),
        })),
      markUsed: (kind, id) =>
        set((s) => {
          const map = {
            song: "usedSongIds",
            charade: "usedCharadeIds",
            reaction: "usedReactionIds",
            truth: "usedTruthIds",
          } as const;
          const key = map[kind];
          const arr = s[key];
          if (arr.includes(id)) return s;
          return { [key]: [...arr, id], lastSavedAt: Date.now() } as Partial<State> as State;
        }),
      resetUsed: (kind) =>
        set(() => {
          const map = {
            song: "usedSongIds",
            charade: "usedCharadeIds",
            reaction: "usedReactionIds",
            truth: "usedTruthIds",
          } as const;
          return { [map[kind]]: [], lastSavedAt: Date.now() } as Partial<State> as State;
        }),
      resetAll: () => set({ ...initial, lastSavedAt: Date.now() }),
      manualAdjust: (team, delta, reason) =>
        set((s) => {
          const at = Date.now();
          const batchId = uid();
          return {
            scores: { ...s.scores, [team]: (s.scores[team] ?? 0) + delta },
            scoreLog: [
              ...s.scoreLog,
              { id: uid(), batchId, game: "manual", team, delta, reason, at },
            ],
            lastSavedAt: at,
          };
        }),
      undoLastScoreBatch: () => {
        let undone = false;
        set((s) => {
          const last = s.scoreLog.at(-1);
          if (!last) return s;

          const entries = last.batchId
            ? s.scoreLog.filter((entry) => entry.batchId === last.batchId)
            : s.scoreLog.filter((entry) => entry.at === last.at);

          if (!entries.length) return s;

          const entryIds = new Set(entries.map((entry) => entry.id));
          const batchId = last.batchId;
          const scores = { ...s.scores };

          for (const entry of entries) {
            scores[entry.team] = (scores[entry.team] ?? 0) - entry.delta;
          }

          undone = true;
          return {
            scores,
            scoreLog: s.scoreLog.filter((entry) => !entryIds.has(entry.id)),
            mvpLog: batchId ? s.mvpLog.filter((entry) => entry.scoreBatchId !== batchId) : s.mvpLog,
            lastSavedAt: Date.now(),
          };
        });
        return undone;
      },
    }),
    { name: "mt-likelion-v1" },
  ),
);

export const REGULAR_POINTS = [4, 3, 2, 1];
export const SINGING_POINTS = [6, 4, 2, 1];
