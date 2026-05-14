import { supabase, isSupabaseConfigured } from "./supabase";
import { DEFAULT_TEAMS, type TeamId, type TeamMeta } from "@/data/teams";
import type { GameKey, MvpLogEntry, ScoreLogEntry } from "@/store/useGameStore";

export const EVENT_SLUG = "likelion-mt-game-night";
export { isSupabaseConfigured };

type ItemKind = "song" | "charade" | "reaction" | "truth";
type ScoreSource = "correct" | "ranking" | "manual" | "reset" | "system";
type EntryType = "correct" | "ranking" | "mvp" | "manual" | "penalty" | "crowd_bonus";

export interface RemoteGameState {
  eventId: string;
  teams: TeamMeta[];
  teamDbIds: Record<TeamId, string>;
  scores: Record<TeamId, number>;
  scoreLog: ScoreLogEntry[];
  mvpLog: MvpLogEntry[];
  usedSongIds: number[];
  usedCharadeIds: number[];
  usedReactionIds: number[];
  usedTruthIds: number[];
  lastSavedAt: number;
}

const itemKindToGame: Record<ItemKind, Exclude<GameKey, "singing">> = {
  song: "jukebox",
  charade: "charades",
  reaction: "reaction",
  truth: "truthlie",
};

const emptyScores = () =>
  DEFAULT_TEAMS.reduce(
    (acc, team) => {
      acc[team.id] = 0;
      return acc;
    },
    {} as Record<TeamId, number>,
  );

function requireClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }
  return supabase;
}

function parseTeamId(code: string | null): TeamId | null {
  if (code === "team1" || code === "team2" || code === "team3" || code === "team4") return code;
  return null;
}

function parseGameKey(value: string | null): GameKey | "manual" {
  if (
    value === "jukebox" ||
    value === "charades" ||
    value === "truthlie" ||
    value === "reaction" ||
    value === "singing" ||
    value === "manual"
  ) {
    return value;
  }
  return "manual";
}

export async function loadRemoteGameState(): Promise<RemoteGameState> {
  const client = requireClient();
  const { data: event, error: eventError } = await client
    .from("events")
    .select("*")
    .eq("slug", EVENT_SLUG)
    .single();

  if (eventError) throw eventError;

  const [
    teamsResponse,
    membersResponse,
    scoresResponse,
    entriesResponse,
    batchesResponse,
    mvpResponse,
    usedResponse,
  ] = await Promise.all([
    client.from("teams").select("*").eq("event_id", event.id).order("sort_order"),
    client.from("team_members").select("*").order("sort_order"),
    client.from("current_scores").select("*").eq("event_id", event.id).order("sort_order"),
    client.from("active_score_entries").select("*").eq("event_id", event.id).order("created_at"),
    client
      .from("score_batches")
      .select("*")
      .eq("event_id", event.id)
      .eq("status", "active")
      .order("created_at"),
    client.from("mvp_awards").select("*").eq("event_id", event.id).order("created_at"),
    client.from("used_items").select("*").eq("event_id", event.id).order("used_at"),
  ]);

  for (const response of [
    teamsResponse,
    membersResponse,
    scoresResponse,
    entriesResponse,
    batchesResponse,
    mvpResponse,
    usedResponse,
  ]) {
    if (response.error) throw response.error;
  }

  const membersByTeamId = new Map<string, string[]>();
  for (const member of membersResponse.data ?? []) {
    const members = membersByTeamId.get(member.team_id) ?? [];
    members.push(member.name);
    membersByTeamId.set(member.team_id, members);
  }

  const teams: TeamMeta[] = (teamsResponse.data ?? []).map((team) => ({
    id: parseTeamId(team.code) ?? "team1",
    dbId: team.id,
    name: team.name,
    leader: team.leader_name,
    members: membersByTeamId.get(team.id) ?? [],
    colorVar: team.color_var,
    emoji: team.emoji,
  }));

  const teamDbIds = teams.reduce(
    (acc, team) => {
      if (team.dbId) acc[team.id] = team.dbId;
      return acc;
    },
    {} as Record<TeamId, string>,
  );

  const teamCodeByDbId = new Map(teams.map((team) => [team.dbId, team.id]));
  const scores = emptyScores();
  for (const score of scoresResponse.data ?? []) {
    const teamId = parseTeamId(score.team_code);
    if (teamId) scores[teamId] = score.score ?? 0;
  }

  const scoreLog: ScoreLogEntry[] = (entriesResponse.data ?? [])
    .map((entry) => {
      const team = parseTeamId(entry.team_code);
      if (!entry.id || !entry.batch_id || !team || !entry.created_at) return null;
      return {
        id: entry.id,
        batchId: entry.batch_id,
        game: parseGameKey(entry.game_key),
        team,
        delta: entry.delta ?? 0,
        reason: entry.reason ?? "",
        at: new Date(entry.created_at).getTime(),
      } satisfies ScoreLogEntry;
    })
    .filter((entry): entry is ScoreLogEntry => Boolean(entry));

  const activeBatchIds = new Set((batchesResponse.data ?? []).map((batch) => batch.id));
  const mvpLog: MvpLogEntry[] = (mvpResponse.data ?? [])
    .filter((mvp) => !mvp.score_batch_id || activeBatchIds.has(mvp.score_batch_id))
    .map((mvp) => {
      const team = teamCodeByDbId.get(mvp.team_id);
      if (!team) return null;
      return {
        id: mvp.id,
        scoreBatchId: mvp.score_batch_id ?? undefined,
        game: parseGameKey(mvp.game_key) as GameKey,
        team,
        player: mvp.player_name ?? undefined,
        at: new Date(mvp.created_at).getTime(),
      } satisfies MvpLogEntry;
    })
    .filter((entry): entry is MvpLogEntry => Boolean(entry));

  const usedByKind: Record<ItemKind, number[]> = {
    song: [],
    charade: [],
    reaction: [],
    truth: [],
  };
  for (const item of usedResponse.data ?? []) {
    if (
      item.item_kind === "song" ||
      item.item_kind === "charade" ||
      item.item_kind === "reaction" ||
      item.item_kind === "truth"
    ) {
      usedByKind[item.item_kind].push(item.item_local_id);
    }
  }

  const latestMs = Math.max(
    new Date(event.updated_at).getTime(),
    ...scoreLog.map((entry) => entry.at),
    ...mvpLog.map((entry) => entry.at),
    ...(usedResponse.data ?? []).map((entry) => new Date(entry.used_at).getTime()),
  );

  return {
    eventId: event.id,
    teams: teams.length ? teams : DEFAULT_TEAMS,
    teamDbIds,
    scores,
    scoreLog,
    mvpLog,
    usedSongIds: usedByKind.song,
    usedCharadeIds: usedByKind.charade,
    usedReactionIds: usedByKind.reaction,
    usedTruthIds: usedByKind.truth,
    lastSavedAt: Number.isFinite(latestMs) ? latestMs : Date.now(),
  };
}

