import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 8787);
const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY ?? process.env.VITE_API_SPORTS_KEY ?? "";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS ?? 12_000);
const BASE_POLL_INTERVAL_MS = Number(process.env.MATCH_POLL_INTERVAL_MS ?? 60_000);
const CACHE_TTL_MS = Number(process.env.MATCH_CACHE_TTL_MS ?? 20_000);
const ACTIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]);

const matchStore = new Map();
const eventStore = new Map();
const matchTimers = new Map();
const sseClients = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(path, retries = 2) {
  if (!API_KEY) {
    const error = new Error("Missing API_FOOTBALL_KEY");
    error.statusCode = 500;
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`External API failed with status ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (retries > 0) {
      const delay = (3 - retries) * 750;
      await sleep(delay);
      return fetchJson(path, retries - 1);
    }

    if (error.name === "AbortError") {
      const timeoutError = new Error("External API timeout");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeMatchStatus(shortStatus) {
  if (ACTIVE_STATUSES.has(shortStatus)) {
    return "live";
  }

  if (shortStatus === "FT" || shortStatus === "AET" || shortStatus === "PEN") {
    return "finished";
  }

  return "pre-game";
}

function isGoalEvent(event) {
  const type = String(event.type ?? "").toLowerCase();
  const detail = String(event.detail ?? "").toLowerCase();
  return type === "goal" || detail.includes("goal") || detail.includes("penalty");
}

function normalizeEvent(event, fixture) {
  const detail = String(event.detail ?? "");
  const type =
    detail.includes("Yellow")
      ? "card"
      : detail.includes("Red")
        ? "card"
        : String(event.type ?? "").toLowerCase() === "subst"
          ? "substitution"
          : isGoalEvent(event)
            ? "goal"
            : "other";

  return {
    id: `${fixture.fixture.id}-${event.time?.elapsed ?? "?"}-${event.team?.id ?? "?"}-${event.player?.id ?? "?"}-${type}-${detail}`,
    fixture_id: fixture.fixture.id,
    minute: event.time?.elapsed ?? null,
    type,
    detail: detail || null,
    team_side: event.team?.id === fixture.teams.home?.id ? "home" : "away",
    team_id: event.team?.id ?? null,
    team_name: event.team?.name ?? null,
    player_id: event.player?.id ?? null,
    player_name: event.player?.name ?? null,
    assist_player_id: event.assist?.id ?? null,
    assist_player_name: event.assist?.name ?? null,
    is_goal: type === "goal",
    created_at: new Date().toISOString(),
  };
}

function readStatistic(statBlocks, type) {
  const homeStats = statBlocks?.[0]?.statistics ?? [];
  const awayStats = statBlocks?.[1]?.statistics ?? [];

  const homeRaw = homeStats.find((entry) => entry.type === type)?.value ?? 0;
  const awayRaw = awayStats.find((entry) => entry.type === type)?.value ?? 0;

  return {
    home: Number(String(homeRaw).replace("%", "")) || 0,
    away: Number(String(awayRaw).replace("%", "")) || 0,
  };
}

function normalizeFixtureBundle(fixtureJson, eventsJson, statisticsJson) {
  const fixture = fixtureJson.response?.[0];
  if (!fixture) {
    const error = new Error("Fixture not found");
    error.statusCode = 404;
    throw error;
  }

  const events = (eventsJson.response ?? []).map((event) => normalizeEvent(event, fixture));
  const goals = events.filter((event) => event.is_goal);
  const statistics = statisticsJson.response ?? [];

  return {
    match: {
      id: String(fixture.fixture.id),
      status: normalizeMatchStatus(fixture.fixture.status.short),
      raw_status: fixture.fixture.status.short,
      minute: fixture.fixture.status.elapsed ?? null,
      start_time: fixture.fixture.date,
      league_name: fixture.league?.name ?? null,
      round_name: fixture.league?.round ?? null,
      home_team: {
        id: fixture.teams.home?.id ?? null,
        name: fixture.teams.home?.name ?? null,
        logo: fixture.teams.home?.logo ?? null,
      },
      away_team: {
        id: fixture.teams.away?.id ?? null,
        name: fixture.teams.away?.name ?? null,
        logo: fixture.teams.away?.logo ?? null,
      },
      goals_home: fixture.goals.home ?? 0,
      goals_away: fixture.goals.away ?? 0,
      statistics: {
        possession: readStatistic(statistics, "Ball Possession"),
        shots_on_goal: readStatistic(statistics, "Shots on Goal"),
        total_shots: readStatistic(statistics, "Total Shots"),
      },
      last_goal: goals.at(-1) ?? null,
      updated_at: new Date().toISOString(),
    },
    events,
  };
}

function broadcastMatchEvent(matchId, payload) {
  const clients = sseClients.get(matchId);
  if (!clients?.size) {
    return;
  }

  const serialized = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((response) => response.write(serialized));
}

async function refreshMatch(matchId) {
  const current = matchStore.get(matchId);
  const now = Date.now();

  if (current && now - current.lastFetchedAt < CACHE_TTL_MS) {
    return current.data;
  }

  const [fixtureJson, eventsJson, statisticsJson] = await Promise.all([
    fetchJson(`/fixtures?id=${matchId}`),
    fetchJson(`/fixtures/events?fixture=${matchId}`),
    fetchJson(`/fixtures/statistics?fixture=${matchId}`),
  ]);

  const normalized = normalizeFixtureBundle(fixtureJson, eventsJson, statisticsJson);
  const previousEvents = eventStore.get(matchId) ?? [];
  const previousIds = new Set(previousEvents.map((event) => event.id));
  const newEvents = normalized.events.filter((event) => !previousIds.has(event.id));

  matchStore.set(matchId, { data: normalized.match, lastFetchedAt: now });
  eventStore.set(matchId, normalized.events);

  newEvents.forEach((event) => {
    broadcastMatchEvent(matchId, {
      kind: event.is_goal ? "goal" : "event",
      match_id: matchId,
      event,
      score: {
        home: normalized.match.goals_home,
        away: normalized.match.goals_away,
      },
      status: normalized.match.status,
      minute: normalized.match.minute,
    });
  });

  return normalized.match;
}

async function ensurePolling(matchId) {
  if (matchTimers.has(matchId)) {
    return;
  }

  const run = async () => {
    try {
      const match = await refreshMatch(matchId);
      if (match.status !== "live") {
        clearInterval(matchTimers.get(matchId));
        matchTimers.delete(matchId);
      }
    } catch (error) {
      console.error(`[match:${matchId}] refresh failed`, error.message);
    }
  };

  await run();
  const timer = setInterval(run, BASE_POLL_INTERVAL_MS);
  matchTimers.set(matchId, timer);
}

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

// Proxy endpoint — keeps API key server-side
app.get("/api/fixtures", async (request, response) => {
  try {
    const allowed = ["league", "season", "date", "next", "id", "live", "status", "round", "team"];
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(request.query)) {
      if (allowed.includes(k)) params.set(k, String(v));
    }
    const data = await fetchJson(`/fixtures?${params.toString()}`);
    response.json(data);
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.get("/api/standings", async (request, response) => {
  try {
    const { league = "1", season = "2026" } = request.query;
    const data = await fetchJson(`/standings?league=${league}&season=${season}`);
    response.json(data);
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.post("/matches/:id/watch", async (request, response) => {
  try {
    await ensurePolling(request.params.id);
    response.status(202).json({ ok: true, match_id: request.params.id });
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.get("/matches/:id", async (request, response) => {
  try {
    const match = await refreshMatch(request.params.id);
    if (match.status === "live") {
      await ensurePolling(request.params.id);
    }
    response.json(match);
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.get("/matches/:id/events", async (request, response) => {
  try {
    await refreshMatch(request.params.id);
    const typeFilter = request.query.type ? String(request.query.type) : null;
    const since = request.query.since ? String(request.query.since) : null;

    let events = eventStore.get(request.params.id) ?? [];

    if (typeFilter) {
      events = events.filter((event) => event.type === typeFilter);
    }

    if (since) {
      const sinceMinute = Number(since);
      if (!Number.isNaN(sinceMinute)) {
        events = events.filter((event) => (event.minute ?? -1) >= sinceMinute);
      } else {
        events = events.filter((event) => event.id !== since);
      }
    }

    response.json({
      match_id: request.params.id,
      count: events.length,
      events,
    });
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.get("/matches/:id/stream", async (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const matchId = request.params.id;
  const clients = sseClients.get(matchId) ?? new Set();
  clients.add(response);
  sseClients.set(matchId, clients);

  response.write(`data: ${JSON.stringify({ kind: "connected", match_id: matchId })}\n\n`);

  try {
    const match = await refreshMatch(matchId);
    response.write(`data: ${JSON.stringify({ kind: "snapshot", match })}\n\n`);
    if (match.status === "live") {
      await ensurePolling(matchId);
    }
  } catch (error) {
    response.write(`data: ${JSON.stringify({ kind: "error", message: error.message })}\n\n`);
  }

  request.on("close", () => {
    const activeClients = sseClients.get(matchId);
    if (!activeClients) {
      return;
    }
    activeClients.delete(response);
    if (activeClients.size === 0) {
      sseClients.delete(matchId);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Match center backend listening on http://localhost:${PORT}`);
});
