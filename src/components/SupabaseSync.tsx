import { useEffect } from "react";
import { startSupabaseGameSync, useGameStore } from "@/store/useGameStore";

export function SupabaseSync() {
  const syncStatus = useGameStore((s) => s.syncStatus);
  const syncError = useGameStore((s) => s.syncError);

  useEffect(() => startSupabaseGameSync(), []);

  if (syncStatus !== "error") return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-destructive/50 bg-destructive/15 px-4 py-3 text-sm text-destructive backdrop-blur">
      Supabase 동기화 실패: {syncError}
    </div>
  );
}
