import { hasSupabaseEnv, supabase } from "../lib/supabase";

const LOCAL_STORAGE_KEY = "fixture-digital-2026-predictions";

function readLocalPredictions() {
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeLocalPredictions(predictions) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(predictions));
}

export async function ensurePredictionSession() {
  if (!hasSupabaseEnv || !supabase) {
    return { mode: "local", user: null };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return { mode: "supabase", user: session.user };
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.warn("Supabase anonymous auth is unavailable, falling back to local storage.");
    return { mode: "local", user: null };
  }

  return { mode: "supabase", user: data.user };
}

export async function loadStoredPredictions() {
  const sessionState = await ensurePredictionSession();

  if (sessionState.mode !== "supabase" || !sessionState.user) {
    return {
      mode: "local",
      predictions: readLocalPredictions(),
    };
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("fixture_id, predicted_home_score, predicted_away_score, status, submitted_at, locked_at")
    .order("fixture_id", { ascending: true });

  if (error) {
    console.warn("Supabase select failed, using local predictions instead.", error.message);
    return {
      mode: "local",
      predictions: readLocalPredictions(),
    };
  }

  const predictions = data.reduce((acc, row) => {
    acc[row.fixture_id] = {
      home: row.predicted_home_score?.toString() ?? "",
      away: row.predicted_away_score?.toString() ?? "",
      status: row.status ?? "draft",
      submittedAt: row.submitted_at ?? null,
      lockedAt: row.locked_at ?? null,
    };
    return acc;
  }, {});

  writeLocalPredictions(predictions);

  return {
    mode: "supabase",
    predictions,
  };
}

export async function persistPrediction(matchId, prediction, action = "draft") {
  const sessionState = await ensurePredictionSession();
  const localPredictions = readLocalPredictions();
  const nowIso = new Date().toISOString();
  const nextPrediction = {
    ...prediction,
    status: action === "submit" ? "submitted" : "draft",
    submittedAt: action === "submit" ? nowIso : prediction.submittedAt ?? null,
    lockedAt: prediction.lockedAt ?? null,
  };

  if (!prediction.home && !prediction.away) {
    delete localPredictions[matchId];
  } else {
    localPredictions[matchId] = nextPrediction;
  }

  writeLocalPredictions(localPredictions);

  if (sessionState.mode !== "supabase" || !sessionState.user) {
    return { mode: "local" };
  }

  if (!prediction.home && !prediction.away) {
    const { error } = await supabase.from("predictions").delete().eq("fixture_id", matchId);

    if (error) {
      throw error;
    }

    return { mode: "supabase" };
  }

  const payload = {
    fixture_id: matchId,
    user_id: sessionState.user.id,
    predicted_home_score: prediction.home === "" ? null : Number(prediction.home),
    predicted_away_score: prediction.away === "" ? null : Number(prediction.away),
    status: nextPrediction.status,
    submitted_at: nextPrediction.submittedAt,
    locked_at: nextPrediction.lockedAt,
  };

  const { error } = await supabase.from("predictions").upsert(payload, {
    onConflict: "user_id,fixture_id",
  });

  if (error) {
    throw error;
  }

  return { mode: "supabase" };
}
