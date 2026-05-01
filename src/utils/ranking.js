import { hasPredictionScore } from "./predictions";

function isMatchFinished(match) {
  return match?.status === "FINISHED" || match?.status === "FT" || match?.status === "AET";
}

function getScoredResult(match, prediction) {
  if (!isMatchFinished(match) || !match?.score || !hasPredictionScore(prediction)) {
    return null;
  }

  const ph = Number(prediction.home);
  const pa = Number(prediction.away);
  const ah = Number(match.score.home ?? 0);
  const aa = Number(match.score.away ?? 0);

  if (ph === ah && pa === aa) {
    return { result: "exact", points: 3 };
  }

  const predictedSign = ph > pa ? "H" : ph < pa ? "A" : "D";
  const actualSign = ah > aa ? "H" : ah < aa ? "A" : "D";

  if (predictedSign === actualSign) {
    return { result: "partial", points: 1 };
  }

  return { result: "miss", points: 0 };
}

function normalizePredictionRow(row) {
  return {
    home: row?.predicted_home_score?.toString?.() ?? "",
    away: row?.predicted_away_score?.toString?.() ?? "",
    status: row?.status ?? "draft",
    submittedAt: row?.submitted_at ?? null,
    lockedAt: row?.locked_at ?? null,
  };
}

function getDisplayName(profile, userId) {
  if (profile?.full_name?.trim()) {
    return profile.full_name.trim();
  }

  if (profile?.email?.includes("@")) {
    return profile.email.split("@")[0];
  }

  return `Fan ${String(userId).slice(0, 4)}`;
}

export function calculateUserRankingStats(matches, predictionRows = []) {
  const matchMap = new Map(matches.map((match) => [String(match.id), match]));
  const rowsWithScore = predictionRows.filter(
    (row) => row?.predicted_home_score !== null && row?.predicted_home_score !== undefined && row?.predicted_away_score !== null && row?.predicted_away_score !== undefined,
  );
  const submittedCount = rowsWithScore.filter((row) => row?.status === "submitted" || row?.status === "locked").length;
  const completion = matches.length > 0 ? Math.round((submittedCount / matches.length) * 100) : 0;

  const evaluated = rowsWithScore
    .map((row) => {
      const match = matchMap.get(String(row.fixture_id));
      return getScoredResult(match, normalizePredictionRow(row));
    })
    .filter(Boolean);

  const exact = evaluated.filter((item) => item.result === "exact").length;
  const partial = evaluated.filter((item) => item.result === "partial").length;
  const miss = evaluated.filter((item) => item.result === "miss").length;
  const officialPoints = evaluated.reduce((sum, item) => sum + item.points, 0);
  const accuracy = evaluated.length > 0 ? Math.round(((exact + partial) / evaluated.length) * 100) : 0;

  const evaluatedOrdered = rowsWithScore
    .map((row) => {
      const match = matchMap.get(String(row.fixture_id));
      return {
        row,
        match,
        result: getScoredResult(match, normalizePredictionRow(row)),
      };
    })
    .filter((item) => item.result && item.match)
    .sort((a, b) => `${b.match.dateIso}${b.match.time}`.localeCompare(`${a.match.dateIso}${a.match.time}`));

  let streak = 0;
  for (const item of evaluatedOrdered) {
    if (item.result.points > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  const hasOfficialResults = evaluated.length > 0;
  const score = hasOfficialResults ? officialPoints : 0;
  const movement = hasOfficialResults ? Math.max(0, exact + Math.min(streak, 3)) : 0;

  return {
    hasOfficialResults,
    saved: rowsWithScore.length,
    submitted: submittedCount,
    completion,
    exact,
    partial,
    miss,
    officialPoints,
    score,
    accuracy,
    streak,
    movement,
  };
}

export function buildRankingEntries({ matches, profiles = [], predictionRows = [], onlineIds = new Set(), currentUser = null }) {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const rowsByUser = predictionRows.reduce((acc, row) => {
    const key = row.user_id;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(row);
    return acc;
  }, new Map());

  const userIds = new Set([...profileMap.keys(), ...rowsByUser.keys()]);
  if (currentUser?.id) {
    userIds.add(currentUser.id);
  }

  const entries = [...userIds].map((userId) => {
    const profile = profileMap.get(userId) ?? null;
    const stats = calculateUserRankingStats(matches, rowsByUser.get(userId) ?? []);

    return {
      id: userId,
      name: currentUser?.id === userId ? currentUser.name : getDisplayName(profile, userId),
      favoriteTeam: profile?.favorite_team ?? (currentUser?.id === userId ? currentUser.favoriteTeam : null),
      avatar: profile?.avatar_url ?? (currentUser?.id === userId ? currentUser.avatar : ""),
      online: onlineIds.has(userId),
      isCurrentUser: currentUser?.id === userId,
      score: stats.score,
      officialPoints: stats.officialPoints,
      accuracy: stats.accuracy,
      exact: stats.exact,
      partial: stats.partial,
      miss: stats.miss,
      streak: stats.streak,
      movement: stats.movement,
      hasOfficialResults: stats.hasOfficialResults,
      submitted: stats.submitted,
      completion: stats.completion,
    };
  });

  return entries
    .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || b.exact - a.exact || a.name.localeCompare(b.name))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
