import { useEffect, useState } from "react";
import {
  getMatchCenterEvents,
  getMatchCenterState,
  isInternalMatchCenterEnabled,
} from "../services/matchCenterApi";

// Polling interval (ms) — only active when a match is LIVE or HT.
const POLL_INTERVAL = 60_000;

function normalizeStatus(shortStatus) {
  if (
    shortStatus === "1H" ||
    shortStatus === "2H" ||
    shortStatus === "LIVE" ||
    shortStatus === "ET" ||
    shortStatus === "BT"
  ) {
    return "LIVE";
  }

  if (shortStatus === "HT") {
    return "HT";
  }

  if (shortStatus === "FT" || shortStatus === "AET" || shortStatus === "FINISHED") {
    return "FINISHED";
  }

  if (shortStatus === "PEN") {
    return "PEN";
  }

  return "SCHEDULED";
}

function normalizeEventType(event) {
  const detail = String(event.detail ?? "").toLowerCase();
  const type = String(event.type ?? "").toLowerCase();

  if (detail.includes("yellow")) {
    return "yellow-card";
  }

  if (detail.includes("red")) {
    return "red-card";
  }

  if (type === "subst") {
    return "substitution";
  }

  if (type === "var") {
    return "var";
  }

  if (detail.includes("penalty")) {
    return "penalty";
  }

  return "goal";
}

export async function fetchMatchStatus(matchId) {
  if (isInternalMatchCenterEnabled()) {
    try {
      const [match, eventsPayload] = await Promise.all([
        getMatchCenterState(matchId),
        getMatchCenterEvents(matchId),
      ]);

      const goalEvents = (eventsPayload.events ?? []).filter((event) => event.is_goal);

      return {
        status: normalizeStatus(match.raw_status ?? match.status),
        rawStatus: match.raw_status ?? match.status ?? null,
        minute: match.minute ?? null,
        score: {
          home: match.goals_home ?? 0,
          away: match.goals_away ?? 0,
        },
        events: eventsPayload.events ?? [],
        stats: {
          possession: match.statistics?.possession ?? { home: 0, away: 0 },
          shotsOnTarget: match.statistics?.shots_on_goal ?? { home: 0, away: 0 },
          corners: match.statistics?.corners ?? { home: 0, away: 0 },
        },
        lineups: null,
        lastGoal: goalEvents.at(-1) ?? null,
      };
    } catch {
      // fall back to direct API-Sports mode
    }
  }

  const key = import.meta.env.VITE_API_SPORTS_KEY;
  if (!key) return null;

  try {
    const headers = { "x-apisports-key": key };
    const [fixtureRes, eventsRes, statsRes, lineupsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, { headers }),
      fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`, { headers }),
      fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`, { headers }),
      fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`, { headers }),
    ]);

    if (!fixtureRes.ok) return null;
    const json = await fixtureRes.json();
    const fix = json.response?.[0];
    if (!fix) return null;

    const eventsJson = eventsRes.ok ? await eventsRes.json() : { response: [] };
    const statsJson = statsRes.ok ? await statsRes.json() : { response: [] };
    const lineupsJson = lineupsRes.ok ? await lineupsRes.json() : { response: [] };

    const events = (eventsJson.response ?? []).map((event, index) => ({
      id: `${matchId}-${event.time?.elapsed ?? "?"}-${event.type}-${index}`,
      type: normalizeEventType(event),
      team: event.team?.id === fix.teams.home?.id ? "home" : "away",
      minute: event.time?.elapsed ?? null,
      player: event.player?.name ?? null,
      assist: event.assist?.name ?? null,
      playerOut: event.type === "subst" ? event.comments ?? event.assist?.name ?? null : null,
      detail: event.detail ?? null,
    }));

    const homeStats = statsJson.response?.[0]?.statistics ?? [];
    const awayStats = statsJson.response?.[1]?.statistics ?? [];
    const lineupResponse = lineupsJson.response ?? [];
    const lineupByTeam = Object.fromEntries(
      lineupResponse.map((entry) => [
        entry.team?.id,
        {
          formation: entry.formation ?? null,
          starters: (entry.startXI ?? []).map((item) => item.player?.name).filter(Boolean),
          bench: (entry.substitutes ?? []).map((item) => item.player?.name).filter(Boolean),
        },
      ]),
    );
    const readStat = (name, fallback = 0) => {
      const home = homeStats.find((item) => item.type === name)?.value ?? fallback;
      const away = awayStats.find((item) => item.type === name)?.value ?? fallback;
      return {
        home: Number(String(home).replace("%", "")) || 0,
        away: Number(String(away).replace("%", "")) || 0,
      };
    };

    return {
      status: normalizeStatus(fix.fixture.status.short),
      rawStatus: fix.fixture.status.short, // NS | 1H | HT | 2H | FT | AET | PEN
      minute: fix.fixture.status.elapsed ?? null,
      score: {
        home: fix.goals.home ?? 0,
        away: fix.goals.away ?? 0,
      },
      events,
      stats: {
        possession: readStat("Ball Possession"),
        shotsOnTarget: readStat("Shots on Goal"),
        corners: readStat("Corner Kicks"),
      },
      lineups: {
        home: lineupByTeam[fix.teams.home?.id] ?? null,
        away: lineupByTeam[fix.teams.away?.id] ?? null,
      },
    };
  } catch {
    return null;
  }
}

export function useMatchStatus(matchId, initialData = null) {
  const [matchData, setMatchData] = useState(() => {
    if (!initialData) return null;
    return {
      ...initialData,
      status: normalizeStatus(initialData.status),
      rawStatus: initialData.rawStatus ?? initialData.status ?? null,
    };
  });

  useEffect(() => {
    if (!initialData) {
      setMatchData(null);
      return;
    }

    setMatchData({
      ...initialData,
      status: normalizeStatus(initialData.status),
      rawStatus: initialData.rawStatus ?? initialData.status ?? null,
    });
  }, [initialData]);

  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;
    const runInitialFetch = async () => {
      const updated = await fetchMatchStatus(matchId);
      if (!cancelled && updated) {
        setMatchData((current) => ({
          ...current,
          ...updated,
        }));
      }
    };

    runInitialFetch();

    const isActive =
      matchData?.status === "LIVE" ||
      matchData?.status === "HT";

    if (!isActive) {
      return () => {
        cancelled = true;
      };
    }

    const id = setInterval(async () => {
      const updated = await fetchMatchStatus(matchId);
      if (!cancelled && updated) setMatchData(updated);
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [matchId, matchData?.status]);

  const status = normalizeStatus(matchData?.status);
  const isLive = status === "LIVE";
  const isHalfTime = status === "HT";
  const isFinished = status === "FINISHED";
  const isPenalties = status === "PEN";
  const isScheduled = !isLive && !isHalfTime && !isFinished && !isPenalties;

  return { matchData, isLive, isHalfTime, isFinished, isScheduled, isPenalties };
}
