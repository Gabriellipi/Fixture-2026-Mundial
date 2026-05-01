import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv } from "../lib/supabase";
import { createRankingPresenceChannel, createRankingRealtimeChannel, loadRankingBoard } from "../services/ranking";
import { buildRankingEntries } from "../utils/ranking";

export function useRankingData({ matches, currentUser }) {
  const [profiles, setProfiles] = useState([]);
  const [predictionRows, setPredictionRows] = useState([]);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [loading, setLoading] = useState(hasSupabaseEnv);
  const [error, setError] = useState(null);
  const [diagnostics, setDiagnostics] = useState({
    profilesOk: false,
    predictionsOk: false,
    profilesCount: 0,
    predictionsCount: 0,
    profilesError: null,
    predictionsError: null,
  });

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    let refreshTimer = null;

    async function refreshBoard() {
      try {
        setError(null);
        const result = await loadRankingBoard();
        if (!isMounted) {
          return;
        }
        setProfiles(result.profiles);
        setPredictionRows(result.predictions);
        setDiagnostics(result.diagnostics);
      } catch (nextError) {
        if (!isMounted) {
          return;
        }
        console.error("Ranking board load failed", nextError);
        setError(nextError);
        setDiagnostics((current) => ({
          ...current,
          profilesOk: false,
          profilesError: nextError.message ?? "Unknown error",
        }));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshBoard();
      }, 350);
    };

    refreshBoard();

    const unsubscribePresence = createRankingPresenceChannel({
      user: currentUser,
      onSync: setOnlineIds,
    });
    const unsubscribeRealtime = createRankingRealtimeChannel(scheduleRefresh);

    return () => {
      isMounted = false;
      window.clearTimeout(refreshTimer);
      unsubscribePresence?.();
      unsubscribeRealtime?.();
    };
  }, [currentUser]);

  const entries = useMemo(
    () =>
      buildRankingEntries({
        matches,
        profiles,
        predictionRows,
        onlineIds,
        currentUser,
      }),
    [currentUser, matches, onlineIds, predictionRows, profiles],
  );

  return {
    entries,
    loading,
    error,
    diagnostics: {
      ...diagnostics,
      onlineCount: onlineIds.size,
    },
    realtimeEnabled: hasSupabaseEnv,
  };
}
