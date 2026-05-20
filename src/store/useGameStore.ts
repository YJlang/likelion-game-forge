import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { DEFAULT_TEAMS, type TeamId, type TeamMeta } from "@/data/teams";
import {
  createRemoteScoreBatch,
  isSupabaseConfigured,
  loadRemoteGameState,
  markRemoteItemUsed,
  resetRemoteEvent,
  resetRemoteUsedItems,
  subscribeToRemoteGameChanges,
  undoRemoteBatch,
} from "@/lib/gameRepository";

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

type UsedKind = "song" | "charade" | "reaction" | "truth";

interface State {
  eventId?: string;
  teams: TeamMeta[];
  teamDbIds: Partial<Record<TeamId, string>>;
  scores: Record<TeamId, number>;
  scoreLog: ScoreLogEntry[];
  mvpLog: MvpLogEntry[];
  correctCounts: Record<Exclude<GameKey, "singing">, Record<TeamId, number>>;
  usedSongIds: number[];
  usedCharadeIds: number[];
  usedReactionIds: number[];
  usedTruthIds: number[];
  lastSavedAt: number;
  syncStatus: "local" | "loading" | "synced" | "error";
  syncError?: string;
}

interface Actions {
  hydrateFromSupabase: () => Promise<void>;
  applyScores: (
    game: GameKey | "manual",
    entries: { team: TeamId; delta: number; reason: string; entryType?: ScoreEntryType }[],
  ) => Promise<string>;
  applyScoresWithMvp: (
    game: GameKey | "manual",
    entries: { team: TeamId; delta: number; reason: string; entryType?: ScoreEntryType }[],
    mvp?: { team: TeamId; player?: string },
  ) => Promise<string>;
  addMvp: (game: GameKey, team: TeamId, player?: string, scoreBatchId?: string) => Promise<void>;
  markUsed: (kind: UsedKind, id: number, team?: TeamId | null) => Promise<void>;
  resetUsed: (kind: UsedKind) => Promise<void>;
  resetAll: () => Promise<void>;
  manualAdjust: (team: TeamId, delta: number, reason: string) => Promise<void>;
  recordCorrect: (
    game: Exclude<GameKey, "singing">,
    team: TeamId,
    reason?: string,
  ) => Promise<void>;
  undoLastScoreBatch: () => Promise<boolean>;
}

export type ScoreEntryType = "correct" | "ranking" | "mvp" | "manual" | "penalty" | "crowd_bonus";

const uid = () => Math.random().toString(36).slice(2, 10);

const initialScores = DEFAULT_TEAMS.reduce(
  (acc, t) => {
    acc[t.id] = 0;
    return acc;
  },
  {} as Record<TeamId, number>,
);

const createTeamCounter = () => ({ ...initialScores });

const initial: State = {
  teams: DEFAULT_TEAMS,
  teamDbIds: {},
  scores: { ...initialScores },
  scoreLog: [],
  mvpLog: [],
  correctCounts: {
    jukebox: createTeamCounter(),
    charades: createTeamCounter(),
    truthlie: createTeamCounter(),
    reaction: createTeamCounter(),
  },
  usedSongIds: [],
  usedCharadeIds: [],
  usedReactionIds: [],
  usedTruthIds: [],
  lastSavedAt: Date.now(),
  syncStatus: isSupabaseConfigured ? "loading" : "local",
};

function calculateCorrectCounts(scoreLog: ScoreLogEntry[]): State["correctCounts"] {
  const counts: State["correctCounts"] = {
    jukebox: createTeamCounter(),
    charades: createTeamCounter(),
    truthlie: createTeamCounter(),
    reaction: createTeamCounter(),
  };

  for (const entry of scoreLog) {
    if (
      entry.game !== "manual" &&
      entry.game !== "singing" &&
      entry.reason.includes("정답") &&
      entry.delta > 0
    ) {
      counts[entry.game][entry.team] += entry.delta;
    }
  }

  return counts;
}

function usedKey(kind: UsedKind) {
  return {
    song: "usedSongIds",
    charade: "usedCharadeIds",
    reaction: "usedReactionIds",
    truth: "usedTruthIds",
  }[kind] as "usedSongIds" | "usedCharadeIds" | "usedReactionIds" | "usedTruthIds";
}

function applyLocalScores(
  state: State,
  game: GameKey | "manual",
  batchId: string,
  entries: { team: TeamId; delta: number; reason: string }[],
) {
  const scores = { ...state.scores };
  const at = Date.now();
  const scoreLog = [...state.scoreLog];

  for (const entry of entries) {
    scores[entry.team] = (scores[entry.team] ?? 0) + entry.delta;
    scoreLog.push({
      id: uid(),
      batchId,
      game,
      team: entry.team,
      delta: entry.delta,
      reason: entry.reason,
      at,
    });
  }

  return {
    scores,
    scoreLog,
    correctCounts: calculateCorrectCounts(scoreLog),
    lastSavedAt: at,
  };
}

async function refreshAfterRemoteWrite(set: (partial: Partial<State>) => void) {
  const remote = await loadRemoteGameState();
  set({ ...remote, correctCounts: calculateCorrectCounts(remote.scoreLog), syncStatus: "synced" });
}