function sourceForEntries(game: GameKey | "manual", entryType: EntryType): ScoreSource {
  if (game === "manual" || entryType === "manual") return "manual";
  if (entryType === "correct") return "correct";
  return "ranking";
}

export async function createRemoteScoreBatch(
  eventId: string,
  teamDbIds: Record<TeamId, string>,
  game: GameKey | "manual",
  entries: { team: TeamId; delta: number; reason: string; entryType?: EntryType }[],
  mvp?: { game: GameKey; team: TeamId; player?: string },
): Promise<string> {
  const client = requireClient();
  const firstEntryType = entries[0]?.entryType ?? "ranking";
  const { data: batch, error: batchError } = await client
    .from("score_batches")
    .insert({
      event_id: eventId,
      game_key: game,
      source: sourceForEntries(game, firstEntryType),
      label: game === "manual" ? "수동 조정" : null,
    })
    .select("id")
    .single();

  if (batchError) throw batchError;

  const rows = entries
    .filter((entry) => entry.delta !== 0)
    .map((entry) => ({
      event_id: eventId,
      batch_id: batch.id,
      team_id: teamDbIds[entry.team],
      game_key: game,
      delta: entry.delta,
      reason: entry.reason,
      entry_type: entry.entryType ?? "ranking",
    }));

  if (rows.length) {
    const { error } = await client.from("score_entries").insert(rows);
    if (error) throw error;
  }

  if (mvp) {
    const { error } = await client.from("mvp_awards").insert({
      event_id: eventId,
      score_batch_id: batch.id,
      game_key: mvp.game,
      team_id: teamDbIds[mvp.team],
      player_name: mvp.player ?? null,
    });
    if (error) throw error;
  }

  return batch.id;
}

export async function markRemoteItemUsed(
  eventId: string,
  teamDbIds: Record<TeamId, string>,
  kind: ItemKind,
  id: number,
  team?: TeamId | null,
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("used_items").insert({
    event_id: eventId,
    item_kind: kind,
    item_local_id: id,
    game_key: itemKindToGame[kind],
    team_id: team ? teamDbIds[team] : null,
  });

  if (error && error.code !== "23505") throw error;
}

export async function resetRemoteUsedItems(eventId: string, kind: ItemKind): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("used_items")
    .delete()
    .eq("event_id", eventId)
    .eq("item_kind", kind);
  if (error) throw error;
}

export async function undoRemoteBatch(batchId: string): Promise<void> {
  const client = requireClient();
  const { error: updateError } = await client
    .from("score_batches")
    .update({
      status: "undone",
      undone_at: new Date().toISOString(),
      undone_reason: "최근 반영 취소",
    })
    .eq("id", batchId);
  if (updateError) throw updateError;

  const { error: mvpError } = await client
    .from("mvp_awards")
    .delete()
    .eq("score_batch_id", batchId);
  if (mvpError) throw mvpError;
}

export async function resetRemoteEvent(eventId: string): Promise<void> {
  const client = requireClient();
  const now = new Date().toISOString();
  const { error: batchError } = await client
    .from("score_batches")
    .update({ status: "undone", undone_at: now, undone_reason: "전체 초기화" })
    .eq("event_id", eventId)
    .eq("status", "active");
  if (batchError) throw batchError;

  const { error: usedError } = await client.from("used_items").delete().eq("event_id", eventId);
  if (usedError) throw usedError;

  const { error: actionError } = await client.from("admin_actions").insert({
    event_id: eventId,
    action_type: "reset_all",
    payload: { at: now },
  });
  if (actionError) throw actionError;
}

export function subscribeToRemoteGameChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => undefined;

  const channel = supabase
    .channel("mt-game-console")
    .on("postgres_changes", { event: "*", schema: "public", table: "score_batches" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "score_entries" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "mvp_awards" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "used_items" }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
