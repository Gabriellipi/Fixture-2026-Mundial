// Routes through backend proxy when VITE_MATCH_CENTER_API_BASE_URL is set,
// keeping the API key server-side and out of the bundle.
const PROXY_BASE = import.meta.env.VITE_MATCH_CENTER_API_BASE_URL;
const DIRECT_BASE = "https://v3.football.api-sports.io";

async function apiSportsRequest(path, params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

  if (PROXY_BASE) {
    const proxyPath = path === "/fixtures" ? "/api/fixtures" : "/api/standings";
    const url = new URL(`${PROXY_BASE}${proxyPath}`);
    Object.entries(filtered).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Proxy request failed: ${res.status}`);
    return res.json();
  }

  const apiKey = import.meta.env.VITE_API_SPORTS_KEY;
  if (!apiKey) throw new Error("Missing VITE_API_SPORTS_KEY and VITE_MATCH_CENTER_API_BASE_URL");

  const url = new URL(`${DIRECT_BASE}${path}`);
  Object.entries(filtered).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: { "x-apisports-key": apiKey } });
  if (!res.ok) throw new Error(`API-Sports request failed: ${res.status}`);
  return res.json();
}

export async function getWorldCupFixtures({ season = 2026, next = 10 } = {}) {
  return apiSportsRequest("/fixtures", { league: 1, season, next });
}

export async function getWorldCupFixturesByDate({ season = 2026, date } = {}) {
  return apiSportsRequest("/fixtures", { league: 1, season, date });
}

export async function getLiveWorldCupFixtures({ season = 2026 } = {}) {
  return apiSportsRequest("/fixtures", { league: 1, season, live: "all" });
}

export async function getWorldCupStandings({ season = 2026 } = {}) {
  return apiSportsRequest("/standings", { league: 1, season });
}

export async function getWorldCupTeams({ season = 2026 } = {}) {
  return apiSportsRequest("/fixtures", { league: 1, season });
}