export const useGameStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrateFromSupabase: async () => {
        if (!isSupabaseConfigured) {
          set({ syncStatus: "local", syncError: undefined });
          return;
        }

        set({ syncStatus: "loading", syncError: undefined });
        try {
          const remote = await loadRemoteGameState();
          set({
            ...remote,
            correctCounts: calculateCorrectCounts(remote.scoreLog),
            syncStatus: "synced",
            syncError: undefined,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Supabase 동기화 실패";
          set({ syncStatus: "error", syncError: message });
          toast.error(message);
        }
      },
      applyScores: async (game, entries) => {
        return get().applyScoresWithMvp(game, entries);
      },
      applyScoresWithMvp: async (game, entries, mvp) => {
        const batchId = uid();
        const state = get();

        if (isSupabaseConfigured && state.eventId) {
          const remoteBatchId = await createRemoteScoreBatch(
            state.eventId,
            state.teamDbIds as Record<TeamId, string>,
            game,
            entries,
            mvp && game !== "manual" ? { game, team: mvp.team, player: mvp.player } : undefined,
          );
          set((s) => {
            const next = applyLocalScores(s, game, remoteBatchId, entries);
            return mvp && game !== "manual"
              ? {
                  ...next,
                  mvpLog: [
                    ...s.mvpLog,
                    {
                      id: uid(),
                      scoreBatchId: remoteBatchId,
                      game,
                      team: mvp.team,
                      player: mvp.player,
                      at: Date.now(),
                    },
                  ],
                  syncStatus: "synced",
                  syncError: undefined,
                }
              : { ...next, syncStatus: "synced", syncError: undefined };
          });
          void refreshAfterRemoteWrite(set).catch((error) => {
            const message = error instanceof Error ? error.message : "Supabase 동기화 실패";
            set({ syncStatus: "error", syncError: message });
          });
          return remoteBatchId;
        }

        set((s) => {
          const next = applyLocalScores(s, game, batchId, entries);
          return mvp
            ? {
                ...next,
                mvpLog: [
                  ...s.mvpLog,
                  {
                    id: uid(),
                    scoreBatchId: batchId,
                    game: game === "manual" ? "jukebox" : game,
                    team: mvp.team,
                    player: mvp.player,
                    at: Date.now(),
                  },
                ],
              }
            : next;
        });
        return batchId;
      },
      addMvp: async (game, team, player, scoreBatchId) => {
        set((s) => ({
          mvpLog: [...s.mvpLog, { id: uid(), scoreBatchId, game, team, player, at: Date.now() }],
          lastSavedAt: Date.now(),
        }));
      },
      markUsed: async (kind, id, team) => {
        const state = get();
        const key = usedKey(kind);
        if (state[key].includes(id)) return;

        if (isSupabaseConfigured && state.eventId) {
          await markRemoteItemUsed(
            state.eventId,
            state.teamDbIds as Record<TeamId, string>,
            kind,
            id,
            team,
          );
          await refreshAfterRemoteWrite(set);
          return;
        }

        set((s) => ({ [key]: [...s[key], id], lastSavedAt: Date.now() }) as Partial<State>);
      },
      resetUsed: async (kind) => {
        const state = get();
        const key = usedKey(kind);

        if (isSupabaseConfigured && state.eventId) {
          await resetRemoteUsedItems(state.eventId, kind);
          await refreshAfterRemoteWrite(set);
          return;
        }

        set({ [key]: [], lastSavedAt: Date.now() } as Partial<State>);
      },
      resetAll: async () => {
        const state = get();

        if (isSupabaseConfigured && state.eventId) {
          await resetRemoteEvent(state.eventId);
          await refreshAfterRemoteWrite(set);
          return;
        }

        set({ ...initial, lastSavedAt: Date.now(), syncStatus: state.syncStatus });
      },
      manualAdjust: async (team, delta, reason) => {
        await get().applyScores("manual", [{ team, delta, reason, entryType: "manual" }]);
      },
      recordCorrect: async (game, team, reason = "정답 +1") => {
        await get().applyScores(game, [{ team, delta: 1, reason, entryType: "correct" }]);
      },
      undoLastScoreBatch: async () => {
        const state = get();
        const last = state.scoreLog.at(-1);
        if (!last?.batchId) return false;

        if (isSupabaseConfigured && state.eventId) {
          await undoRemoteBatch(last.batchId);
          await refreshAfterRemoteWrite(set);
          return true;
        }

        const entries = state.scoreLog.filter((entry) => entry.batchId === last.batchId);
        if (!entries.length) return false;
        const entryIds = new Set(entries.map((entry) => entry.id));

        set((s) => {
          const scores = { ...s.scores };
          for (const entry of entries) {
            scores[entry.team] = (scores[entry.team] ?? 0) - entry.delta;
          }
          const scoreLog = s.scoreLog.filter((entry) => !entryIds.has(entry.id));
          return {
            scores,
            scoreLog,
            correctCounts: calculateCorrectCounts(scoreLog),
            mvpLog: s.mvpLog.filter((entry) => entry.scoreBatchId !== last.batchId),
            lastSavedAt: Date.now(),
          };
        });
        return true;
      },
    }),
    {
      name: "mt-likelion-v1",
      partialize: (state) => ({
        eventId: state.eventId,
        teams: state.teams,
        teamDbIds: state.teamDbIds,
        scores: state.scores,
        scoreLog: state.scoreLog,
        mvpLog: state.mvpLog,
        correctCounts: state.correctCounts,
        usedSongIds: state.usedSongIds,
        usedCharadeIds: state.usedCharadeIds,
        usedReactionIds: state.usedReactionIds,
        usedTruthIds: state.usedTruthIds,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);

export function startSupabaseGameSync() {
  void useGameStore.getState().hydrateFromSupabase();
  return subscribeToRemoteGameChanges(() => {
    void useGameStore.getState().hydrateFromSupabase();
  });
}

export const REGULAR_POINTS = [4, 3, 2, 1];
export const SINGING_POINTS = [6, 4, 2, 1];
