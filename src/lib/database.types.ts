export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Insert: { event_id: string; action_type: string; payload?: Json; created_at?: string };
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          status: string;
          starts_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      mvp_awards: {
        Row: {
          id: string;
          event_id: string;
          team_id: string;
          score_batch_id: string | null;
          game_key: string;
          player_name: string | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          team_id: string;
          score_batch_id?: string | null;
          game_key: string;
          player_name?: string | null;
        };
      };
      score_batches: {
        Row: {
          id: string;
          event_id: string;
          game_key: string;
          source: string;
          status: string;
          label: string | null;
          created_at: string;
          undone_at: string | null;
          undone_reason: string | null;
        };
        Insert: {
          event_id: string;
          game_key: string;
          source: string;
          status?: string;
          label?: string | null;
        };
        Update: {
          status?: string;
          undone_at?: string | null;
          undone_reason?: string | null;
        };
      };
      score_entries: {
        Insert: {
          event_id: string;
          batch_id: string;
          team_id: string;
          game_key: string;
          delta: number;
          reason: string;
          entry_type: string;
        };
      };
      team_members: {
        Row: { id: string; team_id: string; name: string; sort_order: number };
      };
      teams: {
        Row: {
          id: string;
          event_id: string;
          code: string;
          name: string;
          leader_name: string;
          emoji: string;
          color_var: string;
          sort_order: number;
          created_at: string;
        };
      };
      used_items: {
        Row: {
          id: string;
          event_id: string;
          team_id: string | null;
          item_kind: string;
          item_local_id: number;
          game_key: string;
          used_at: string;
        };
        Insert: {
          event_id: string;
          team_id?: string | null;
          item_kind: string;
          item_local_id: number;
          game_key: string;
        };
      };
    };
    Views: {
      active_score_entries: {
        Row: {
          id: string | null;
          event_id: string | null;
          batch_id: string | null;
          team_id: string | null;
          team_code: string | null;
          game_key: string | null;
          delta: number | null;
          reason: string | null;
          entry_type: string | null;
          created_at: string | null;
        };
      };
      current_scores: {
        Row: {
          event_id: string | null;
          team_id: string | null;
          team_code: string | null;
          team_name: string | null;
          leader_name: string | null;
          emoji: string | null;
          color_var: string | null;
          sort_order: number | null;
          score: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
