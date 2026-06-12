import { useEffect, useMemo, useState } from "react";
import { hasSupabaseEnv } from "../lib/supabase";
import { getWorldCupFixturesByDate } from "../services/apiSports";
import { createRankingPresenceChannel, createRankingRealtimeChannel, loadRankingBoard } from "../services/ranking";
import { buildRankingEntries } from "../utils/ranking";

const RESULTS_REFRESH_MS = 5 * 60_000;
let resultsCache = { key: "", timestamp: 0, matches: [] };

function normalizeTeamName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function normalizeStatus(shortStatus) {
  if (shortStatus === "1H" || shortStatus === "2H" || shortStatus === "LIVE" || shortStatus === "ET" || shortStatus === "BT") {
    return "LIVE";
  }

  if (shortStatus === "HT") {
    return "HT";
  }

  if (shortStatus === "FT" || shortStatus === "AET" || shortStatus === "FINISHED") {
    return "FINISHED";
  }

  if (shortStatus === "PEN" || shortStatus === "P") {
    return "PEN";
  }

  return "SCHEDULED";
}

function getRelevantResultDates(matches) {
  const now = Date.now();
  const oneDayAhead = now + 24 * 60 * 60_000;

  return [
    ...new Set(
      matches
        .filter((match) => match.kickoffUtc && new Date(match.kickoffUtc).getTime() <= oneDayAhead)
        .map((match) => match.kickoffUtc.slice(0, 10)),
    ),
  ];
}

function mapOfficialFixture(fixture) {
  return {
    fixtureId: fixture.fixture?.id ?? null,
    date: fixture.fixture?.date?.slice(0, 10) ?? null,
    home: normalizeTeamName(fixture.teams?.home?.name),
    away: normalizeTeamName(fixture.teams?.away?.name),
    status: normalizeStatus(fixture.fixture?.status?.short),
    rawStatus: fixture.fixture?.status?.short ?? null,
    score: {
      home: fixture.goals?.home ?? fixture.score?.fulltime?.home ?? 0,
      away: fixture.goals?.away ?? fixture.score?.fulltime?.away ?? 0,
    },
  };
}

function mergeOfficialResults(matches, officialFixtures) {
  if (!officialFixtures.length) return matches;

  return matches.map((match) => {
    const localHome = normalizeTeamName(match.homeTeam?.name);
    const localAway = normalizeTeamName(match.awayTeam?.name);
    const localDate = match.kickoffUtc?.slice(0, 10);

    const official = officialFixtures.find((candidate) => {
      const sameTeams = candidate.home === localHome && candidate.away === localAway;
      const sameDate = !localDate || !candidate.date || candidate.date === localDate;
      return sameTeams && sameDate;
    });

    if (!official) return match;

    return {
      ...match,
      apiSportsFixtureId: official.fixtureId ?? match.apiSportsFixtureId ?? null,
      status: official.status,
      rawStatus: official.rawStatus,
      score: official.score,
    };
  });
}

async function loadOfficialResultMatches(matches) {
  const dates = getRelevantResultDates(matches);
  const cacheKey = dates.join(",");

  if (resultsCache.key === cacheKey && Date.now() - resultsCache.timestamp < RESULTS_REFRESH_MS) {
    return resultsCache.matches;
  }

  if (dates.length === 0) {
    return matches;
  }

  const payloads = await Promise.all(
    dates.map((date) => getWorldCupFixturesByDate({ season: 2026, date }).catch(() => ({ response: [] }))),
  );
  const officialFixtures = payloads.flatMap((payload) => payload.response ?? []).map(mapOfficialFixture);
  const merged = mergeOfficialResults(matches, officialFixtures);

  resultsCache = {
    key: cacheKey,
    timestamp: Date.now(),
    matches: merged,
  };

  return merged;
}

export function useRankingData({ matches, currentUser }) {
  const [profiles, setProfiles] = useState([]);
  const [predictionRows, setPredictionRows] = useState([]);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [officialMatches, setOfficialMatches] = useState(matches);
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
    let isMounted = true;

    async function refreshResults() {
      try {
        const nextMatches = await loadOfficialResultMatches(matches);
        if (isMounted) setOfficialMatches(nextMatches);
      } catch (nextError) {
        console.warn("Official result merge failed", nextError);
        if (isMounted) setOfficialMatches(matches);
      }
    }

    setOfficialMatches(matches);
    refreshResults();
    const intervalId = window.setInterval(refreshResults, RESULTS_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [matches]);

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
        if (!isMounted) return;
        setProfiles(result.profiles);
        setPredictionRows(result.predictions);
        setDiagnostics(result.diagnostics);
      } catch (nextError) {
        if (!isMounted) return;
        console.error("Ranking board load failed", nextError);
        setError(nextError);
        setDiagnostics((current) => ({
          ...current,
          profilesOk: false,
          profilesError: nextError.message ?? "Unknown error",
        }));
      } finally {
        if (isMounted) setLoading(false);
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
        matches: officialMatches,
        profiles,
        predictionRows,
        onlineIds,
        currentUser,
      }),
    [currentUser, officialMatches, onlineIds, predictionRows, profiles],
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
