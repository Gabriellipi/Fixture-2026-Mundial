import { hasSupabaseEnv, supabase } from "../lib/supabase";

export async function loadRankingBoard() {
  if (!hasSupabaseEnv || !supabase) {
    return {
      profiles: [],
      predictions: [],
      diagnostics: {
        profilesOk: false,
        predictionsOk: false,
        profilesCount: 0,
        predictionsCount: 0,
        profilesError: "Supabase disabled",
        predictionsError: "Supabase disabled",
      },
    };
  }

  const [profilesResult, predictionsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, favorite_team, avatar_url"),
    supabase
      .from("predictions")
      .select("user_id, fixture_id, predicted_home_score, predicted_away_score, status, submitted_at, locked_at")
      .in("status", ["submitted", "locked"]),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (predictionsResult.error) {
    console.warn("Ranking predictions read failed; continuing with profile-only leaderboard.", predictionsResult.error.message);
  }

  return {
    profiles: profilesResult.data ?? [],
    predictions: predictionsResult.error ? [] : predictionsResult.data ?? [],
    diagnostics: {
      profilesOk: !profilesResult.error,
      predictionsOk: !predictionsResult.error,
      profilesCount: profilesResult.data?.length ?? 0,
      predictionsCount: predictionsResult.error ? 0 : predictionsResult.data?.length ?? 0,
      profilesError: profilesResult.error?.message ?? null,
      predictionsError: predictionsResult.error?.message ?? null,
    },
  };
}

export function createRankingPresenceChannel({ user, onSync }) {
  if (!hasSupabaseEnv || !supabase || !user?.id) {
    return () => {};
  }

  const channel = supabase.channel("ranking-online", {
    config: {
      presence: {
        key: user.id,
      },
    },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    const onlineIds = new Set(Object.keys(state));
    onSync?.(onlineIds);
  });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        id: user.id,
        joined_at: new Date().toISOString(),
        name: user.name ?? "Fan",
      });
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function createRankingRealtimeChannel(onChange) {
  if (!hasSupabaseEnv || !supabase) {
    return () => {};
  }

  const channel = supabase
    .channel("ranking-feed")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "predictions" },
      () => onChange?.(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      () => onChange?.(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
